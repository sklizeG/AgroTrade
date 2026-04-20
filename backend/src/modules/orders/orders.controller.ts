import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/current-user.decorator';
import type { AuthUser } from '../../common/domain';
import { JwtAuthGuard } from '../../common/jwt-auth.guard';
import { Roles } from '../../common/roles.decorator';
import { RolesGuard } from '../../common/roles.guard';
import { CreateOrderDto } from './orders.dto';
import { OrdersService } from './orders.service';

@ApiTags('orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('orders')
  @Roles('buyer')
  createOrder(@CurrentUser() user: AuthUser, @Body() dto: CreateOrderDto) {
    return this.ordersService.createOrder(user.sub, dto);
  }

  @Get('me/orders')
  @Roles('buyer')
  getBuyerOrders(@CurrentUser() user: AuthUser) {
    return this.ordersService.getBuyerOrders(user.sub);
  }

  @Get('farmer/orders')
  @Roles('farmer')
  getFarmerOrders(@CurrentUser() user: AuthUser) {
    return this.ordersService.getFarmerOrders(user.sub);
  }
}
