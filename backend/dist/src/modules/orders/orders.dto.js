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
exports.CreateOrderDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const domain_1 = require("../../common/domain");
class CreateOrderDto {
    campaignId;
    volume;
    deliveryMode;
    deliveryAddress;
    deliveryComment;
    firstDeliveryDate;
    quoteDeliveryFrequency;
    quoteRequestedTotalVolume;
    quoteBatchVolume;
}
exports.CreateOrderDto = CreateOrderDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateOrderDto.prototype, "campaignId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 3 }),
    (0, class_validator_1.Min)(0.1),
    __metadata("design:type", Number)
], CreateOrderDto.prototype, "volume", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: domain_1.DELIVERY_MODES }),
    (0, class_validator_1.IsIn)(domain_1.DELIVERY_MODES),
    __metadata("design:type", Object)
], CreateOrderDto.prototype, "deliveryMode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.ValidateIf)((object) => object.deliveryMode !== 'pickup'),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateOrderDto.prototype, "deliveryAddress", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateOrderDto.prototype, "deliveryComment", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.ValidateIf)((object) => object.deliveryMode === 'partial_delivery'),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateOrderDto.prototype, "firstDeliveryDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ['once', 'weekly', 'daily'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['once', 'weekly', 'daily']),
    __metadata("design:type", String)
], CreateOrderDto.prototype, "quoteDeliveryFrequency", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 3 }),
    (0, class_validator_1.Min)(0.1),
    __metadata("design:type", Number)
], CreateOrderDto.prototype, "quoteRequestedTotalVolume", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 3 }),
    (0, class_validator_1.Min)(0.1),
    __metadata("design:type", Number)
], CreateOrderDto.prototype, "quoteBatchVolume", void 0);
//# sourceMappingURL=orders.dto.js.map