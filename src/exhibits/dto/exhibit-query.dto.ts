import { ApiProperty } from '@nestjs/swagger';

import { IsNumber, IsOptional } from 'class-validator';

export class QueryExhibitDto {
  @ApiProperty({
    default: 1,
    description: 'Page number for pagination',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  page?: number;

  @ApiProperty({
    default: 10,
    description: 'Number of items per page',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  limit?: number;
}
