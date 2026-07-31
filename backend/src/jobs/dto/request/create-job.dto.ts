import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsUrl, ArrayMinSize } from 'class-validator';

const ARRAY_MIN_SIZE = 1;

export class CreateJobDto {
  @ApiProperty({
    description: 'URL list for checking',
    example: ['https://example.com', 'https://google.com'],
  })
  @IsArray()
  @ArrayMinSize(ARRAY_MIN_SIZE)
  @IsUrl({}, { each: true })
  urls!: string[];
}
