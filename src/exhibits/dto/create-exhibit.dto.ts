import { ApiProperty } from '@nestjs/swagger';

import { IsNotEmpty, IsString } from 'class-validator';

export class CreateExhibitDto {
  @ApiProperty({
    description: 'Description of the exhibit',
    example: 'This is the description of my first exhibit.',
  })
  @IsString()
  @IsNotEmpty()
  description!: string;
}
