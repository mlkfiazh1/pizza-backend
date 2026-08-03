import { IsEmail, IsNotEmpty, IsStrongPassword } from 'class-validator';

export class ContactDto {
  @IsNotEmpty()
  readonly name: string;

  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  @IsNotEmpty()
  message: string;
}
