import { PrismaService } from '../../prisma/prisma.service';
import { CreateFarmerReviewDto, UpdateBuyerPublicProfileDto, UpdateFarmerPublicProfileDto, UpdateFarmerReviewDto } from './users.dto';
export declare class UsersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getMyProfile(userId: string): Promise<{
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
    updateMyFarmerPublicProfile(userId: string, dto: UpdateFarmerPublicProfileDto): Promise<{
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
    updateMyBuyerPublicProfile(userId: string, dto: UpdateBuyerPublicProfileDto): Promise<{
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
    getFarmerPublicProfile(farmerId: string): Promise<{
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
    createFarmerReview(farmerId: string, buyerId: string | undefined, dto: CreateFarmerReviewDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        buyerId: string | null;
        farmerId: string;
        authorName: string;
        rating: number;
        comment: string;
    }>;
    updateFarmerReview(farmerId: string, reviewId: string, buyerId: string, dto: UpdateFarmerReviewDto): Promise<{
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
