import { CreateFeedbackRequestDto } from './feedback.dto';
import { FeedbackService } from './feedback.service';
export declare class FeedbackController {
    private readonly feedbackService;
    constructor(feedbackService: FeedbackService);
    create(dto: CreateFeedbackRequestDto): import("@prisma/client").Prisma.Prisma__FeedbackRequestClient<{
        id: string;
        phone: string;
        createdAt: Date;
        name: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    listForAdmin(): import("@prisma/client").Prisma.PrismaPromise<{
        id: string;
        phone: string;
        createdAt: Date;
        name: string;
    }[]>;
}
