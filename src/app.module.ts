import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { CategoryModule } from './category/category.module';
import { ContactModule } from './contact/contact.module';
import { SizeModule } from './size/size.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    ContactModule,
    AuthModule,
    CategoryModule,
    SizeModule,
  ],
})
export class AppModule {}
