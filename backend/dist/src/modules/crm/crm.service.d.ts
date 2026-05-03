import { ConfigService } from '@nestjs/config';
import type { CrmFeedbackPayload, CrmOrderPayload, CrmRegistrationPayload } from './crm.types';
export declare class CrmService {
    private readonly config;
    private readonly logger;
    constructor(config: ConfigService);
    isEnabled(): boolean;
    getConnectionStatus(): {
        enabled: boolean;
        hasCredentials: boolean;
        baseUrl: string | null;
        hint?: string;
    };
    pushOrder(payload: CrmOrderPayload): Promise<void>;
    pushFeedbackRequest(payload: CrmFeedbackPayload): Promise<void>;
    pushRegistrationContact(payload: CrmRegistrationPayload): Promise<void>;
    private formatPhoneForEspo;
    private splitBuyerName;
    private ensureCampaignRecordId;
    private normalizeCrmBaseUrl;
    private getAuthBaseUrl;
    private getAuthHeader;
    private findContactIdByEmail;
    private postContact;
    private putContact;
    private postLead;
}
