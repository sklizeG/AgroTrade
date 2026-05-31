import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { BpmsOrderProcessPayload } from './bpms.types';

@Injectable()
export class BpmsService {
  private readonly logger = new Logger(BpmsService.name);

  constructor(private readonly config: ConfigService) {}

  isEnabled(): boolean {
    const raw = this.config.get<string>('BPMS_ENABLED');
    if (raw === undefined || raw === null) {
      return false;
    }
    const v = String(raw).trim().toLowerCase();
    return v === 'true' || v === '1' || v === 'yes';
  }

  getConnectionStatus(): {
    enabled: boolean;
    hasCredentials: boolean;
    baseUrl: string | null;
    processKey: string;
    hint?: string;
  } {
    const baseUrl = this.config.get<string>('BPMS_BASE_URL')?.trim();
    const user = this.config.get<string>('BPMS_USERNAME')?.trim();
    const pass = this.config.get<string>('BPMS_PASSWORD')?.trim();
    const processKey =
      this.config.get<string>('BPMS_PROCESS_KEY')?.trim() || 'OrderProcessing';
    const hasCredentials = Boolean(baseUrl && user && pass);

    let normalized: string | null = null;
    if (baseUrl) {
      try {
        normalized = this.normalizeBaseUrl(baseUrl);
      } catch {
        normalized = null;
      }
    }

    const hint = !this.isEnabled()
      ? 'Включите BPMS_ENABLED=true в backend/.env и перезапустите сервер.'
      : !hasCredentials
        ? 'Заполните BPMS_BASE_URL, BPMS_USERNAME, BPMS_PASSWORD.'
        : !normalized
          ? 'BPMS_BASE_URL имеет неверный формат.'
          : undefined;

    return {
      enabled: this.isEnabled(),
      hasCredentials,
      baseUrl: normalized,
      processKey,
      hint,
    };
  }

  /**
   * Запуск процесса «Обработка заказа» после создания Lead в CRM (бонус ПР-06: CRM→BPMS).
   */
  async startOrderProcess(payload: BpmsOrderProcessPayload): Promise<void> {
    if (!this.isEnabled()) {
      return;
    }

    const baseUrl = this.getEngineBaseUrl();
    const auth = this.getAuthHeader();
    const processKey =
      this.config.get<string>('BPMS_PROCESS_KEY')?.trim() || 'OrderProcessing';

    if (!baseUrl || !auth) {
      this.logger.warn(
        'BPMS: интеграция включена, но не заданы BPMS_BASE_URL / BPMS_USERNAME / BPMS_PASSWORD.',
      );
      return;
    }

    const url = `${baseUrl}/process-definition/key/${encodeURIComponent(processKey)}/start`;
    const body = {
      businessKey: `order-${payload.orderId}`,
      variables: {
        leadId: { value: payload.leadId, type: 'String' },
        orderId: { value: payload.orderId, type: 'String' },
        status: { value: payload.status, type: 'String' },
        totalAmount: { value: payload.totalAmount, type: 'Double' },
        volume: { value: payload.volume, type: 'Double' },
        buyerEmail: { value: payload.buyerEmail, type: 'String' },
        buyerPhone: {
          value: payload.buyerPhone?.trim() || '',
          type: 'String',
        },
        buyerDisplayName: { value: payload.buyerDisplayName, type: 'String' },
        buyerCompanyName: {
          value: payload.buyerCompanyName?.trim() || '',
          type: 'String',
        },
        campaignTitle: { value: payload.campaignTitle, type: 'String' },
      },
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: auth,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const text = await response.text();
        this.logger.error(
          `BPMS: не удалось запустить процесс ${processKey} для заказа ${payload.orderId}. HTTP ${response.status}: ${text.slice(0, 1200)}`,
        );
        return;
      }

      const data = (await response.json()) as { id?: string };
      this.logger.log(
        `BPMS: процесс ${processKey} запущен для заказа ${payload.orderId} (instance ${data.id ?? '?'})`,
      );
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      this.logger.error(
        `BPMS: сеть или URL при старте процесса заказа ${payload.orderId}: ${msg}`,
      );
    }
  }

  /** Обновляет переменную status в активных экземплярах OrderProcessing (после mock-оплаты и т.п.). */
  async syncOrderStatus(orderId: string, status: string): Promise<void> {
    if (!this.isEnabled()) {
      return;
    }

    const baseUrl = this.getEngineBaseUrl();
    const auth = this.getAuthHeader();
    if (!baseUrl || !auth) {
      this.logger.warn(
        'BPMS: syncOrderStatus — нет BPMS_BASE_URL / учётных данных.',
      );
      return;
    }

    const businessKey = `order-${orderId}`;
    const headers = {
      Authorization: auth,
      'Content-Type': 'application/json',
    };

    try {
      const listUrl = `${baseUrl}/process-instance?businessKey=${encodeURIComponent(businessKey)}&active=true`;
      const listRes = await fetch(listUrl, { headers });
      if (!listRes.ok) {
        const text = await listRes.text();
        this.logger.error(
          `BPMS: не удалось найти процесс для заказа ${orderId}. HTTP ${listRes.status}: ${text.slice(0, 400)}`,
        );
        return;
      }

      const instances = (await listRes.json()) as { id: string }[];
      if (!instances.length) {
        this.logger.warn(
          `BPMS: активный процесс с businessKey ${businessKey} не найден.`,
        );
        return;
      }

      for (const instance of instances) {
        const varUrl = `${baseUrl}/process-instance/${instance.id}/variables/status`;
        const varRes = await fetch(varUrl, {
          method: 'PUT',
          headers,
          body: JSON.stringify({ value: status, type: 'String' }),
        });

        if (!varRes.ok) {
          const text = await varRes.text();
          this.logger.error(
            `BPMS: не удалось обновить status для ${instance.id}. HTTP ${varRes.status}: ${text.slice(0, 400)}`,
          );
          continue;
        }

        this.logger.log(
          `BPMS: status=${status} для заказа ${orderId} (instance ${instance.id})`,
        );
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      this.logger.error(
        `BPMS: syncOrderStatus для заказа ${orderId}: ${msg}`,
      );
    }
  }

  private normalizeBaseUrl(raw: string): string {
    const trimmed = raw.replace(/\/$/, '');
    try {
      const u = new URL(trimmed);
      if (u.hostname === 'localhost') {
        u.hostname = '127.0.0.1';
      }
      return u.toString().replace(/\/$/, '');
    } catch {
      return trimmed;
    }
  }

  private getEngineBaseUrl(): string | null {
    const rawBase = this.config.get<string>('BPMS_BASE_URL')?.trim();
    const user = this.config.get<string>('BPMS_USERNAME')?.trim();
    const pass = this.config.get<string>('BPMS_PASSWORD')?.trim();
    if (!rawBase || !user || !pass) {
      return null;
    }
    const root = this.normalizeBaseUrl(rawBase);
    return `${root}/engine-rest`;
  }

  private getAuthHeader(): string | null {
    const user = this.config.get<string>('BPMS_USERNAME')?.trim();
    const pass = this.config.get<string>('BPMS_PASSWORD')?.trim();
    if (!user || !pass) {
      return null;
    }
    return `Basic ${Buffer.from(`${user}:${pass}`).toString('base64')}`;
  }
}
