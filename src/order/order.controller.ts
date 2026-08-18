import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Auth } from '../common/decorators/auth.decorator';
import { User } from '../common/decorators/user.decorator';
import { EnumRole } from '../common/enum';
import { OrderDto, PagnationDto, UserDto } from './order.dto';
import { OrderService } from './order.service';
import { metadata } from 'reflect-metadata/no-conflict';

@ApiTags('Order')
@Controller('orders')
@ApiBearerAuth()
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @Auth(EnumRole.USER)
  async create(@User() user: UserDto, @Body() payload: OrderDto) {
    const response = await this.orderService.create(user, payload);

    return { message: 'order added successfully' };
  }

  @Get()
  @Auth(EnumRole.USER, EnumRole.ADMIN)
  async findAll(@User() user: UserDto, @Query() pagnation: PagnationDto) {
    const response = await this.orderService.findAll(user, pagnation);

    return {
      message: 'orders fetched successfully',
      data: response.data,
      metadata: response.meta,
    };
  }
}
