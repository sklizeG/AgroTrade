"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const orderInclude = {
    campaign: {
        include: {
            product: true,
            farmer: {
                select: {
                    id: true,
                    email: true,
                    phone: true,
                    farmerProfile: true,
                },
            },
        },
    },
    paymentRecords: true,
};
let OrdersService = class OrdersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createOrder(buyerId, dto) {
        const isQuoteRequest = dto.quoteRequestedTotalVolume !== undefined;
        if (dto.deliveryMode !== 'pickup' && !dto.deliveryAddress) {
            throw new common_1.BadRequestException('Delivery address is required');
        }
        if (dto.deliveryMode === 'partial_delivery' && !dto.firstDeliveryDate) {
            throw new common_1.BadRequestException('First delivery date is required for partial delivery');
        }
        if (isQuoteRequest) {
            if (!dto.quoteDeliveryFrequency) {
                throw new common_1.BadRequestException('Quote delivery frequency is required');
            }
            if (!dto.quoteRequestedTotalVolume) {
                throw new common_1.BadRequestException('Quote requested total volume is required');
            }
            if (['weekly', 'daily'].includes(dto.quoteDeliveryFrequency) &&
                !dto.quoteBatchVolume) {
                throw new common_1.BadRequestException('Quote batch volume is required for weekly or daily delivery');
            }
            if (dto.quoteBatchVolume !== undefined &&
                dto.quoteRequestedTotalVolume !== undefined &&
                dto.quoteBatchVolume > dto.quoteRequestedTotalVolume) {
                throw new common_1.BadRequestException('Quote batch volume cannot exceed requested total volume');
            }
        }
        return this.prisma.$transaction(async (tx) => {
            const campaign = await tx.preorderCampaign.findUnique({
                where: { id: dto.campaignId },
                include: { product: true },
            });
            if (!campaign || campaign.status !== 'published') {
                throw new common_1.NotFoundException('Published campaign not found');
            }
            if (campaign.farmerId === buyerId) {
                throw new common_1.BadRequestException('You cannot place a preorder in your own campaign');
            }
            if (campaign.preorderDeadline <= new Date()) {
                throw new common_1.BadRequestException('Preorder deadline has already passed');
            }
            const requestedVolume = isQuoteRequest
                ? (dto.quoteRequestedTotalVolume ?? 0)
                : dto.volume;
            if (requestedVolume < campaign.minOrderVolume) {
                throw new common_1.BadRequestException(`Minimum order volume is ${campaign.minOrderVolume} ${campaign.product.unit}`);
            }
            const reserved = await tx.order.aggregate({
                where: {
                    campaignId: dto.campaignId,
                    status: {
                        in: [
                            'pending_payment',
                            'reserved',
                            'confirmed',
                            'partially_delivered',
                        ],
                    },
                },
                _sum: { volume: true },
            });
            const reservedVolume = reserved._sum.volume ?? 0;
            const availableVolume = campaign.totalVolume - reservedVolume;
            if (requestedVolume > availableVolume) {
                throw new common_1.BadRequestException('Requested volume exceeds available volume');
            }
            const totalAmount = Number((requestedVolume * campaign.unitPrice).toFixed(2));
            const prepaymentAmount = Number(((totalAmount * campaign.prepaymentPercent) / 100).toFixed(2));
            return tx.order.create({
                data: {
                    campaignId: campaign.id,
                    buyerId,
                    volume: requestedVolume,
                    fixedUnitPrice: campaign.unitPrice,
                    totalAmount,
                    prepaymentAmount,
                    deliveryMode: dto.deliveryMode,
                    deliveryAddress: dto.deliveryAddress,
                    deliveryComment: dto.deliveryComment,
                    firstDeliveryDate: dto.firstDeliveryDate
                        ? new Date(dto.firstDeliveryDate)
                        : undefined,
                    quoteRequestedTotalVolume: dto.quoteRequestedTotalVolume,
                    quoteBatchVolume: dto.quoteBatchVolume,
                    quoteDeliveryFrequency: dto.quoteDeliveryFrequency,
                    paymentRecords: {
                        create: {
                            amount: prepaymentAmount,
                            status: 'pending',
                            method: 'mock',
                        },
                    },
                },
                include: orderInclude,
            });
        });
    }
    getBuyerOrders(buyerId) {
        return this.prisma.order.findMany({
            where: { buyerId },
            include: orderInclude,
            orderBy: { createdAt: 'desc' },
        });
    }
    getFarmerOrders(farmerId) {
        return this.prisma.order.findMany({
            where: {
                campaign: {
                    farmerId,
                },
            },
            include: {
                ...orderInclude,
                buyer: {
                    select: {
                        id: true,
                        email: true,
                        phone: true,
                        buyerProfile: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getOrderForPayment(orderId, user) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: {
                ...orderInclude,
                buyer: {
                    select: {
                        id: true,
                        email: true,
                    },
                },
            },
        });
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        if (user.role !== 'admin' && order.buyerId !== user.sub) {
            throw new common_1.ForbiddenException('You can only pay your own orders');
        }
        return order;
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map