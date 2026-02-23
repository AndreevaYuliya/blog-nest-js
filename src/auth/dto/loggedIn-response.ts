import { ApiProperty } from '@nestjs/swagger';

export class LoggedInResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Access token',
  })
  access_token!: string;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Refresh token',
  })
  refresh_token!: string;

  @ApiProperty({ example: 1, description: 'User ID' })
  userId!: number;

  @ApiProperty({ example: 'username123', description: 'Username' })
  userName!: string;
}
