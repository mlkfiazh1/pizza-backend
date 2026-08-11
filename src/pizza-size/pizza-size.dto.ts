import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsMongoId, IsNotEmpty, IsNumber } from 'class-validator';

export class AddPizzaSizeDto {
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
  price: number;
}

export class UpdatePizzaSizeDto extends PartialType(AddPizzaSizeDto) {}
