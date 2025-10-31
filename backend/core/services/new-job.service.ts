import crypto from "node:crypto";

import { BadRequestError } from "@image-processing/errors";
import { Job } from "../entities/job.entity";
import type { JobsRepositoryPort } from "../ports/jobs-repository.port";
import type { QueueProviderPort } from "../ports/queue-provider.port";

type NewJobServiceInput = {
  imageUrl: string;
};

type NewJobServiceExport = {};

export class NewJobService {
  private readonly MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

  constructor(
    private jobsRepository: JobsRepositoryPort,
    private queueProvider: QueueProviderPort
  ) {}

  async execute(input: NewJobServiceInput): Promise<NewJobServiceExport> {
    const sanitizedInput = this.sanitize(input);
    await this.validate(sanitizedInput);

    const job = new Job({
      id: crypto.randomUUID(),
      imageUrl: sanitizedInput.imageUrl,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.jobsRepository.save(job);
    await this.queueProvider.enqueue(job);
    return {};
  }

  private sanitize(input: NewJobServiceInput): NewJobServiceInput {
    return {
      imageUrl: input.imageUrl.trim(),
    };
  }

  private async validate(input: NewJobServiceInput): Promise<void> {
    if (!input.imageUrl || input.imageUrl.trim().length === 0) {
      throw new BadRequestError("Invalid input", {
        imageUrl: "Image URL is required",
      });
    }

    let url: URL;
    try {
      url = new URL(input.imageUrl);
    } catch {
      throw new BadRequestError("Invalid input", {
        imageUrl: "Invalid URL format",
      });
    }

    if (!["http:", "https:"].includes(url.protocol)) {
      throw new BadRequestError("Invalid input", {
        imageUrl: "Only HTTP and HTTPS URLs are allowed",
      });
    }

    if (!/\.(png|jpg|jpeg)$/i.test(url.pathname)) {
      throw new BadRequestError("Invalid input", {
        imageUrl: "Only PNG and JPG image URLs are supported",
      });
    }

    let response: Response;
    try {
      response = await fetch(url.toString(), { method: "HEAD" });
    } catch {
      throw new BadRequestError("Invalid input", {
        imageUrl: "URL is unreachable or invalid",
      });
    }

    if (!response.ok) {
      throw new BadRequestError("Invalid input", {
        imageUrl: `Image not reachable (status ${response.status})`,
      });
    }

    const contentLength = Number(response.headers.get("content-length") ?? 0);
    if (contentLength > this.MAX_SIZE_BYTES) {
      throw new BadRequestError("Invalid input", {
        imageUrl: "Image exceeds 10MB size limit",
      });
    }
  }
}
