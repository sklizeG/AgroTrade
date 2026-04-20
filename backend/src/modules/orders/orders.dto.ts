import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateIf,
} from 'class-validator';
import { DELIVERY_MODES } from '../../common/domain';

export class CreateOrderDto {
  @ApiProperty()
  @IsString()
  campaignId!: string;

  @ApiProperty()
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0.1)
  volume!: number;

  @ApiProperty({ enum: DELIVERY_MODES })
  @IsIn(DELIVERY_MODES)
  deliveryMode!: (typeof DELIVERY_MODES)[number];

  @ApiPropertyOptional()
  @ValidateIf((object: CreateOrderDto) => object.deliveryMode !== 'pickup')
  @IsString()
  deliveryAddress?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  deliveryComment?: string;

  @ApiPropertyOptional()
  @ValidateIf(
    (object: CreateOrderDto) => object.deliveryMode === 'partial_delivery',
  )
  @IsDateString()
  firstDeliveryDate?: string;

  @ApiPropertyOptional({ enum: ['once', 'weekly', 'daily'] })
  @IsOptional()
  @IsIn(['once', 'weekly', 'daily'])
  quoteDeliveryFrequency?: 'once' | 'weekly' | 'daily';

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0.1)
  quoteRequestedTotalVolume?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0.1)
  quoteBatchVolume?: number;
}
