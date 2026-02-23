import { Controller, Post, Body, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiConsumes } from '@nestjs/swagger';

import { ApiCommonErrors } from 'src/decorators/api-common-errors.decorator';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { LoggedInResponseDto } from './dto/loggedIn-response';

@ApiTags('auth')
@ApiCommonErrors()
@Controller('api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: 'Login' })
  @ApiConsumes('application/x-www-form-urlencoded')
  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<LoggedInResponseDto> {
    if (!loginDto.username || !loginDto.password) {
      throw new NotFoundException('Invalid username or password');
    }

    const user = await this.authService.validateUser(
      loginDto.username,
      loginDto.password,
    );

    const { access_token, refresh_token } = await this.authService.login(user);

    const response = {
      access_token,
      refresh_token,
      userName: loginDto.username,
      userRole: user.role,
      userId: user.id,
    };

    return response;
  }
}
