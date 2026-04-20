import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateFeedbackRequestDto } from './feedback.dto';

@Injectable()
export class FeedbackService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateFeedbackRequestDto) {
    return this.prisma.feedbackRequest.create({
      data: {
        name: dto.name.trim(),
        phone: dto.phone.trim(),
      },
    });
  }

  listForAdmin() {
    return this.prisma.feedbackRequest.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }
}
