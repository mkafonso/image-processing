import type { Job } from "../entities/job.entity";

export interface QueueProviderPort {
  enqueue(job: Job): Promise<void>;
}
