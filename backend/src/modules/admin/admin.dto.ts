import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';
import { CAMPAIGN_STATUSES, ORDER_STATUSES } from '../../common/domain';

export class UpdateOrderStatusDto {
  @ApiProperty({ enum: ORDER_STATUSES })
  @IsIn(ORDER_STATUSES)
  status!: (typeof ORDER_STATUSES)[number];
}

export class UpdateCampaignStatusDto {
  @ApiProperty({ enum: CAMPAIGN_STATUSES })
  @IsIn(CAMPAIGN_STATUSES)
  status!: (typeof CAMPAIGN_STATUSES)[number];
}
