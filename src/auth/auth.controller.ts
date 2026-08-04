import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SigninDto, SignupDto } from './auth.dto';
import { ApiTags } from '@nestjs/swagger';
import { EnumRole } from '../common/enum';
import { Auth } from '../common/decorators/auth.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Auth(EnumRole.GUEST)
  @Post('/v1/sign-up')
  async signup(@Body() payload: SignupDto) {
    await this.authService.signup(payload);

    return { message: 'User created successfully' };
  }

  @Auth(EnumRole.GUEST)
  @Post('/v1/sign-in')
  async signin(@Body() payload: SigninDto) {
    const response = await this.authService.signin(payload);

    return { message: 'User signed in successfully', data: response };
  }
}
