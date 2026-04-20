export declare class UpdateFarmerPublicProfileDto {
    displayName?: string;
    avatarUrl?: string;
    companyName?: string;
    pickupAddress?: string;
    about?: string;
    region?: string;
    certification?: string;
    supplyTerms?: string;
}
export declare class UpdateBuyerPublicProfileDto {
    displayName?: string;
    avatarUrl?: string;
    companyName?: string;
    taxId?: string;
}
export declare class CreateFarmerReviewDto {
    authorName: string;
    rating: number;
    comment: string;
}
export declare class UpdateFarmerReviewDto {
    authorName?: string;
    rating?: number;
    comment?: string;
}
