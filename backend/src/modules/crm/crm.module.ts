import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BpmsModule } from '../bpms/bpms.module';
import { CrmController } from './crm.controller';
import { CrmService } from './crm.service';

@Module({
  imports: [ConfigModule, BpmsModule],
  controllers: [CrmController],
  providers: [CrmService],
  exports: [CrmService],
})
export class CrmModule {}
