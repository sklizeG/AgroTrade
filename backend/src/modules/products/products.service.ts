import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductDto } from './products.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.product.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async create(dto: CreateProductDto) {
    const existingProduct = await this.prisma.product.findUnique({
      where: { name: dto.name.trim() },
      select: { id: true },
    });

    if (existingProduct) {
      throw new BadRequestException('Product with this name already exists');
    }

    return this.prisma.product.create({
      data: {
        name: dto.name.trim(),
        unit: dto.unit.trim(),
        description: dto.description?.trim(),
      },
    });
  }
}
