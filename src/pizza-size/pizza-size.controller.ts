import { Body, Controller, Get, Post } from '@nestjs/common';
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
  async findAll(@Body() payload: AddPizzaSizeDto) {
    const response = await this.pizzaSizeService.create(payload);

    return { message: 'Pizza size added successfully' };
  }
}
