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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateCampaignStatusDto = exports.UpdateOrderStatusDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const domain_1 = require("../../common/domain");
class UpdateOrderStatusDto {
    status;
}
exports.UpdateOrderStatusDto = UpdateOrderStatusDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: domain_1.ORDER_STATUSES }),
    (0, class_validator_1.IsIn)(domain_1.ORDER_STATUSES),
    __metadata("design:type", Object)
], UpdateOrderStatusDto.prototype, "status", void 0);
class UpdateCampaignStatusDto {
    status;
}
exports.UpdateCampaignStatusDto = UpdateCampaignStatusDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: domain_1.CAMPAIGN_STATUSES }),
    (0, class_validator_1.IsIn)(domain_1.CAMPAIGN_STATUSES),
    __metadata("design:type", Object)
], UpdateCampaignStatusDto.prototype, "status", void 0);
//# sourceMappingURL=admin.dto.js.map