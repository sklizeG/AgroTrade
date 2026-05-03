import { PrismaService } from '../../prisma/prisma.service';
import { CrmService } from '../crm/crm.service';
import { CreateFeedbackRequestDto } from './feedback.dto';
export declare class FeedbackService {
    private readonly prisma;
    private readonly crmService;
    private readonly logger;
    constructor(prisma: PrismaService, crmService: CrmService);
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
