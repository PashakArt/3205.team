import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateJobDto } from './dto/request/create-job.dto';
import { randomUUID } from 'crypto';
import { JobDto, JobListItemDto } from './dto/job.dto';
import { CreateJobResponseDto } from './dto/response/create-job.response.dto';
import { UrlCheckResultDto } from './dto/url-check-result.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JobsService {
  private jobs: Map<string, JobDto> = new Map();
  private readonly maxConcurrency: number;

  constructor(configService: ConfigService) {
    this.maxConcurrency = configService.get<number>('MAX_CONCURRENCY', 10);
  }

  create(dto: CreateJobDto): CreateJobResponseDto {
    const id = randomUUID();
    const job: JobDto = {
      id,
      createdAt: new Date(),
      status: 'pending',
      urls: dto.urls.map((url) => ({
        url,
        status: 'pending',
      })),
      stats: {
        total: dto.urls.length,
        processed: 0,
        success: 0,
        error: 0,
      },
    };

    this.jobs.set(id, job);

    setImmediate(() => void this.processJob(id));

    return { jobId: id };
  }

  findAll(): JobListItemDto[] {
    const res: JobListItemDto[] = [];

    for (const { id, stats, status, createdAt } of this.jobs.values()) {
      res.push({
        id,
        createdAt,
        status,
        stats,
      });
    }

    return res;
  }

  findOne(id: string): JobDto {
    const job = this.jobs.get(id);
    if (!job) {
      throw new NotFoundException(`job ${id} not found`);
    }
    return job;
  }

  cancel(id: string) {
    const job = this.findOne(id);

    if (job.status === 'completed' || job.status === 'failed') {
      return job;
    }

    job.status = 'cancelled';
    for (const item of job.urls) {
      if (item.status === 'pending') {
        item.status = 'cancelled';
      }
    }

    return job;
  }

  private async processJob(jobId: string): Promise<void> {
    const job = this.jobs.get(jobId);
    if (!job || this.isJobCancelled(job)) {
      return;
    }
    job.status = 'in_progress';

    const queue = job.urls.filter((item) => {
      return item.status === 'pending';
    });

    if (queue.length === 0) {
      this.updateFinalJobStatus(job);
      return;
    }

    const worker = async (): Promise<void> => {
      while (queue.length > 0) {
        const item = queue.shift();
        if (item) {
          await this.checkUrl(job, item);
        }
      }
    };

    const workerCount = Math.min(this.maxConcurrency, queue.length);
    const workers = Array.from({ length: workerCount }, () => {
      return worker();
    });

    await Promise.all(workers);

    if (!this.isJobCancelled(job)) {
      this.updateFinalJobStatus(job);
    }
  }

  private updateFinalJobStatus(job: JobDto): void {
    const isAllFailed =
      job.stats.total > 0 && job.stats.error === job.stats.total;
    job.status = isAllFailed ? 'failed' : 'completed';
  }

  private async checkUrl(job: JobDto, item: UrlCheckResultDto): Promise<void> {
    if (this.isCancelled(job, item)) {
      return;
    }

    item.status = 'in_progress';
    item.startedAt = new Date();

    // Искусственная случайная задержка (0 - 10 секунд)
    await this.delay(Math.floor(Math.random() * 10000));

    if (this.isCancelled(job, item)) {
      item.status = 'cancelled';
      return;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(item.url, {
        method: 'HEAD',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      item.status = response.ok ? 'success' : 'error';
      item.httpStatus = response.status;
      if (!response.ok) {
        item.errorMessage = `HTTP Status Code ${response.status}`;
      }
    } catch (err: unknown) {
      item.status = 'error';

      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          item.errorMessage = 'Timeout (10с)';
        } else {
          item.errorMessage = err.message;
        }
      } else {
        item.errorMessage = 'Ошибка подключения';
      }
    } finally {
      item.finishedAt = new Date();
      item.durationMs = item.finishedAt.getTime() - item.startedAt.getTime();

      if (item.status === 'success') {
        job.stats.success++;
      }

      if (item.status === 'error') {
        job.stats.error++;
      }

      job.stats.processed++;
    }
  }

  private isCancelled(job: JobDto, item: UrlCheckResultDto): boolean {
    return job.status === 'cancelled' || item.status === 'cancelled';
  }

  private isJobCancelled(job: JobDto): boolean {
    return job.status === 'cancelled';
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
