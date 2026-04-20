import { Prisma } from '@prisma/client';
import { AuthUser } from '../../common/domain';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateOrderDto } from './orders.dto';
export declare class OrdersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    createOrder(buyerId: string, dto: CreateOrderDto): Promise<{
        campaign: {
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
        };
        paymentRecords: {
            id: string;
            status: import("@prisma/client").$Enums.PaymentStatus;
            createdAt: Date;
            updatedAt: Date;
            orderId: string;
            amount: number;
            method: string;
            paidAt: Date | null;
        }[];
    } & {
        id: string;
        status: import("@prisma/client").$Enums.OrderStatus;
        createdAt: Date;
        updatedAt: Date;
        campaignId: string;
        buyerId: string;
        volume: number;
        fixedUnitPrice: number;
        totalAmount: number;
        prepaymentAmount: number;
        deliveryMode: import("@prisma/client").$Enums.DeliveryMode;
        deliveryAddress: string | null;
        deliveryComment: string | null;
        firstDeliveryDate: Date | null;
        quoteRequestedTotalVolume: number | null;
        quoteBatchVolume: number | null;
        quoteDeliveryFrequency: import("@prisma/client").$Enums.QuoteDeliveryFrequency | null;
        reservedAt: Date | null;
    }>;
    getBuyerOrders(buyerId: string): Prisma.PrismaPromise<({
        campaign: {
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
        };
        paymentRecords: {
            id: string;
            status: import("@prisma/client").$Enums.PaymentStatus;
            createdAt: Date;
            updatedAt: Date;
            orderId: string;
            amount: number;
            method: string;
            paidAt: Date | null;
        }[];
    } & {
        id: string;
        status: import("@prisma/client").$Enums.OrderStatus;
        createdAt: Date;
        updatedAt: Date;
        campaignId: string;
        buyerId: string;
        volume: number;
        fixedUnitPrice: number;
        totalAmount: number;
        prepaymentAmount: number;
        deliveryMode: import("@prisma/client").$Enums.DeliveryMode;
        deliveryAddress: string | null;
        deliveryComment: string | null;
        firstDeliveryDate: Date | null;
        quoteRequestedTotalVolume: number | null;
        quoteBatchVolume: number | null;
        quoteDeliveryFrequency: import("@prisma/client").$Enums.QuoteDeliveryFrequency | null;
        reservedAt: Date | null;
    })[]>;
    getFarmerOrders(farmerId: string): Prisma.PrismaPromise<({
        buyer: {
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
            id: string;
            email: string;
            phone: string | null;
        };
        campaign: {
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
        };
        paymentRecords: {
            id: string;
            status: import("@prisma/client").$Enums.PaymentStatus;
            createdAt: Date;
            updatedAt: Date;
            orderId: string;
            amount: number;
            method: string;
            paidAt: Date | null;
        }[];
    } & {
        id: string;
        status: import("@prisma/client").$Enums.OrderStatus;
        createdAt: Date;
        updatedAt: Date;
        campaignId: string;
        buyerId: string;
        volume: number;
        fixedUnitPrice: number;
        totalAmount: number;
        prepaymentAmount: number;
        deliveryMode: import("@prisma/client").$Enums.DeliveryMode;
        deliveryAddress: string | null;
        deliveryComment: string | null;
        firstDeliveryDate: Date | null;
        quoteRequestedTotalVolume: number | null;
        quoteBatchVolume: number | null;
        quoteDeliveryFrequency: import("@prisma/client").$Enums.QuoteDeliveryFrequency | null;
        reservedAt: Date | null;
    })[]>;
    getOrderForPayment(orderId: string, user: AuthUser): Promise<{
        buyer: {
            id: string;
            email: string;
        };
        campaign: {
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
        };
        paymentRecords: {
            id: string;
            status: import("@prisma/client").$Enums.PaymentStatus;
            createdAt: Date;
            updatedAt: Date;
            orderId: string;
            amount: number;
            method: string;
            paidAt: Date | null;
        }[];
    } & {
        id: string;
        status: import("@prisma/client").$Enums.OrderStatus;
        createdAt: Date;
        updatedAt: Date;
        campaignId: string;
        buyerId: string;
        volume: number;
        fixedUnitPrice: number;
        totalAmount: number;
        prepaymentAmount: number;
        deliveryMode: import("@prisma/client").$Enums.DeliveryMode;
        deliveryAddress: string | null;
        deliveryComment: string | null;
        firstDeliveryDate: Date | null;
        quoteRequestedTotalVolume: number | null;
        quoteBatchVolume: number | null;
        quoteDeliveryFrequency: import("@prisma/client").$Enums.QuoteDeliveryFrequency | null;
        reservedAt: Date | null;
    }>;
}
