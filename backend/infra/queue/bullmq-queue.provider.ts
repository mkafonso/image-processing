import { Queue } from "bullmq";

import type { Job } from "../../core/entities/job.entity";
import type { QueueProviderPort } from "../../core/ports/queue-provider.port";

export class BullMQQueueProvider implements QueueProviderPort {
  private readonly queue: Queue;

  constructor(
    redisHost: string = process.env.REDIS_HOST ?? "localhost",
    redisPort: string = process.env.REDIS_PORT ?? "6379"
  ) {
    this.queue = new Queue("imageProcessing", {
      connection: {
        host: redisHost,
        port: Number(redisPort),
      },
    });
  }

  async enqueue({ id, imageUrl }: Job): Promise<void> {
    await this.queue.add("process-image", { jobId: id, imageUrl });
  }
}
