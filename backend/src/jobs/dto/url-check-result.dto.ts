import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export type UrlStatus =
  'pending' | 'in_progress' | 'success' | 'error' | 'cancelled';

export class UrlCheckResultDto {
  @ApiProperty({ example: 'https://google.com' })
  url!: string;

  @ApiProperty({
    enum: ['pending', 'in_progress', 'success', 'error', 'cancelled'],
  })
  status!: UrlStatus;

  @ApiPropertyOptional({ example: 200 })
  httpStatus?: number;

  @ApiPropertyOptional({ example: 'HTTP Status Code 404' })
  errorMessage?: string;

  @ApiPropertyOptional({ example: '2026-07-31T00:00:00.000Z' })
  startedAt?: Date;

  @ApiPropertyOptional({ example: '2026-07-31T00:00:02.000Z' })
  finishedAt?: Date;

  @ApiPropertyOptional({ example: 2000 })
  durationMs?: number;
}
