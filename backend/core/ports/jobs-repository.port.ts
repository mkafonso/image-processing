import type { Job } from "../entities/job.entity";

export interface JobsRepositoryPort {
  save(job: Job): Promise<void>;
  update(job: Job): Promise<void>;
  findAll(): Promise<Job[]>;
  findById(id: string): Promise<Job | null>;
  updateProgress(jobId: string, progress: number): Promise<void>;
  updateStatus(
    jobId: string,
    status: "pending" | "processing" | "completed" | "failed"
  ): Promise<void>;
  uploadResult(
    jobId: string,
    buffer: Buffer,
    filename: string
  ): Promise<string>;
}
