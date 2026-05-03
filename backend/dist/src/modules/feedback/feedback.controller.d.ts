import { CreateFeedbackRequestDto } from './feedback.dto';
import { FeedbackService } from './feedback.service';
export declare class FeedbackController {
    private readonly feedbackService;
    constructor(feedbackService: FeedbackService);
    create(dto: CreateFeedbackRequestDto): Promise<{
        id: string;
        phone: string;
        createdAt: Date;
        name: string;
    }>;
    listForAdmin(): import("@prisma/client").Prisma.PrismaPromise<{
        id: string;
        phone: string;
        createdAt: Date;
        name: string;
    }[]>;
}
