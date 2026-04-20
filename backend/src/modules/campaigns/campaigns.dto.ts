import { PartialType, ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  IsArray,
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreatePreorderCampaignDto {
  @ApiProperty()
  @IsString()
  productName!: string;

  @ApiProperty()
  @IsString()
  productUnit!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  productDescription?: string;

  @ApiProperty()
  @IsString()
  title!: string;

  @ApiProperty()
  @IsString()
  season!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ type: [String], maxItems: 6 })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(6)
  @IsString({ each: true })
  imageUrls?: string[];

  @ApiProperty()
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0.1)
  totalVolume!: number;

  @ApiProperty()
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0.1)
  minOrderVolume!: number;

  @ApiProperty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  unitPrice!: number;

  @ApiProperty()
  @IsInt()
  @Min(1)
  @Max(100)
  prepaymentPercent!: number;

  @ApiProperty()
  @IsDateString()
  preorderDeadline!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  availableFrom?: string;
}

export class UpdatePreorderCampaignDto extends PartialType(
  CreatePreorderCampaignDto,
) {}
