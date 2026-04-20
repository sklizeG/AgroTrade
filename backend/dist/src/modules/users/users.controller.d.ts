import type { AuthUser } from '../../common/domain';
import { UsersService } from './users.service';
import { CreateFarmerReviewDto, UpdateBuyerPublicProfileDto, UpdateFarmerPublicProfileDto, UpdateFarmerReviewDto } from './users.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getMyProfile(user: AuthUser): Promise<{
        buyerProfile: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            buyerType: import("@prisma/client").$Enums.BuyerType;
            displayName: string;
            avatarUrl: string | null;
            companyName: string | null;
            taxId: string | null;
        } | null;
        farmerProfile: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            displayName: string;
            avatarUrl: string | null;
            companyName: string;
            farmTaxId: string;
            pickupAddress: string | null;
            about: string | null;
            region: string | null;
            certification: string | null;
            supplyTerms: string | null;
        } | null;
    } & {
        id: string;
        email: string;
        passwordHash: string;
        role: import("@prisma/client").$Enums.UserRole;
        status: import("@prisma/client").$Enums.UserStatus;
        phone: string | null;
        syncedToCrm: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateMyFarmerProfile(user: AuthUser, dto: UpdateFarmerPublicProfileDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        displayName: string;
        avatarUrl: string | null;
        companyName: string;
        farmTaxId: string;
        pickupAddress: string | null;
        about: string | null;
        region: string | null;
        certification: string | null;
        supplyTerms: string | null;
    }>;
    updateMyBuyerProfile(user: AuthUser, dto: UpdateBuyerPublicProfileDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        buyerType: import("@prisma/client").$Enums.BuyerType;
        displayName: string;
        avatarUrl: string | null;
        companyName: string | null;
        taxId: string | null;
    }>;
    getFarmerPublicProfile(id: string): Promise<{
        reviewsCount: number;
        averageRating: number | null;
        farmerProfile: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            displayName: string;
            avatarUrl: string | null;
            companyName: string;
            farmTaxId: string;
            pickupAddress: string | null;
            about: string | null;
            region: string | null;
            certification: string | null;
            supplyTerms: string | null;
        } | null;
        id: string;
        email: string;
        phone: string | null;
        campaigns: ({
            product: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                description: string | null;
                unit: string;
            };
        } & {
            id: string;
            status: import("@prisma/client").$Enums.CampaignStatus;
            createdAt: Date;
            updatedAt: Date;
            farmerId: string;
            productId: string;
            title: string;
            season: string;
            description: string | null;
            imageUrls: string[];
            totalVolume: number;
            minOrderVolume: number;
            unitPrice: number;
            prepaymentPercent: number;
            availableFrom: Date | null;
            preorderDeadline: Date;
        })[];
        receivedReviews: {
            id: string;
            createdAt: Date;
            buyerId: string | null;
            authorName: string;
            rating: number;
            comment: string;
        }[];
    }>;
    createFarmerReview(id: string, user: AuthUser, dto: CreateFarmerReviewDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        buyerId: string | null;
        farmerId: string;
        authorName: string;
        rating: number;
        comment: string;
    }>;
    updateFarmerReview(farmerId: string, reviewId: string, user: AuthUser, dto: UpdateFarmerReviewDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        buyerId: string | null;
        farmerId: string;
        authorName: string;
        rating: number;
        comment: string;
    }>;
}
