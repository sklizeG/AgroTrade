import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CrmController } from './crm.controller';
import { CrmService } from './crm.service';

@Module({
  imports: [ConfigModule],
  controllers: [CrmController],
  providers: [CrmService],
  exports: [CrmService],
})
export class CrmModule {}
