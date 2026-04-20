import { PrismaService } from '../../prisma/prisma.service';
import { CreatePreorderCampaignDto, UpdatePreorderCampaignDto } from './campaigns.dto';
export declare class CampaignsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
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
    listFarmerCampaigns(farmerId: string): Promise<({
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
    create(farmerId: string, dto: CreatePreorderCampaignDto): Promise<{
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
    update(farmerId: string, campaignId: string, dto: UpdatePreorderCampaignDto): Promise<{
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
    publish(farmerId: string, campaignId: string): Promise<{
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
    private validateVolumes;
    private validateAllowedFarmerUpdates;
    private validateTotalVolumeChange;
    private validateDeadlineShift;
    private addMonths;
    private normalizeImageUrls;
    private attachAvailability;
}
