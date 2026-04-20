import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AuthUser } from '../../common/domain';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateOrderDto } from './orders.dto';

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
} satisfies Prisma.OrderInclude;

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async createOrder(buyerId: string, dto: CreateOrderDto) {
    const isQuoteRequest = dto.quoteRequestedTotalVolume !== undefined;

    if (dto.deliveryMode !== 'pickup' && !dto.deliveryAddress) {
      throw new BadRequestException('Delivery address is required');
    }

    if (dto.deliveryMode === 'partial_delivery' && !dto.firstDeliveryDate) {
      throw new BadRequestException(
        'First delivery date is required for partial delivery',
      );
    }

    if (isQuoteRequest) {
      if (!dto.quoteDeliveryFrequency) {
        throw new BadRequestException('Quote delivery frequency is required');
      }
      if (!dto.quoteRequestedTotalVolume) {
        throw new BadRequestException('Quote requested total volume is required');
      }
      if (
        ['weekly', 'daily'].includes(dto.quoteDeliveryFrequency) &&
        !dto.quoteBatchVolume
      ) {
        throw new BadRequestException(
          'Quote batch volume is required for weekly or daily delivery',
        );
      }
      if (
        dto.quoteBatchVolume !== undefined &&
        dto.quoteRequestedTotalVolume !== undefined &&
        dto.quoteBatchVolume > dto.quoteRequestedTotalVolume
      ) {
        throw new BadRequestException(
          'Quote batch volume cannot exceed requested total volume',
        );
      }
    }

    return this.prisma.$transaction(async (tx) => {
      const campaign = await tx.preorderCampaign.findUnique({
        where: { id: dto.campaignId },
        include: { product: true },
      });

      if (!campaign || campaign.status !== 'published') {
        throw new NotFoundException('Published campaign not found');
      }

      if (campaign.farmerId === buyerId) {
        throw new BadRequestException(
          'You cannot place a preorder in your own campaign',
        );
      }

      if (campaign.preorderDeadline <= new Date()) {
        throw new BadRequestException('Preorder deadline has already passed');
      }

      const requestedVolume = isQuoteRequest
        ? (dto.quoteRequestedTotalVolume ?? 0)
        : dto.volume;

      if (requestedVolume < campaign.minOrderVolume) {
        throw new BadRequestException(
          `Minimum order volume is ${campaign.minOrderVolume} ${campaign.product.unit}`,
        );
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
        throw new BadRequestException(
          'Requested volume exceeds available volume',
        );
      }

      const totalAmount = Number((requestedVolume * campaign.unitPrice).toFixed(2));
      const prepaymentAmount = Number(
        ((totalAmount * campaign.prepaymentPercent) / 100).toFixed(2),
      );

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

  getBuyerOrders(buyerId: string) {
    return this.prisma.order.findMany({
      where: { buyerId },
      include: orderInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  getFarmerOrders(farmerId: string) {
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

  async getOrderForPayment(orderId: string, user: AuthUser) {
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
      throw new NotFoundException('Order not found');
    }

    if (user.role !== 'admin' && order.buyerId !== user.sub) {
      throw new ForbiddenException('You can only pay your own orders');
    }

    return order;
  }
}
