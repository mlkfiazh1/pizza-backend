import { Controller, Get } from '@nestjs/common';
import { SizeService } from './size.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Sizes')
@Controller('sizes')
export class SizeController {
  constructor(private sizeService: SizeService) {}

  @Get()
  async findAll() {
    const response = await this.sizeService.find();

    return { message: 'User created successfully', data: response };
  }
}
