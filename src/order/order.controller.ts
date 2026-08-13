import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Auth } from '../common/decorators/auth.decorator';
import { User } from '../common/decorators/user.decorator';
import { EnumRole } from '../common/enum';
import { OrderDto, UserDto } from './order.dto';
import { OrderService } from './order.service';

@ApiTags('Order')
@Controller('orders')
@ApiBearerAuth()
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @Auth(EnumRole.USER)
  async create(@User() user: UserDto, @Body() payload: OrderDto) {
    const response = await this.orderService.create(user, payload);

    return { message: 'Pizza size added successfully' };
  }
}
