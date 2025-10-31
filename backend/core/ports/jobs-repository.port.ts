import type { Job } from "../entities/job.entity";

export interface JobsRepositoryPort {
  save(job: Job): Promise<void>;
}
