import type { AuthUser } from '../../common/domain';
import { CreatePreorderCampaignDto, UpdatePreorderCampaignDto } from './campaigns.dto';
import { CampaignsService } from './campaigns.service';
export declare class CampaignsController {
    private readonly campaignsService;
    constructor(campaignsService: CampaignsService);
    listPublished(): Promise<({
        farmer: {
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
        };
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
    })[]>;
    getPublishedById(id: string): Promise<{
        farmer: {
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
        };
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
    }>;
    create(user: AuthUser, dto: CreatePreorderCampaignDto): Promise<{
        farmer: {
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
        };
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
    }>;
    update(user: AuthUser, id: string, dto: UpdatePreorderCampaignDto): Promise<{
        farmer: {
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
        };
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
    }>;
    publish(user: AuthUser, id: string): Promise<{
        farmer: {
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
        };
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
    }>;
    listFarmerCampaigns(user: AuthUser): Promise<({
        farmer: {
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
        };
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
    })[]>;
}
