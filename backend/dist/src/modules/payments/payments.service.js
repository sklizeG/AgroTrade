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
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const orders_service_1 = require("../orders/orders.service");
let PaymentsService = class PaymentsService {
    prisma;
    ordersService;
    constructor(prisma, ordersService) {
        this.prisma = prisma;
        this.ordersService = ordersService;
    }
    async mockPay(orderId, user) {
        const order = await this.ordersService.getOrderForPayment(orderId, user);
        if (order.status !== 'pending_payment') {
            throw new common_1.BadRequestException('Only pending orders can be paid');
        }
        const pendingPayment = order.paymentRecords.find((payment) => payment.status === 'pending');
        if (!pendingPayment) {
            throw new common_1.BadRequestException('Pending payment record not found');
        }
        return this.prisma.$transaction(async (tx) => {
            const paidAt = new Date();
            await tx.paymentRecord.update({
                where: { id: pendingPayment.id },
                data: { status: 'paid', paidAt },
            });
            return tx.order.update({
                where: { id: orderId },
                data: { status: 'reserved', reservedAt: paidAt },
                include: {
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
                },
            });
        });
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        orders_service_1.OrdersService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map