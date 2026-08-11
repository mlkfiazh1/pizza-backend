import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Auth } from '../common/decorators/auth.decorator';
import { EnumRole } from '../common/enum';
import { PizzaSizeService } from './pizza-size.service';
import { AddPizzaSizeDto } from './pizza-size.dto';

@ApiTags('Pizza Sizes')
@Controller('pizza-sizes')
@ApiBearerAuth()
export class PizzaSizeController {
  constructor(private readonly pizzaSizeService: PizzaSizeService) {}

  @Post()
  @Auth(EnumRole.ADMIN)
  async create(@Body() payload: AddPizzaSizeDto) {
    const response = await this.pizzaSizeService.create(payload);

    return { message: 'Pizza size added successfully' };
  }

  @Get(':pizza_id')
  @Auth(EnumRole.ADMIN, EnumRole.USER, EnumRole.GUEST)
  async findAll(@Param('pizza_id') pizza_id: string) {
    const response = await this.pizzaSizeService.findAll(pizza_id);

    return { message: 'Pizza list fetched successfully', data: response };
  }

  @Patch(':_id')
  @Auth(EnumRole.ADMIN)
  async update(@Param('_id') _id: string, @Body() payload: AddPizzaSizeDto) {
    const response = await this.pizzaSizeService.update(_id, payload);

    return { message: 'Pizza size added successfully' };
  }
}
