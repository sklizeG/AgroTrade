"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var CrmService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrmService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let CrmService = CrmService_1 = class CrmService {
    config;
    logger = new common_1.Logger(CrmService_1.name);
    constructor(config) {
        this.config = config;
    }
    isEnabled() {
        const raw = this.config.get('CRM_ENABLED');
        if (raw === undefined || raw === null) {
            return false;
        }
        const v = String(raw).trim().toLowerCase();
        return v === 'true' || v === '1' || v === 'yes';
    }
    getConnectionStatus() {
        const baseUrl = this.config.get('CRM_BASE_URL')?.trim();
        const user = this.config.get('CRM_USERNAME')?.trim();
        const pass = this.config.get('CRM_PASSWORD')?.trim();
        const hasCredentials = Boolean(baseUrl && user && pass);
        let normalized = null;
        if (baseUrl) {
            try {
                normalized = this.normalizeCrmBaseUrl(baseUrl);
            }
            catch {
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
    async pushOrder(payload) {
        const email = payload.buyerEmail?.trim() || '';
        const rawPhone = payload.buyerPhone?.trim() || '';
        const espPhone = this.formatPhoneForEspo(rawPhone);
        const { firstName, lastName } = this.splitBuyerName(payload.buyerDisplayName, payload.buyerCompanyName, email);
        const campaignId = await this.ensureCampaignRecordId(payload.campaignTitle);
        const description = [
            `AgroTrade · ID заказа: ${payload.orderId}`,
            `Статус в системе: ${payload.status}`,
            `Объём: ${payload.volume}`,
        ].join('\n');
        const opportunityCurrency = this.config.get('CRM_LEAD_CURRENCY')?.trim() || 'RUB';
        const lead = {
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
        await this.postLead(lead, 'order');
    }
    async pushFeedbackRequest(payload) {
        const name = payload.name.trim();
        const description = [
            `AgroTrade · заявка с сайта`,
            `ID: ${payload.id}`,
            `Создана: ${payload.createdAt.toISOString()}`,
        ].join('\n');
        const espPhone = this.formatPhoneForEspo(payload.phone);
        const body = {
            firstName: name,
            lastName: 'Заявка',
            description,
        };
        if (espPhone) {
            body.phoneNumber = espPhone;
        }
        else {
            body.emailAddress = `feedback-${payload.id}@agrotrade.local`;
        }
        await this.postLead(body, 'feedback');
    }
    async pushRegistrationContact(payload) {
        if (!this.isEnabled()) {
            return;
        }
        const email = payload.email.trim().toLowerCase();
        if (!email) {
            return;
        }
        const rawPhone = payload.phone?.trim() || '';
        const espPhone = this.formatPhoneForEspo(rawPhone);
        const { firstName, lastName } = this.splitBuyerName(payload.displayName, payload.companyName, email);
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
        const body = {
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
        }
        else {
            await this.postContact(body, 'registration');
        }
    }
    formatPhoneForEspo(raw) {
        if (!raw?.trim()) {
            return undefined;
        }
        const digits = raw.replace(/\D/g, '');
        if (digits.length < 10 || digits.length > 15) {
            return undefined;
        }
        if (digits.length === 11 && digits.startsWith('8')) {
            return `+7${digits.slice(1)}`;
        }
        if (digits.length === 11 && digits.startsWith('7')) {
            return `+${digits}`;
        }
        if (digits.length === 10) {
            return `+7${digits}`;
        }
        return `+${digits}`;
    }
    splitBuyerName(displayName, companyName, email) {
        const d = displayName.trim();
        const company = companyName?.trim();
        const fromEmail = email.includes('@') ? email.split('@')[0] : 'Клиент';
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
    async ensureCampaignRecordId(campaignTitle) {
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
            { type: 'equals', attribute: 'name', value: title },
        ];
        const searchUrl = `${baseUrl}/api/v1/Campaign?maxSize=1&where=${encodeURIComponent(JSON.stringify(where))}`;
        try {
            const found = await fetch(searchUrl, { headers });
            if (found.ok) {
                const data = (await found.json());
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
                this.logger.warn(`CRM: не удалось создать Campaign "${title}". HTTP ${created.status}: ${text.slice(0, 400)}`);
                return undefined;
            }
            const row = (await created.json());
            return row.id;
        }
        catch (e) {
            this.logger.warn(`CRM: ошибка при поиске/создании Campaign "${title}": ${e instanceof Error ? e.message : e}`);
            return undefined;
        }
    }
    normalizeCrmBaseUrl(raw) {
        const trimmed = raw.replace(/\/$/, '');
        try {
            const u = new URL(trimmed);
            if (u.hostname === 'localhost') {
                u.hostname = '127.0.0.1';
            }
            return u.toString().replace(/\/$/, '');
        }
        catch {
            return trimmed;
        }
    }
    getAuthBaseUrl() {
        const rawBase = this.config.get('CRM_BASE_URL')?.trim();
        const user = this.config.get('CRM_USERNAME')?.trim();
        const pass = this.config.get('CRM_PASSWORD')?.trim();
        if (!rawBase || !user || !pass) {
            return null;
        }
        return this.normalizeCrmBaseUrl(rawBase);
    }
    getAuthHeader() {
        const user = this.config.get('CRM_USERNAME')?.trim();
        const pass = this.config.get('CRM_PASSWORD')?.trim();
        if (!user || !pass) {
            return null;
        }
        return `Basic ${Buffer.from(`${user}:${pass}`).toString('base64')}`;
    }
    async findContactIdByEmail(email) {
        const baseUrl = this.getAuthBaseUrl();
        const auth = this.getAuthHeader();
        if (!baseUrl || !auth) {
            return undefined;
        }
        const where = [
            { type: 'equals', attribute: 'emailAddress', value: email },
        ];
        const searchUrl = `${baseUrl}/api/v1/Contact?maxSize=1&where=${encodeURIComponent(JSON.stringify(where))}`;
        try {
            const response = await fetch(searchUrl, {
                headers: { Authorization: auth },
            });
            if (!response.ok) {
                return undefined;
            }
            const data = (await response.json());
            return data.list?.[0]?.id;
        }
        catch {
            return undefined;
        }
    }
    async postContact(body, kind) {
        if (!this.isEnabled()) {
            return;
        }
        const baseUrl = this.getAuthBaseUrl();
        const auth = this.getAuthHeader();
        if (!baseUrl || !auth) {
            this.logger.warn('CRM: интеграция включена (CRM_ENABLED), но не заданы CRM_BASE_URL / CRM_USERNAME / CRM_PASSWORD.');
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
                this.logger.error(`CRM: создание контакта не удалось (${kind}). POST ${url} -> HTTP ${response.status}: ${text.slice(0, 1200)}`);
                return;
            }
            this.logger.log(`CRM: контакт создан (${kind}), HTTP ${response.status}`);
        }
        catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            this.logger.error(`CRM: сеть или URL (${kind}). POST ${url} — ${msg}`);
        }
    }
    async putContact(id, body, kind) {
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
                this.logger.error(`CRM: обновление контакта не удалось (${kind}). PUT ${url} -> HTTP ${response.status}: ${text.slice(0, 1200)}`);
                return;
            }
            this.logger.log(`CRM: контакт обновлён (${kind}), HTTP ${response.status}`);
        }
        catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            this.logger.error(`CRM: сеть или URL (${kind}). PUT ${url} — ${msg}`);
        }
    }
    async postLead(body, kind) {
        if (!this.isEnabled()) {
            return;
        }
        const baseUrl = this.getAuthBaseUrl();
        const auth = this.getAuthHeader();
        if (!baseUrl || !auth) {
            this.logger.warn('CRM: интеграция включена (CRM_ENABLED), но не заданы CRM_BASE_URL / CRM_USERNAME / CRM_PASSWORD.');
            return;
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
            if (!response.ok) {
                const text = await response.text();
                this.logger.error(`CRM: создание лида не удалось (${kind}). POST ${url} -> HTTP ${response.status}: ${text.slice(0, 1200)}`);
                return;
            }
            this.logger.log(`CRM: лид создан (${kind}), HTTP ${response.status}`);
        }
        catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            this.logger.error(`CRM: сеть или URL (${kind}). POST ${url} — ${msg}`);
        }
    }
};
exports.CrmService = CrmService;
exports.CrmService = CrmService = CrmService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], CrmService);
//# sourceMappingURL=crm.service.js.map