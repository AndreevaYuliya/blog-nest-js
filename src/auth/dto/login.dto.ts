import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'username123', description: 'Username' })
  username!: string;

  @ApiProperty({ example: 'password123', description: 'Password' })
  password!: string;
}
