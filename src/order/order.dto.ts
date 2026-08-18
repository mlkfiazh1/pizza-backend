import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsMongoId, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { Types } from 'mongoose';

class OrderDetails {
  @ApiProperty({
    type: String,
    example: 'pizza pizza id',
    required: true,
  })
  @IsNotEmpty()
  @IsMongoId()
  readonly pizza: string;

  @ApiProperty({
    type: String,
    example: 'pizza size id',
    required: true,
  })
  @IsNotEmpty()
  @IsMongoId()
  readonly size: string;

  @ApiProperty({
    type: Number,
    example: 0,
    required: true,
  })
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  quantity: number;
}

export class OrderDto {
  @ApiProperty({
    type: OrderDetails,
    example: [
      {
        pizza: '6a74957df5e5f022c1132b89',
        size: '6a7b26d0af7db6a4d5bdcd6e',
        quantity: 2,
      },
      {
        pizza: '6a74957df5e5f022c1132b89',
        size: '6a7b26fc69126e17220d8b7c',
        quantity: 1,
      },
    ],
    required: false,
  })
  @IsOptional()
  orders: OrderDetails[];
}

export class UserDto {
  _id: string | Types.ObjectId;
  role: number;
}

export class PagnationDto {
  @ApiProperty({
    type: Number,
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  page: number;

  @ApiProperty({
    type: Number,
    example: 2,
    required: false,
  })
  @IsOptional()
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  limit: number;
}
