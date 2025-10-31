import type { Job } from "../../core/entities/job.entity";
import type { JobsRepositoryPort } from "../../core/ports/jobs-repository.port";

export class MemoryJobsRepository implements JobsRepositoryPort {
  private jobs: Map<string, Job> = new Map();

  async save(job: Job): Promise<void> {
    this.jobs.set(job.id, job);
  }

  async findAll(): Promise<Job[]> {
    return Array.from(this.jobs.values());
  }

  async clear(): Promise<void> {
    this.jobs.clear();
  }
}
