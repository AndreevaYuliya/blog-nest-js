import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
} from '@nestjs/swagger';

import { ApiCommonErrors } from 'src/decorators/api-common-errors.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

import { UsersService } from './users.service';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/user-response.dto';

const MinLoginLength = 4;
const MinPasswordLength = 6;

@ApiCommonErrors()
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiBody({ type: CreateUserDto })
  async register(
    @Body() createUserDto: CreateUserDto,
  ): Promise<UserResponseDto> {
    if (
      !createUserDto.username ||
      !createUserDto.password ||
      createUserDto.username.length < MinLoginLength ||
      createUserDto.password.length < MinPasswordLength
    ) {
      throw new BadRequestException(
        `Length of username must be at least ${MinLoginLength} characters, and password must be at least ${MinPasswordLength} characters`,
      );
    }

    const user = await this.usersService.create(
      createUserDto.username,
      createUserDto.password,
    );

    return { id: user.id, username: user.username };
  }

  @Get('my-profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Get the profile of the currently authenticated user',
  })
  async getMyProfile(
    @Request() req: { user?: User },
  ): Promise<UserResponseDto> {
    if (!req.user?.id) {
      throw new NotFoundException('User not found');
    }
    const user = await this.usersService.findById(req.user.id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return { id: user.id, username: user.username };
  }
}
