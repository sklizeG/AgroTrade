import { PrismaService } from '../../prisma/prisma.service';
import { CreateFeedbackRequestDto } from './feedback.dto';
export declare class FeedbackService {
    private readonly prisma;
    constructor(prisma: PrismaService);
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
