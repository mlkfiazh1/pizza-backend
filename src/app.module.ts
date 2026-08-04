import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { CategoryModule } from './category/category.module';
import { ContactModule } from './contact/contact.module';
import { SizeModule } from './size/size.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './common/guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    ContactModule,
    AuthModule,
    CategoryModule,
    SizeModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: AuthGuard }],
})
export class AppModule {}
