import { Injectable, NotFoundException } from '@nestjs/common';
import type { CampaignStatus, OrderStatus } from '../../common/domain';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  listUsers() {
    return this.prisma.user.findMany({
      include: {
        buyerProfile: true,
        farmerProfile: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  listOrders() {
    return this.prisma.order.findMany({
      include: {
        buyer: {
          select: {
            id: true,
            email: true,
            phone: true,
            buyerProfile: true,
          },
        },
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
      orderBy: { createdAt: 'desc' },
    });
  }

  listCampaigns() {
    return this.prisma.preorderCampaign.findMany({
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
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateOrderStatus(orderId: string, status: OrderStatus) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      select: { id: true },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return this.prisma.order.update({
      where: { id: orderId },
      data: {
        status,
        reservedAt: status === 'reserved' ? new Date() : undefined,
      },
      include: {
        paymentRecords: true,
        campaign: { include: { product: true } },
      },
    });
  }

  async updateCampaignStatus(campaignId: string, status: CampaignStatus) {
    const campaign = await this.prisma.preorderCampaign.findUnique({
      where: { id: campaignId },
      select: { id: true },
    });

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    return this.prisma.preorderCampaign.update({
      where: { id: campaignId },
      data: { status },
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
    });
  }
}
