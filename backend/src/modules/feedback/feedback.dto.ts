import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, Matches } from 'class-validator';

export class CreateFeedbackRequestDto {
  @ApiProperty({ example: 'Иван' })
  @IsString()
  @Length(2, 80)
  name!: string;

  @ApiProperty({ example: '+7 (900) 123-45-67' })
  @IsString()
  @Length(6, 30)
  @Matches(/^[0-9+\-() ]+$/, {
    message: 'Phone can contain only digits, spaces and + - ( ) symbols',
  })
  phone!: string;
}
