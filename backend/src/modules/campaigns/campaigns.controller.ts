import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/current-user.decorator';
import type { AuthUser } from '../../common/domain';
import { JwtAuthGuard } from '../../common/jwt-auth.guard';
import { Roles } from '../../common/roles.decorator';
import { RolesGuard } from '../../common/roles.guard';
import {
  CreatePreorderCampaignDto,
  UpdatePreorderCampaignDto,
} from './campaigns.dto';
import { CampaignsService } from './campaigns.service';

@ApiTags('campaigns')
@Controller()
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Get('campaigns')
  listPublished() {
    return this.campaignsService.listPublished();
  }

  @Get('campaigns/:id')
  getPublishedById(@Param('id') id: string) {
    return this.campaignsService.getPublishedById(id);
  }

  @Post('farmer/campaigns')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('farmer')
  create(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreatePreorderCampaignDto,
  ) {
    return this.campaignsService.create(user.sub, dto);
  }

  @Patch('farmer/campaigns/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('farmer')
  update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdatePreorderCampaignDto,
  ) {
    return this.campaignsService.update(user.sub, id, dto);
  }

  @Post('farmer/campaigns/:id/publish')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('farmer')
  publish(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.campaignsService.publish(user.sub, id);
  }

  @Get('farmer/campaigns')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('farmer')
  listFarmerCampaigns(@CurrentUser() user: AuthUser) {
    return this.campaignsService.listFarmerCampaigns(user.sub);
  }
}
