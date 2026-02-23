import { ApiProperty } from '@nestjs/swagger';

import { ExhibitResponseDto } from './exhibit-response.dto';

export class PaginatedExhibitsDto {
  @ApiProperty({ type: () => [ExhibitResponseDto] })
  data!: ExhibitResponseDto[];

  @ApiProperty({ example: 100 })
  total!: number;

  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 10 })
  lastPage!: number;
}
