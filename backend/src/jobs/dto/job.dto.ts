import { ApiProperty } from '@nestjs/swagger';
import { UrlCheckResultDto } from './url-check-result.dto';

export type JobStatus =
  'pending' | 'in_progress' | 'completed' | 'cancelled' | 'failed';

export class JobStatsDto {
  @ApiProperty({ example: 5 })
  total!: number;

  @ApiProperty({ example: 3 })
  processed!: number;

  @ApiProperty({ example: 2 })
  success!: number;

  @ApiProperty({ example: 1 })
  error!: number;
}

export class JobListItemDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id!: string;

  @ApiProperty({ example: '2026-07-31T00:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({
    enum: ['pending', 'in_progress', 'completed', 'cancelled', 'failed'],
  })
  status!: JobStatus;

  @ApiProperty({ type: JobStatsDto })
  stats!: JobStatsDto;
}

export class JobDto extends JobListItemDto {
  @ApiProperty({ type: [UrlCheckResultDto] })
  urls!: UrlCheckResultDto[];
}
