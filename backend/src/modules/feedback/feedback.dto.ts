import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';
import { IsRussianPhone } from '../../common/validators/is-russian-phone';

export class CreateFeedbackRequestDto {
  @ApiProperty({ example: 'Иван' })
  @IsString()
  @Length(2, 80)
  name!: string;

  @ApiProperty({ example: '+79001234567' })
  @IsString()
  @Length(6, 30)
  @IsRussianPhone()
  phone!: string;
}
