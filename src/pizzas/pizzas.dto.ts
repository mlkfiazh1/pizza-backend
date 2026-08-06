import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class AddPizzaDto {
  @ApiProperty({
    type: String,
    example: 'pizza name',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  readonly name: string;

  @ApiProperty({
    type: String,
    example: 'pizza category id',
    required: true,
  })
  @IsNotEmpty()
  @IsMongoId()
  readonly category: string;

  @ApiProperty({
    type: String,
    example: 'pizza description',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  //   @ApiProperty({ type: 'string', format: 'binary', required: false })
  //   file: Express.Multer.File | string;
}
