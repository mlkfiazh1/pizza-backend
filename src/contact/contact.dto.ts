import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class ContactDto {
  @ApiProperty({
    type: String,
    example: 'test user',
    required: true,
  })
  @IsNotEmpty()
  readonly name: string;

  @ApiProperty({
    type: String,
    example: 'testuser@gmail',
    required: true,
  })
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  @ApiProperty({
    type: String,
    example: 'user message',
    required: true,
  })
  @IsNotEmpty()
  message: string;
}
