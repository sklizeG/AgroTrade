import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BpmsController } from './bpms.controller';
import { BpmsService } from './bpms.service';

@Module({
  imports: [ConfigModule],
  controllers: [BpmsController],
  providers: [BpmsService],
  exports: [BpmsService],
})
export class BpmsModule {}
