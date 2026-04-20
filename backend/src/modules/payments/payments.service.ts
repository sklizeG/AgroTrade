import { BadRequestException, Injectable } from '@nestjs/common';
import { AuthUser } from '../../common/domain';
import { PrismaService } from '../../prisma/prisma.service';
import { OrdersService } from '../orders/orders.service';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ordersService: OrdersService,
  ) {}

  async mockPay(orderId: string, user: AuthUser) {
    const order = await this.ordersService.getOrderForPayment(orderId, user);

    if (order.status !== 'pending_payment') {
      throw new BadRequestException('Only pending orders can be paid');
    }

    const pendingPayment = order.paymentRecords.find(
      (payment) => payment.status === 'pending',
    );

    if (!pendingPayment) {
      throw new BadRequestException('Pending payment record not found');
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
}
