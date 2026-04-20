import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductDto } from './products.dto';
export declare class ProductsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    list(): import("@prisma/client").Prisma.PrismaPromise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        unit: string;
    }[]>;
    create(dto: CreateProductDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        unit: string;
    }>;
}
