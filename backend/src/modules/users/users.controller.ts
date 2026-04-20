import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/current-user.decorator';
import type { AuthUser } from '../../common/domain';
import { JwtAuthGuard } from '../../common/jwt-auth.guard';
import { Roles } from '../../common/roles.decorator';
import { RolesGuard } from '../../common/roles.guard';
import { UsersService } from './users.service';
import {
  CreateFarmerReviewDto,
  UpdateBuyerPublicProfileDto,
  UpdateFarmerPublicProfileDto,
  UpdateFarmerReviewDto,
} from './users.dto';

@ApiTags('users')
@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me/profile')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  getMyProfile(@CurrentUser() user: AuthUser) {
    return this.usersService.getMyProfile(user.sub);
  }

  @Patch('me/farmer-profile')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('farmer')
  updateMyFarmerProfile(
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateFarmerPublicProfileDto,
  ) {
    return this.usersService.updateMyFarmerPublicProfile(user.sub, dto);
  }

  @Patch('me/buyer-profile')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('buyer')
  updateMyBuyerProfile(
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateBuyerPublicProfileDto,
  ) {
    return this.usersService.updateMyBuyerPublicProfile(user.sub, dto);
  }

  @Get('farmers/:id/profile')
  getFarmerPublicProfile(@Param('id') id: string) {
    return this.usersService.getFarmerPublicProfile(id);
  }

  @Post('farmers/:id/reviews')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('buyer', 'admin')
  createFarmerReview(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateFarmerReviewDto,
  ) {
    return this.usersService.createFarmerReview(
      id,
      user.role === 'buyer' ? user.sub : undefined,
      dto,
    );
  }

  @Patch('farmers/:farmerId/reviews/:reviewId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('buyer')
  updateFarmerReview(
    @Param('farmerId') farmerId: string,
    @Param('reviewId') reviewId: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateFarmerReviewDto,
  ) {
    return this.usersService.updateFarmerReview(farmerId, reviewId, user.sub, dto);
  }
}
