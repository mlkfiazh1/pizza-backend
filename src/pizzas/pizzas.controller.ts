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
import { AddPizzaDto } from './pizzas.dto';
import { ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { EnumRole } from '../common/enum';
import { Auth } from '../common/decorators/auth.decorator';

@Controller('pizzas')
export class PizzasController {
  constructor(private readonly pizzasService: PizzasService) {}

  @Auth(EnumRole.ADMIN)
  @Post()
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  create(
    @Body() payload: AddPizzaDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.pizzasService.create(payload, file);
  }

  // @Get()
  // findAll() {
  //   return this.pizzasService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.pizzasService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updatePizzaDto: UpdatePizzaDto) {
  //   return this.pizzasService.update(+id, updatePizzaDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.pizzasService.remove(+id);
  // }
}
