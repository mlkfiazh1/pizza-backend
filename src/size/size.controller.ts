import { Controller, Get } from '@nestjs/common';
import { SizeService } from './size.service';
import { ApiTags } from '@nestjs/swagger';
import { EnumRole } from '../common/enum';
import { Auth } from '../common/decorators/auth.decorator';

@ApiTags('Sizes')
@Controller('sizes')
export class SizeController {
  constructor(private sizeService: SizeService) {}

  @Auth(EnumRole.GUEST, EnumRole.ADMIN, EnumRole.USER)
  @Get()
  async findAll() {
    const response = await this.sizeService.find();

    return { message: 'User created successfully', data: response };
  }
}
