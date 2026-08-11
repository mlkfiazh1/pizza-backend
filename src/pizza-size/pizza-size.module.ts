import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { PizzaSizeController } from './pizza-size.controller';
import { PizzaSizeService } from './pizza-size.service';

@Module({
  imports: [DatabaseModule],
  controllers: [PizzaSizeController],
  providers: [PizzaSizeService],
})
export class PizzaSizeModule {}
