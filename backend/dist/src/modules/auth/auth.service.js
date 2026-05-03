"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcrypt"));
const prisma_service_1 = require("../../prisma/prisma.service");
const crm_service_1 = require("../crm/crm.service");
const authUserInclude = {
    buyerProfile: true,
    farmerProfile: true,
};
let AuthService = AuthService_1 = class AuthService {
    prisma;
    jwtService;
    crmService;
    logger = new common_1.Logger(AuthService_1.name);
    constructor(prisma, jwtService, crmService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.crmService = crmService;
    }
    async registerBuyer(dto) {
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
                        companyName: dto.buyerType === 'b2b' ? dto.companyName?.trim() : undefined,
                        taxId: dto.buyerType === 'b2b' ? dto.taxId?.trim() : undefined,
                    },
                },
            },
            include: authUserInclude,
        });
        const profile = user.buyerProfile;
        if (profile) {
            setImmediate(() => {
                void this.crmService
                    .pushRegistrationContact({
                    userId: user.id,
                    role: 'buyer',
                    email: user.email,
                    phone: user.phone,
                    displayName: profile.displayName,
                    companyName: profile.companyName,
                    buyerType: profile.buyerType,
                    taxId: profile.taxId,
                })
                    .catch((e) => {
                    this.logger.error(`CRM: ошибка при отправке контакта регистрации покупателя ${user.id}`, e instanceof Error ? e.stack : e);
                });
            });
        }
        return this.buildAuthResponse(user);
    }
    async registerFarmer(dto) {
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
        const profile = user.farmerProfile;
        if (profile) {
            setImmediate(() => {
                void this.crmService
                    .pushRegistrationContact({
                    userId: user.id,
                    role: 'farmer',
                    email: user.email,
                    phone: user.phone,
                    displayName: profile.displayName,
                    companyName: profile.companyName,
                    farmTaxId: profile.farmTaxId,
                    pickupAddress: profile.pickupAddress,
                })
                    .catch((e) => {
                    this.logger.error(`CRM: ошибка при отправке контакта регистрации фермера ${user.id}`, e instanceof Error ? e.stack : e);
                });
            });
        }
        return this.buildAuthResponse(user);
    }
    async login(dto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email.toLowerCase() },
            include: authUserInclude,
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        const passwordMatches = await bcrypt.compare(dto.password, user.passwordHash);
        if (!passwordMatches) {
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        return this.buildAuthResponse(user);
    }
    async me(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: authUserInclude,
        });
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        return this.serializeUser(user);
    }
    async ensureEmailIsAvailable(email) {
        const existingUser = await this.prisma.user.findUnique({
            where: { email: email.toLowerCase() },
            select: { id: true },
        });
        if (existingUser) {
            throw new common_1.BadRequestException('Email is already registered');
        }
    }
    ensureBuyerProfileIsValid(dto) {
        if (dto.buyerType !== 'b2b') {
            return;
        }
        if (!dto.companyName?.trim()) {
            throw new common_1.BadRequestException('Company name is required for B2B buyers');
        }
        if (!dto.taxId?.trim()) {
            throw new common_1.BadRequestException('Tax ID is required for B2B buyers');
        }
    }
    buildAuthResponse(user) {
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
        };
        return {
            accessToken: this.jwtService.sign(payload),
            user: this.serializeUser(user),
        };
    }
    serializeUser(user) {
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
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        crm_service_1.CrmService])
], AuthService);
//# sourceMappingURL=auth.service.js.map