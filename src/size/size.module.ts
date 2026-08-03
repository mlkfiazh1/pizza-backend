import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { SizeController } from './size.controller';
import { SizeService } from './size.service';

@Module({
  imports: [DatabaseModule],
  controllers: [SizeController],
  providers: [SizeService],
})
export class SizeModule {}
