import { CrmService } from './crm.service';
export declare class CrmController {
    private readonly crmService;
    constructor(crmService: CrmService);
    status(): {
        enabled: boolean;
        hasCredentials: boolean;
        baseUrl: string | null;
        hint?: string;
    };
}
