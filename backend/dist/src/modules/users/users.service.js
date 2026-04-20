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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let UsersService = class UsersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getMyProfile(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                buyerProfile: true,
                farmerProfile: true,
            },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return user;
    }
    async updateMyFarmerPublicProfile(userId, dto) {
        const profile = await this.prisma.farmerProfile.findUnique({
            where: { userId },
            select: { id: true },
        });
        if (!profile) {
            throw new common_1.NotFoundException('Farmer profile not found');
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
    async updateMyBuyerPublicProfile(userId, dto) {
        const profile = await this.prisma.buyerProfile.findUnique({
            where: { userId },
            select: { id: true, buyerType: true },
        });
        if (!profile) {
            throw new common_1.NotFoundException('Buyer profile not found');
        }
        return this.prisma.buyerProfile.update({
            where: { userId },
            data: {
                displayName: dto.displayName?.trim(),
                avatarUrl: dto.avatarUrl?.trim(),
                companyName: profile.buyerType === 'b2b' ? dto.companyName?.trim() : undefined,
                taxId: profile.buyerType === 'b2b' ? dto.taxId?.trim() : undefined,
            },
        });
    }
    async getFarmerPublicProfile(farmerId) {
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
            throw new common_1.NotFoundException('Farmer not found');
        }
        const ratings = farmer.receivedReviews.map((review) => review.rating);
        const averageRating = ratings.length > 0
            ? Number((ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length).toFixed(2))
            : null;
        return {
            ...farmer,
            reviewsCount: farmer.receivedReviews.length,
            averageRating,
        };
    }
    async createFarmerReview(farmerId, buyerId, dto) {
        const farmer = await this.prisma.user.findFirst({
            where: { id: farmerId, role: 'farmer' },
            select: { id: true },
        });
        if (!farmer) {
            throw new common_1.NotFoundException('Farmer not found');
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
    async updateFarmerReview(farmerId, reviewId, buyerId, dto) {
        const review = await this.prisma.farmerReview.findFirst({
            where: { id: reviewId, farmerId },
            select: { id: true, buyerId: true },
        });
        if (!review) {
            throw new common_1.NotFoundException('Review not found');
        }
        if (review.buyerId !== buyerId) {
            throw new common_1.ForbiddenException('You can edit only your own review');
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
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map