import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreatePreorderCampaignDto,
  UpdatePreorderCampaignDto,
} from './campaigns.dto';

const campaignInclude = {
  product: true,
  farmer: {
    select: {
      id: true,
      email: true,
      phone: true,
      farmerProfile: true,
    },
  },
} satisfies Prisma.PreorderCampaignInclude;

const activeReserveStatuses = [
  'pending_payment',
  'reserved',
  'confirmed',
  'partially_delivered',
] as const;

const MAX_TOTAL_VOLUME_CHANGE_RATIO = 0.4;
const MAX_DEADLINE_SHIFT_MONTHS = 2;

@Injectable()
export class CampaignsService {
  constructor(private readonly prisma: PrismaService) {}

  async listPublished() {
    const campaigns = await this.prisma.preorderCampaign.findMany({
      where: { status: 'published' },
      include: campaignInclude,
      orderBy: [{ preorderDeadline: 'asc' }, { createdAt: 'desc' }],
    });

    return this.attachAvailability(campaigns);
  }

  async getPublishedById(id: string) {
    const campaign = await this.prisma.preorderCampaign.findFirst({
      where: { id, status: 'published' },
      include: campaignInclude,
    });

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    const [campaignWithAvailability] = await this.attachAvailability([campaign]);
    return campaignWithAvailability;
  }

  async listFarmerCampaigns(farmerId: string) {
    const campaigns = await this.prisma.preorderCampaign.findMany({
      where: { farmerId },
      include: campaignInclude,
      orderBy: { createdAt: 'desc' },
    });

    return this.attachAvailability(campaigns);
  }

  async create(farmerId: string, dto: CreatePreorderCampaignDto) {
    this.validateVolumes(dto.totalVolume, dto.minOrderVolume);

    const farmer = await this.prisma.user.findFirst({
      where: { id: farmerId, role: 'farmer' },
      select: { id: true },
    });

    if (!farmer) {
      throw new NotFoundException('Farmer profile not found');
    }

    const product = await this.prisma.product.upsert({
      where: { name: dto.productName.trim() },
      update: {
        unit: dto.productUnit.trim(),
        description: dto.productDescription?.trim(),
      },
      create: {
        name: dto.productName.trim(),
        unit: dto.productUnit.trim(),
        description: dto.productDescription?.trim(),
      },
    });

    return this.prisma.preorderCampaign.create({
      data: {
        farmerId,
        productId: product.id,
        title: dto.title.trim(),
        season: dto.season.trim(),
        description: dto.description?.trim(),
        imageUrls: this.normalizeImageUrls(dto.imageUrls),
        totalVolume: dto.totalVolume,
        minOrderVolume: dto.minOrderVolume,
        unitPrice: dto.unitPrice,
        prepaymentPercent: dto.prepaymentPercent,
        preorderDeadline: new Date(dto.preorderDeadline),
        availableFrom: dto.availableFrom
          ? new Date(dto.availableFrom)
          : undefined,
      },
      include: campaignInclude,
    });
  }

  async update(
    farmerId: string,
    campaignId: string,
    dto: UpdatePreorderCampaignDto,
  ) {
    const campaign = await this.prisma.preorderCampaign.findFirst({
      where: { id: campaignId, farmerId },
      include: { product: true },
    });

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    this.validateAllowedFarmerUpdates(dto);

    if (!['draft', 'published'].includes(campaign.status)) {
      throw new BadRequestException('Only draft or published campaigns can be edited');
    }

    const nextTotalVolume = dto.totalVolume ?? campaign.totalVolume;
    const nextMinOrderVolume = campaign.minOrderVolume;
    this.validateVolumes(nextTotalVolume, nextMinOrderVolume);
    this.validateTotalVolumeChange(campaign.totalVolume, nextTotalVolume);
    this.validateDeadlineShift(campaign.preorderDeadline, dto.preorderDeadline);

    const reserved = await this.prisma.order.aggregate({
      where: {
        campaignId,
        status: {
          in: [...activeReserveStatuses],
        },
      },
      _sum: { volume: true },
    });
    const reservedVolume = reserved._sum.volume ?? 0;
    if (nextTotalVolume < reservedVolume) {
      throw new BadRequestException(
        `Total volume cannot be less than already reserved volume (${reservedVolume})`,
      );
    }

    return this.prisma.preorderCampaign.update({
      where: { id: campaignId },
      data: {
        imageUrls:
          dto.imageUrls === undefined
            ? undefined
            : this.normalizeImageUrls(dto.imageUrls),
        totalVolume: dto.totalVolume,
        preorderDeadline: dto.preorderDeadline
          ? new Date(dto.preorderDeadline)
          : undefined,
      },
      include: campaignInclude,
    });
  }

  async publish(farmerId: string, campaignId: string) {
    const campaign = await this.prisma.preorderCampaign.findFirst({
      where: { id: campaignId, farmerId },
      select: { id: true, status: true, preorderDeadline: true },
    });

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    if (campaign.status !== 'draft') {
      throw new BadRequestException('Only draft campaigns can be published');
    }

    if (campaign.preorderDeadline <= new Date()) {
      throw new BadRequestException('Preorder deadline must be in the future');
    }

    return this.prisma.preorderCampaign.update({
      where: { id: campaignId },
      data: { status: 'published' },
      include: campaignInclude,
    });
  }

  private validateVolumes(totalVolume: number, minOrderVolume: number) {
    if (minOrderVolume > totalVolume) {
      throw new BadRequestException(
        'Minimum order volume cannot be greater than total volume',
      );
    }
  }

  private validateAllowedFarmerUpdates(dto: UpdatePreorderCampaignDto) {
    if (
      dto.productName !== undefined ||
      dto.productUnit !== undefined ||
      dto.productDescription !== undefined ||
      dto.title !== undefined ||
      dto.season !== undefined ||
      dto.description !== undefined ||
      dto.minOrderVolume !== undefined ||
      dto.unitPrice !== undefined ||
      dto.prepaymentPercent !== undefined ||
      dto.availableFrom !== undefined
    ) {
      throw new BadRequestException(
        'Farmer can only edit campaign photos, total volume and preorder deadline',
      );
    }
  }

  private validateTotalVolumeChange(currentVolume: number, nextVolume: number) {
    if (currentVolume <= 0 || nextVolume === currentVolume) {
      return;
    }

    const diffRatio = Math.abs(nextVolume - currentVolume) / currentVolume;
    if (diffRatio > MAX_TOTAL_VOLUME_CHANGE_RATIO) {
      throw new BadRequestException(
        'Total volume can be changed by no more than 40% from the original value',
      );
    }
  }

  private validateDeadlineShift(currentDeadline: Date, nextDeadlineIso?: string) {
    if (!nextDeadlineIso) {
      return;
    }

    const nextDeadline = new Date(nextDeadlineIso);
    const minAllowed = this.addMonths(currentDeadline, -MAX_DEADLINE_SHIFT_MONTHS);
    const maxAllowed = this.addMonths(currentDeadline, MAX_DEADLINE_SHIFT_MONTHS);

    if (nextDeadline < minAllowed || nextDeadline > maxAllowed) {
      throw new BadRequestException(
        'Preorder deadline can be shifted by no more than 2 months from the original date',
      );
    }
  }

  private addMonths(date: Date, months: number) {
    const next = new Date(date);
    next.setMonth(next.getMonth() + months);
    return next;
  }

  private normalizeImageUrls(imageUrls?: string[]) {
    return (
      imageUrls
        ?.map((url) => url.trim())
        .filter((url, index, arr) => Boolean(url) && arr.indexOf(url) === index)
        .slice(0, 6) ?? []
    );
  }

  private async attachAvailability<
    T extends {
      id: string;
      totalVolume: number;
    },
  >(campaigns: T[]) {
    if (campaigns.length === 0) {
      return campaigns;
    }

    const reservedByCampaign = await this.prisma.order.groupBy({
      by: ['campaignId'],
      where: {
        campaignId: {
          in: campaigns.map((campaign) => campaign.id),
        },
        status: {
          in: [...activeReserveStatuses],
        },
      },
      _sum: {
        volume: true,
      },
    });

    const reservedMap = new Map<string, number>(
      reservedByCampaign.map((item) => [item.campaignId, item._sum.volume ?? 0]),
    );

    return campaigns.map((campaign) => {
      const reservedVolume = reservedMap.get(campaign.id) ?? 0;

      return {
        ...campaign,
        reservedVolume,
        availableVolume: Math.max(campaign.totalVolume - reservedVolume, 0),
      };
    });
  }
}
