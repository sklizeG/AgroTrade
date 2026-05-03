"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var FeedbackService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeedbackService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const crm_service_1 = require("../crm/crm.service");
let FeedbackService = FeedbackService_1 = class FeedbackService {
    prisma;
    crmService;
    logger = new common_1.Logger(FeedbackService_1.name);
    constructor(prisma, crmService) {
        this.prisma = prisma;
        this.crmService = crmService;
    }
    async create(dto) {
        const row = await this.prisma.feedbackRequest.create({
            data: {
                name: dto.name.trim(),
                phone: dto.phone.trim(),
            },
        });
        const crmPayload = {
            id: row.id,
            name: row.name,
            phone: row.phone,
            createdAt: row.createdAt,
        };
        setImmediate(() => {
            void this.crmService.pushFeedbackRequest(crmPayload).catch((e) => {
                this.logger.error(`CRM: исключение при отправке заявки ${row.id}`, e instanceof Error ? e.stack : e);
            });
        });
        return row;
    }
    listForAdmin() {
        return this.prisma.feedbackRequest.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }
};
exports.FeedbackService = FeedbackService;
exports.FeedbackService = FeedbackService = FeedbackService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        crm_service_1.CrmService])
], FeedbackService);
//# sourceMappingURL=feedback.service.js.map