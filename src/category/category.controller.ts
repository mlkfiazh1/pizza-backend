import { Controller, Get, Param } from '@nestjs/common';
import { CategoryService } from './category.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { EnumRole } from '../common/enum';
import { Auth } from '../common/decorators/auth.decorator';

@ApiTags('Categories')
@ApiBearerAuth()
@Controller('categories')
export class CategoryController {
  constructor(private categoryService: CategoryService) {}

  @Auth(EnumRole.ADMIN, EnumRole.USER, EnumRole.GUEST)
  @Get()
  async findAll() {
    const response = await this.categoryService.find();

    return { message: 'categories fetched successfully', data: response };
  }

  @Auth(EnumRole.ADMIN, EnumRole.USER)
  @Get('/:id')
  async findOne(@Param('id') payload: string) {
    const response = await this.categoryService.findOne(payload);

    return { message: 'category fetched successfully', data: response };
  }
}
