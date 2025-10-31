import type { Job } from "../../core/entities/job.entity";
import type { JobsRepositoryPort } from "../../core/ports/jobs-repository.port";

export class MemoryJobsRepository implements JobsRepositoryPort {
  private jobs: Map<string, Job> = new Map();

  private results: Map<string, { buffer: Buffer; filename: string }> =
    new Map();

  async save(job: Job): Promise<void> {
    this.jobs.set(job.id, job);
  }

  async update(job: Job): Promise<void> {
    if (!this.jobs.has(job.id)) {
      throw new Error(`Job with id ${job.id} does not exist`);
    }
    this.jobs.set(job.id, job);
  }

  async findAll(): Promise<Job[]> {
    return Array.from(this.jobs.values());
  }

  async findById(id: string): Promise<Job | null> {
    return this.jobs.get(id) ?? null;
  }

  async updateProgress(jobId: string, progress: number): Promise<void> {
    const job = this.jobs.get(jobId);
    if (!job) throw new Error(`Job with id ${jobId} not found`);
    job.progress = progress;
    this.jobs.set(jobId, job);
  }

  async updateStatus(
    jobId: string,
    status: "pending" | "processing" | "completed" | "failed"
  ): Promise<void> {
    const job = this.jobs.get(jobId);
    if (!job) throw new Error(`Job with id ${jobId} not found`);
    job.status = status;
    this.jobs.set(jobId, job);
  }

  async uploadResult(
    jobId: string,
    buffer: Buffer,
    filename: string
  ): Promise<string> {
    if (!this.jobs.has(jobId)) {
      throw new Error(`Job with id ${jobId} not found`);
    }
    this.results.set(jobId, { buffer, filename });

    return `memory://results/${jobId}/${filename}`;
  }

  async findPaginated(
    page: number,
    pageSize: number
  ): Promise<{ jobs: Job[]; total: number }> {
    const allJobs = Array.from(this.jobs.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
    const total = allJobs.length;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const jobs = allJobs.slice(start, end);

    return { jobs, total };
  }

  async clear(): Promise<void> {
    this.jobs.clear();
    this.results.clear();
  }
}
