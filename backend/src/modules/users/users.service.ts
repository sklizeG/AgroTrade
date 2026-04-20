import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateFarmerReviewDto,
  UpdateBuyerPublicProfileDto,
  UpdateFarmerPublicProfileDto,
  UpdateFarmerReviewDto,
} from './users.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getMyProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        buyerProfile: true,
        farmerProfile: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateMyFarmerPublicProfile(
    userId: string,
    dto: UpdateFarmerPublicProfileDto,
  ) {
    const profile = await this.prisma.farmerProfile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!profile) {
      throw new NotFoundException('Farmer profile not found');
    }

    return this.prisma.farmerProfile.update({
      where: { userId },
      data: {
        displayName: dto.displayName?.trim(),
        avatarUrl: dto.avatarUrl?.trim(),
        companyName: dto.companyName?.trim(),
        pickupAddress: dto.pickupAddress?.trim(),
        about: dto.about?.trim(),
        region: dto.region?.trim(),
        certification: dto.certification?.trim(),
        supplyTerms: dto.supplyTerms?.trim(),
      },
    });
  }

  async updateMyBuyerPublicProfile(userId: string, dto: UpdateBuyerPublicProfileDto) {
    const profile = await this.prisma.buyerProfile.findUnique({
      where: { userId },
      select: { id: true, buyerType: true },
    });

    if (!profile) {
      throw new NotFoundException('Buyer profile not found');
    }

    return this.prisma.buyerProfile.update({
      where: { userId },
      data: {
        displayName: dto.displayName?.trim(),
        avatarUrl: dto.avatarUrl?.trim(),
        companyName:
          profile.buyerType === 'b2b' ? dto.companyName?.trim() : undefined,
        taxId: profile.buyerType === 'b2b' ? dto.taxId?.trim() : undefined,
      },
    });
  }

  async getFarmerPublicProfile(farmerId: string) {
    const farmer = await this.prisma.user.findFirst({
      where: { id: farmerId, role: 'farmer' },
      select: {
        id: true,
        email: true,
        phone: true,
        farmerProfile: true,
        campaigns: {
          where: { status: 'published' },
          include: { product: true },
          orderBy: [{ preorderDeadline: 'asc' }, { createdAt: 'desc' }],
        },
        receivedReviews: {
          orderBy: { createdAt: 'desc' },
          take: 20,
          select: {
            id: true,
            buyerId: true,
            authorName: true,
            rating: true,
            comment: true,
            createdAt: true,
          },
        },
      },
    });

    if (!farmer) {
      throw new NotFoundException('Farmer not found');
    }

    const ratings = farmer.receivedReviews.map((review) => review.rating);
    const averageRating =
      ratings.length > 0
        ? Number(
            (ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length).toFixed(
              2,
            ),
          )
        : null;

    return {
      ...farmer,
      reviewsCount: farmer.receivedReviews.length,
      averageRating,
    };
  }

  async createFarmerReview(
    farmerId: string,
    buyerId: string | undefined,
    dto: CreateFarmerReviewDto,
  ) {
    const farmer = await this.prisma.user.findFirst({
      where: { id: farmerId, role: 'farmer' },
      select: { id: true },
    });

    if (!farmer) {
      throw new NotFoundException('Farmer not found');
    }

    if (buyerId) {
      const existingReview = await this.prisma.farmerReview.findFirst({
        where: { farmerId, buyerId },
        select: { id: true },
      });

      if (existingReview) {
        return this.prisma.farmerReview.update({
          where: { id: existingReview.id },
          data: {
            authorName: dto.authorName.trim(),
            rating: dto.rating,
            comment: dto.comment.trim(),
          },
        });
      }
    }

    return this.prisma.farmerReview.create({
      data: {
        farmerId,
        buyerId,
        authorName: dto.authorName.trim(),
        rating: dto.rating,
        comment: dto.comment.trim(),
      },
    });
  }

  async updateFarmerReview(
    farmerId: string,
    reviewId: string,
    buyerId: string,
    dto: UpdateFarmerReviewDto,
  ) {
    const review = await this.prisma.farmerReview.findFirst({
      where: { id: reviewId, farmerId },
      select: { id: true, buyerId: true },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (review.buyerId !== buyerId) {
      throw new ForbiddenException('You can edit only your own review');
    }

    return this.prisma.farmerReview.update({
      where: { id: reviewId },
      data: {
        authorName: dto.authorName?.trim(),
        rating: dto.rating,
        comment: dto.comment?.trim(),
      },
    });
  }
}
