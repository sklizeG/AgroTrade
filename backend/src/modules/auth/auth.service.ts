import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { AuthUser } from '../../common/domain';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto, RegisterBuyerDto, RegisterFarmerDto } from './auth.dto';

const authUserInclude = {
  buyerProfile: true,
  farmerProfile: true,
} satisfies Prisma.UserInclude;

type AuthenticatedUser = Prisma.UserGetPayload<{
  include: typeof authUserInclude;
}>;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async registerBuyer(dto: RegisterBuyerDto) {
    await this.ensureEmailIsAvailable(dto.email);
    this.ensureBuyerProfileIsValid(dto);

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        passwordHash,
        phone: dto.phone,
        role: 'buyer',
        buyerProfile: {
          create: {
            buyerType: dto.buyerType,
            displayName: dto.displayName,
            avatarUrl: dto.avatarUrl?.trim(),
            companyName:
              dto.buyerType === 'b2b' ? dto.companyName?.trim() : undefined,
            taxId: dto.buyerType === 'b2b' ? dto.taxId?.trim() : undefined,
          },
        },
      },
      include: authUserInclude,
    });

    return this.buildAuthResponse(user);
  }

  async registerFarmer(dto: RegisterFarmerDto) {
    await this.ensureEmailIsAvailable(dto.email);

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        passwordHash,
        phone: dto.phone,
        role: 'farmer',
        farmerProfile: {
          create: {
            displayName: dto.displayName,
            avatarUrl: dto.avatarUrl?.trim(),
            companyName: dto.companyName.trim(),
            farmTaxId: dto.farmTaxId.trim(),
            pickupAddress: dto.pickupAddress?.trim(),
          },
        },
      },
      include: authUserInclude,
    });

    return this.buildAuthResponse(user);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
      include: authUserInclude,
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordMatches = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.buildAuthResponse(user);
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: authUserInclude,
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return this.serializeUser(user);
  }

  private async ensureEmailIsAvailable(email: string) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true },
    });

    if (existingUser) {
      throw new BadRequestException('Email is already registered');
    }
  }

  private ensureBuyerProfileIsValid(dto: RegisterBuyerDto) {
    if (dto.buyerType !== 'b2b') {
      return;
    }

    if (!dto.companyName?.trim()) {
      throw new BadRequestException('Company name is required for B2B buyers');
    }

    if (!dto.taxId?.trim()) {
      throw new BadRequestException('Tax ID is required for B2B buyers');
    }
  }

  private buildAuthResponse(user: AuthenticatedUser) {
    const payload: AuthUser = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: this.serializeUser(user),
    };
  }

  private serializeUser(user: AuthenticatedUser) {
    return {
      id: user.id,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      buyerProfile: user.buyerProfile,
      farmerProfile: user.farmerProfile,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
