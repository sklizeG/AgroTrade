import type { AuthUser } from '../../common/domain';
import { PaymentsService } from './payments.service';
export declare class PaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    mockPay(orderId: string, user: AuthUser): Promise<{
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
