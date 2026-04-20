import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/jwt-auth.guard';
import { Roles } from '../../common/roles.decorator';
import { RolesGuard } from '../../common/roles.guard';
import { CreateFeedbackRequestDto } from './feedback.dto';
import { FeedbackService } from './feedback.service';

@ApiTags('feedback')
@Controller()
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post('feedback-requests')
  create(@Body() dto: CreateFeedbackRequestDto) {
    return this.feedbackService.create(dto);
  }

  @Get('admin/feedback-requests')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  listForAdmin() {
    return this.feedbackService.listForAdmin();
  }
}
