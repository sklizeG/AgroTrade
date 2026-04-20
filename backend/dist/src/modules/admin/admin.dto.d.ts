import { CAMPAIGN_STATUSES, ORDER_STATUSES } from '../../common/domain';
export declare class UpdateOrderStatusDto {
    status: (typeof ORDER_STATUSES)[number];
}
export declare class UpdateCampaignStatusDto {
    status: (typeof CAMPAIGN_STATUSES)[number];
}
