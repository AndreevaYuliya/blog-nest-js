import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import * as bcrypt from 'bcrypt';

import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.usersService.findByUsername(username);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user && (await this.comparePasswords(password, user.password))) {
      const { password, ...result } = user;

      return result;
    }

    return null;
  }

  async login(user: User) {
    const payload = { username: user.username, sub: user.id };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '30d' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  private async comparePasswords(
    plainText: string,
    hashed: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainText, hashed);
  }

  async refreshTokens(refreshToken: string) {
    const isValid = await this.validateRefreshToken(refreshToken);

    if (!isValid) {
      throw new UnauthorizedException();
    }

    const newAccessToken = this.jwtService.sign({ userId: isValid.id });
    const newRefreshToken = this.generateNewRefreshToken(isValid.id);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  private async validateRefreshToken(token: string) {
    const payload = this.jwtService.verify(token);

    if (payload) {
      return this.usersService.findByUsername(payload.username);
    }
    return null;
  }

  private generateNewRefreshToken(userId: number) {
    return this.jwtService.sign({ userId });
  }
}
