import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { PizzasService } from './pizzas.service';
import { AddPizzaDto, UpdatePizzaDto } from './pizzas.dto';
import { ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { EnumRole } from '../common/enum';
import { Auth } from '../common/decorators/auth.decorator';

@Controller('pizzas')
@ApiBearerAuth()
export class PizzasController {
  constructor(private readonly pizzasService: PizzasService) {}

  @Auth(EnumRole.ADMIN)
  @Post()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  create(
    @Body() payload: AddPizzaDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.pizzasService.create(payload, file);
  }

  @Get()
  @Auth(EnumRole.ADMIN, EnumRole.USER, EnumRole.GUEST)
  async findAll() {
    const response = await this.pizzasService.findAll();

    return { message: 'Pizza list fetched successfully', data: response };
  }

  @Get(':_id')
  @Auth(EnumRole.ADMIN, EnumRole.USER, EnumRole.GUEST)
  async findOne(@Param('_id') _id: string) {
    const response = await this.pizzasService.findOne(_id);

    return { message: 'Pizza fetched successfully', data: response };
  }

  @Patch(':_id')
  @Auth(EnumRole.ADMIN)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  update(
    @Param('_id') _id: string,
    @Body() payload: UpdatePizzaDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.pizzasService.update(_id, payload, file);
  }

  @Delete(':_id')
  @Auth(EnumRole.ADMIN)
  remove(@Param('_id') _id: string) {
    return this.pizzasService.remove(_id);
  }
}
