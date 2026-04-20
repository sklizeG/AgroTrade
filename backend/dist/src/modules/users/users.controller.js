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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../../common/current-user.decorator");
const jwt_auth_guard_1 = require("../../common/jwt-auth.guard");
const roles_decorator_1 = require("../../common/roles.decorator");
const roles_guard_1 = require("../../common/roles.guard");
const users_service_1 = require("./users.service");
const users_dto_1 = require("./users.dto");
let UsersController = class UsersController {
    usersService;
    constructor(usersService) {
        this.usersService = usersService;
    }
    getMyProfile(user) {
        return this.usersService.getMyProfile(user.sub);
    }
    updateMyFarmerProfile(user, dto) {
        return this.usersService.updateMyFarmerPublicProfile(user.sub, dto);
    }
    updateMyBuyerProfile(user, dto) {
        return this.usersService.updateMyBuyerPublicProfile(user.sub, dto);
    }
    getFarmerPublicProfile(id) {
        return this.usersService.getFarmerPublicProfile(id);
    }
    createFarmerReview(id, user, dto) {
        return this.usersService.createFarmerReview(id, user.role === 'buyer' ? user.sub : undefined, dto);
    }
    updateFarmerReview(farmerId, reviewId, user, dto) {
        return this.usersService.updateFarmerReview(farmerId, reviewId, user.sub, dto);
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Get)('me/profile'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "getMyProfile", null);
__decorate([
    (0, common_1.Patch)('me/farmer-profile'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('farmer'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, users_dto_1.UpdateFarmerPublicProfileDto]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "updateMyFarmerProfile", null);
__decorate([
    (0, common_1.Patch)('me/buyer-profile'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('buyer'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, users_dto_1.UpdateBuyerPublicProfileDto]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "updateMyBuyerProfile", null);
__decorate([
    (0, common_1.Get)('farmers/:id/profile'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "getFarmerPublicProfile", null);
__decorate([
    (0, common_1.Post)('farmers/:id/reviews'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('buyer', 'admin'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, users_dto_1.CreateFarmerReviewDto]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "createFarmerReview", null);
__decorate([
    (0, common_1.Patch)('farmers/:farmerId/reviews/:reviewId'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('buyer'),
    __param(0, (0, common_1.Param)('farmerId')),
    __param(1, (0, common_1.Param)('reviewId')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, users_dto_1.UpdateFarmerReviewDto]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "updateFarmerReview", null);
exports.UsersController = UsersController = __decorate([
    (0, swagger_1.ApiTags)('users'),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], UsersController);
//# sourceMappingURL=users.controller.js.map