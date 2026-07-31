import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/request/create-job.dto';
import { ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';
import { CreateJobResponseDto } from './dto/response/create-job.response.dto';
import { JobDto, JobListItemDto } from './dto/job.dto';

@Controller('api/jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  @ApiCreatedResponse({
    type: CreateJobResponseDto,
  })
  create(@Body() createJobDto: CreateJobDto) {
    return this.jobsService.create(createJobDto);
  }

  @Get()
  @ApiOkResponse({ type: [JobListItemDto] })
  findAll() {
    return this.jobsService.findAll();
  }

  @Get(':id')
  @ApiOkResponse({ type: JobDto })
  findOne(@Param('id') id: string) {
    return this.jobsService.findOne(id);
  }

  @Delete(':id')
  @ApiOkResponse({ type: JobDto })
  cancel(@Param('id') id: string) {
    return this.jobsService.cancel(id);
  }
}
