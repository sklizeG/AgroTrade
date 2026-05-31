import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { formatRussianPhoneForEspo } from '../../common/phone.util';
import { BpmsService } from '../bpms/bpms.service';import type {
  CrmFeedbackPayload,
  CrmOrderPayload,
  CrmRegistrationPayload,
} from './crm.types';

/** EspoCRM: у Lead нужен email и/или телефон; сумма — opportunityAmount; кампания — связь campaignId. */
@Injectable()
export class CrmService {
  private readonly logger = new Logger(CrmService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly bpmsService: BpmsService,
  ) {}

  /** true / 1 / yes (без учёта регистра) */
  isEnabled(): boolean {
    const raw = this.config.get<string>('CRM_ENABLED');
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
    hint?: string;
  } {
    const baseUrl = this.config.get<string>('CRM_BASE_URL')?.trim();
    const user = this.config.get<string>('CRM_USERNAME')?.trim();
    const pass = this.config.get<string>('CRM_PASSWORD')?.trim();
    const hasCredentials = Boolean(baseUrl && user && pass);

    let normalized: string | null = null;
    if (baseUrl) {
      try {
        normalized = this.normalizeCrmBaseUrl(baseUrl);
      } catch {
        normalized = null;
      }
    }

    const hint = !this.isEnabled()
      ? 'Включите CRM_ENABLED=true в backend/.env и перезапустите сервер.'
      : !hasCredentials
        ? 'Заполните CRM_BASE_URL, CRM_USERNAME, CRM_PASSWORD в backend/.env.'
        : baseUrl?.includes('localhost')
          ? 'Если запросы к CRM не доходят, попробуйте CRM_BASE_URL=http://127.0.0.1:8085 вместо localhost.'
          : undefined;

    return {
      enabled: this.isEnabled(),
      hasCredentials,
      baseUrl: normalized,
      hint,
    };
  }

  async pushOrder(payload: CrmOrderPayload): Promise<void> {
    const email = payload.buyerEmail?.trim() || '';
    const rawPhone = payload.buyerPhone?.trim() || '';
    const espPhone = this.resolvePhoneForCrm(rawPhone, 'order', payload.orderId);    const { firstName, lastName } = this.splitBuyerName(
      payload.buyerDisplayName,
      payload.buyerCompanyName,
      email,
    );

    const campaignId = await this.ensureCampaignRecordId(
      payload.campaignTitle,
    );

    const description = [
      `AgroTrade · ID заказа: ${payload.orderId}`,
      `Статус в системе: ${payload.status}`,
      `Объём: ${payload.volume}`,
    ].join('\n');

    const opportunityCurrency =
      this.config.get<string>('CRM_LEAD_CURRENCY')?.trim() || 'RUB';

    const lead: Record<string, unknown> = {
      firstName,
      lastName,
      opportunityAmount: payload.totalAmount,
      opportunityAmountCurrency: opportunityCurrency,
      description,
      agroOrderId: payload.orderId,
      agroOrderStatus: payload.status,
      agroOrderTotalAmount: payload.totalAmount,
      agroOrderVolume: payload.volume,
      agroBuyerEmail: email || null,
      agroBuyerPhone: rawPhone || null,
      agroCampaignTitle: payload.campaignTitle,
    };

    if (email) {
      lead.emailAddress = email;
    }
    if (espPhone) {
      lead.phoneNumber = espPhone;
    }
    if (!email && !espPhone) {
      lead.emailAddress = `order-${payload.orderId}@agrotrade.local`;
    }
    if (campaignId) {
      lead.campaignId = campaignId;
    }

    const leadId = await this.postLead(lead, 'order');
    if (leadId) {
      await this.bpmsService.startOrderProcess({
        leadId,
        orderId: payload.orderId,
        status: payload.status,
        totalAmount: payload.totalAmount,
        volume: payload.volume,
        buyerEmail: email,
        buyerPhone: rawPhone || null,
        buyerDisplayName: payload.buyerDisplayName,
        buyerCompanyName: payload.buyerCompanyName,
        campaignTitle: payload.campaignTitle,
      });
      return;
    }

    const existingLeadId = await this.findLeadIdByAgroOrderId(payload.orderId);
    if (existingLeadId) {
      this.logger.warn(
        `CRM: лид для заказа ${payload.orderId} уже существует (${existingLeadId}), запускаем BPMS.`,
      );
      await this.bpmsService.startOrderProcess({
        leadId: existingLeadId,
        orderId: payload.orderId,
        status: payload.status,
        totalAmount: payload.totalAmount,
        volume: payload.volume,
        buyerEmail: email,
        buyerPhone: rawPhone || null,
        buyerDisplayName: payload.buyerDisplayName,
        buyerCompanyName: payload.buyerCompanyName,
        campaignTitle: payload.campaignTitle,
      });
    }
  }

  async pushFeedbackRequest(payload: CrmFeedbackPayload): Promise<void> {
    const name = payload.name.trim();
    const description = [
      `AgroTrade · заявка с сайта`,
      `ID: ${payload.id}`,
      `Создана: ${payload.createdAt.toISOString()}`,
    ].join('\n');

    const espPhone = this.resolvePhoneForCrm(payload.phone, 'feedback', payload.id);    const body: Record<string, unknown> = {
      firstName: name,
      lastName: 'Заявка',
      description,
    };
    if (espPhone) {
      body.phoneNumber = espPhone;
    } else {
      body.emailAddress = `feedback-${payload.id}@agrotrade.local`;
    }

    await this.postLead(body, 'feedback');
  }

  /**
   * Создаёт или обновляет Contact в EspoCRM по email (дубли по email в приложении нет).
   */
  async pushRegistrationContact(payload: CrmRegistrationPayload): Promise<void> {
    if (!this.isEnabled()) {
      return;
    }

    const email = payload.email.trim().toLowerCase();
    if (!email) {
      return;
    }

    const rawPhone = payload.phone?.trim() || '';
    const espPhone = this.resolvePhoneForCrm(rawPhone, 'registration', payload.userId);    const { firstName, lastName } = this.splitBuyerName(
      payload.displayName,
      payload.companyName,
      email,
    );

    const roleLabel = payload.role === 'buyer' ? 'Покупатель' : 'Фермер';
    const descriptionLines = [
      'AgroTrade · регистрация пользователя',
      `ID в системе: ${payload.userId}`,
      `Роль: ${roleLabel}`,
    ];
    if (payload.buyerType) {
      descriptionLines.push(`Тип покупателя: ${payload.buyerType}`);
    }
    if (payload.taxId?.trim()) {
      descriptionLines.push(`ИНН (компания): ${payload.taxId.trim()}`);
    }
    if (payload.farmTaxId?.trim()) {
      descriptionLines.push(`ИНН хозяйства: ${payload.farmTaxId.trim()}`);
    }
    if (payload.pickupAddress?.trim()) {
      descriptionLines.push(`Самовывоз: ${payload.pickupAddress.trim()}`);
    }

    const body: Record<string, unknown> = {
      firstName,
      lastName,
      emailAddress: email,
      description: descriptionLines.join('\n'),
    };
    if (espPhone) {
      body.phoneNumber = espPhone;
    }
    const company = payload.companyName?.trim();
    if (company) {
      body.accountName = company;
    }

    const existingId = await this.findContactIdByEmail(email);
    if (existingId) {
      await this.putContact(existingId, body, 'registration');
    } else {
      await this.postContact(body, 'registration');
    }
  }

  /**
   * Проверка и нормализация телефона до отправки в EspoCRM.
   * Невалидный номер не попадает в phoneNumber (сырой остаётся в agroBuyerPhone / description).
   */
  private resolvePhoneForCrm(
    raw: string | null | undefined,
    kind: string,
    entityId: string,
  ): string | undefined {
    if (!raw?.trim()) {
      return undefined;
    }

    const formatted = formatRussianPhoneForEspo(raw);
    if (!formatted) {
      this.logger.warn(
        `CRM: телефон "${raw}" не прошёл проверку (${kind}, ${entityId}), phoneNumber не отправляется.`,
      );
    }

    return formatted;
  }

  private extractLeadIdFromResponse(text: string): string | null {
    try {
      const data = JSON.parse(text) as unknown;
      if (Array.isArray(data) && data[0] && typeof data[0] === 'object') {
        const id = (data[0] as { id?: string }).id;
        if (id) {
          return id;
        }
      }
      if (data && typeof data === 'object' && 'id' in data) {
        const id = (data as { id?: string }).id;
        if (id) {
          return id;
        }
      }
    } catch {
      /* ignore */
    }
    return null;
  }

  private async findLeadIdByAgroOrderId(
    orderId: string,
  ): Promise<string | undefined> {
    const baseUrl = this.getAuthBaseUrl();
    const auth = this.getAuthHeader();
    if (!baseUrl || !auth) {
      return undefined;
    }

    const where = [
      { type: 'equals', attribute: 'agroOrderId', value: orderId } as const,
    ];
    const searchUrl = `${baseUrl}/api/v1/Lead?maxSize=1&where=${encodeURIComponent(JSON.stringify(where))}`;

    try {
      const response = await fetch(searchUrl, {
        headers: { Authorization: auth },
      });
      if (!response.ok) {
        return undefined;
      }
      const data = (await response.json()) as { list?: { id: string }[] };
      return data.list?.[0]?.id;
    } catch {
      return undefined;
    }
  }

  /** Имя + фамилия для полей personName в EspoCRM. */
  private splitBuyerName(
    displayName: string,
    companyName: string | null | undefined,
    email: string,
  ): { firstName: string; lastName: string } {
    const d = displayName.trim();
    const company = companyName?.trim();
    const fromEmail = email.includes('@') ? email.split('@')[0]! : 'Клиент';

    if (!d) {
      return {
        firstName: fromEmail || 'Клиент',
        lastName: company || 'AgroTrade',
      };
    }

    const space = d.indexOf(' ');
    if (space === -1) {
      return {
        firstName: d,
        lastName: company || 'Клиент',
      };
    }

    const first = d.slice(0, space).trim();
    const last = d.slice(space + 1).trim();
    return {
      firstName: first || fromEmail,
      lastName: last || company || 'Клиент',
    };
  }

  /**
   * Находит или создаёт в EspoCRM запись Campaign с именем = название кампании AgroTrade,
   * чтобы заполнить стандартное поле «Кампания» у лида.
   */
  private async ensureCampaignRecordId(
    campaignTitle: string,
  ): Promise<string | undefined> {
    const title = campaignTitle.trim();
    if (!title) {
      return undefined;
    }

    const baseUrl = this.getAuthBaseUrl();
    if (!baseUrl) {
      return undefined;
    }

    const auth = this.getAuthHeader();
    if (!auth) {
      return undefined;
    }

    const headers = {
      Authorization: auth,
      'Content-Type': 'application/json',
    };

    const where = [
      { type: 'equals', attribute: 'name', value: title } as const,
    ];
    const searchUrl = `${baseUrl}/api/v1/Campaign?maxSize=1&where=${encodeURIComponent(JSON.stringify(where))}`;

    try {
      const found = await fetch(searchUrl, { headers });
      if (found.ok) {
        const data = (await found.json()) as { list?: { id: string }[] };
        const id = data.list?.[0]?.id;
        if (id) {
          return id;
        }
      }

      const created = await fetch(`${baseUrl}/api/v1/Campaign`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: title,
          status: 'Active',
          type: 'Web',
        }),
      });

      if (!created.ok) {
        const text = await created.text();
        this.logger.warn(
          `CRM: не удалось создать Campaign "${title}". HTTP ${created.status}: ${text.slice(0, 400)}`,
        );
        return undefined;
      }

      const row = (await created.json()) as { id: string };
      return row.id;
    } catch (e) {
      this.logger.warn(
        `CRM: ошибка при поиске/создании Campaign "${title}": ${e instanceof Error ? e.message : e}`,
      );
      return undefined;
    }
  }

  private normalizeCrmBaseUrl(raw: string): string {
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

  private getAuthBaseUrl(): string | null {
    const rawBase = this.config.get<string>('CRM_BASE_URL')?.trim();
    const user = this.config.get<string>('CRM_USERNAME')?.trim();
    const pass = this.config.get<string>('CRM_PASSWORD')?.trim();
    if (!rawBase || !user || !pass) {
      return null;
    }
    return this.normalizeCrmBaseUrl(rawBase);
  }

  private getAuthHeader(): string | null {
    const user = this.config.get<string>('CRM_USERNAME')?.trim();
    const pass = this.config.get<string>('CRM_PASSWORD')?.trim();
    if (!user || !pass) {
      return null;
    }
    return `Basic ${Buffer.from(`${user}:${pass}`).toString('base64')}`;
  }

  private async findContactIdByEmail(
    email: string,
  ): Promise<string | undefined> {
    const baseUrl = this.getAuthBaseUrl();
    const auth = this.getAuthHeader();
    if (!baseUrl || !auth) {
      return undefined;
    }

    const where = [
      { type: 'equals', attribute: 'emailAddress', value: email } as const,
    ];
    const searchUrl = `${baseUrl}/api/v1/Contact?maxSize=1&where=${encodeURIComponent(JSON.stringify(where))}`;

    try {
      const response = await fetch(searchUrl, {
        headers: { Authorization: auth },
      });
      if (!response.ok) {
        return undefined;
      }
      const data = (await response.json()) as { list?: { id: string }[] };
      return data.list?.[0]?.id;
    } catch {
      return undefined;
    }
  }

  private async postContact(
    body: Record<string, unknown>,
    kind: string,
  ): Promise<void> {
    if (!this.isEnabled()) {
      return;
    }

    const baseUrl = this.getAuthBaseUrl();
    const auth = this.getAuthHeader();

    if (!baseUrl || !auth) {
      this.logger.warn(
        'CRM: интеграция включена (CRM_ENABLED), но не заданы CRM_BASE_URL / CRM_USERNAME / CRM_PASSWORD.',
      );
      return;
    }

    const url = `${baseUrl}/api/v1/Contact`;

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
          `CRM: создание контакта не удалось (${kind}). POST ${url} -> HTTP ${response.status}: ${text.slice(0, 1200)}`,
        );
        return;
      }

      this.logger.log(`CRM: контакт создан (${kind}), HTTP ${response.status}`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      this.logger.error(`CRM: сеть или URL (${kind}). POST ${url} — ${msg}`);
    }
  }

  private async putContact(
    id: string,
    body: Record<string, unknown>,
    kind: string,
  ): Promise<void> {
    if (!this.isEnabled()) {
      return;
    }

    const baseUrl = this.getAuthBaseUrl();
    const auth = this.getAuthHeader();

    if (!baseUrl || !auth) {
      return;
    }

    const url = `${baseUrl}/api/v1/Contact/${id}`;

    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          Authorization: auth,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const text = await response.text();
        this.logger.error(
          `CRM: обновление контакта не удалось (${kind}). PUT ${url} -> HTTP ${response.status}: ${text.slice(0, 1200)}`,
        );
        return;
      }

      this.logger.log(
        `CRM: контакт обновлён (${kind}), HTTP ${response.status}`,
      );
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      this.logger.error(`CRM: сеть или URL (${kind}). PUT ${url} — ${msg}`);
    }
  }

  private async postLead(
    body: Record<string, unknown>,
    kind: 'order' | 'feedback',
  ): Promise<string | null> {
    if (!this.isEnabled()) {
      return null;
    }

    const baseUrl = this.getAuthBaseUrl();
    const auth = this.getAuthHeader();

    if (!baseUrl || !auth) {
      this.logger.warn(
        'CRM: интеграция включена (CRM_ENABLED), но не заданы CRM_BASE_URL / CRM_USERNAME / CRM_PASSWORD.',
      );
      return null;
    }

    const url = `${baseUrl}/api/v1/Lead`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: auth,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const data = (await response.json()) as { id?: string };
        this.logger.log(`CRM: лид создан (${kind}), HTTP ${response.status}`);
        return data.id ?? null;
      }

      const text = await response.text();

      const conflictId = this.extractLeadIdFromResponse(text);
      if (response.status === 409 && conflictId) {
        this.logger.warn(
          `CRM: лид уже существует (${kind}), id=${conflictId}.`,
        );
        return conflictId;
      }

      this.logger.error(
        `CRM: создание лида не удалось (${kind}). POST ${url} -> HTTP ${response.status}: ${text.slice(0, 1200)}`,
      );
      return null;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      this.logger.error(
        `CRM: сеть или URL (${kind}). POST ${url} — ${msg}`,
      );
      return null;
    }
  }
}
