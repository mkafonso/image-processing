import type { Job } from "../../core/entities/job.entity";
import type { QueueProviderPort } from "../../core/ports/queue-provider.port";

export class MemoryQueueProvider implements QueueProviderPort {
  public enqueued: Job[] = [];

  async enqueue(job: Job): Promise<void> {
    this.enqueued.push(job);
  }

  async clear(): Promise<void> {
    this.enqueued = [];
  }
}
