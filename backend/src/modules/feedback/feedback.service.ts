import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CrmService } from '../crm/crm.service';
import { CreateFeedbackRequestDto } from './feedback.dto';

@Injectable()
export class FeedbackService {
  private readonly logger = new Logger(FeedbackService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly crmService: CrmService,
  ) {}

  async create(dto: CreateFeedbackRequestDto) {
    const row = await this.prisma.feedbackRequest.create({
      data: {
        name: dto.name.trim(),
        phone: dto.phone.trim(),
      },
    });

    const crmPayload = {
      id: row.id,
      name: row.name,
      phone: row.phone,
      createdAt: row.createdAt,
    };
    setImmediate(() => {
      void this.crmService.pushFeedbackRequest(crmPayload).catch((e) => {
        this.logger.error(
          `CRM: исключение при отправке заявки ${row.id}`,
          e instanceof Error ? e.stack : e,
        );
      });
    });

    return row;
  }

  listForAdmin() {
    return this.prisma.feedbackRequest.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }
}
