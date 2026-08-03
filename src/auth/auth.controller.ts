import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './auth.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/v1/sign-up')
  async signup(@Body() payload: SignupDto) {
    await this.authService.signup(payload);

    return { message: 'User created successfully' };
  }
}
