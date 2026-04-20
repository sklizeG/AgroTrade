export declare class CreatePreorderCampaignDto {
    productName: string;
    productUnit: string;
    productDescription?: string;
    title: string;
    season: string;
    description?: string;
    imageUrls?: string[];
    totalVolume: number;
    minOrderVolume: number;
    unitPrice: number;
    prepaymentPercent: number;
    preorderDeadline: string;
    availableFrom?: string;
}
declare const UpdatePreorderCampaignDto_base: import("@nestjs/common").Type<Partial<CreatePreorderCampaignDto>>;
export declare class UpdatePreorderCampaignDto extends UpdatePreorderCampaignDto_base {
}
export {};
