import crypto from "node:crypto";

import { BadRequestError } from "@image-processing/errors";
import { Job } from "../entities/job.entity";
import type { JobsRepositoryPort } from "../ports/jobs-repository.port";
import type { QueueProviderPort } from "../ports/queue-provider.port";

export type NewImageProcessingServiceInput = {
  imageUrl: string;
};

type NewImageProcessingServiceOutput = {};

export class NewImageProcessingService {
  private readonly MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

  constructor(
    private jobsRepository: JobsRepositoryPort,
    private queueProvider: QueueProviderPort
  ) {}

  async execute(
    input: NewImageProcessingServiceInput
  ): Promise<NewImageProcessingServiceOutput> {
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

  private sanitize(
    input: NewImageProcessingServiceInput
  ): NewImageProcessingServiceInput {
    return {
      imageUrl: input.imageUrl.trim(),
    };
  }

  private async validate(input: NewImageProcessingServiceInput): Promise<void> {
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

    let response: Response;
    try {
      response = await fetch(url.toString(), {
        method: "HEAD",
        redirect: "follow",
      });
    } catch {
      throw new BadRequestError("Invalid input", {
        imageUrl: "URL is unreachable or invalid",
      });
    }

    if (!response.ok) {
      try {
        response = await fetch(url.toString(), {
          method: "GET",
          redirect: "follow",
        });
      } catch {
        throw new BadRequestError("Invalid input", {
          imageUrl: "URL is unreachable or invalid",
        });
      }
    }

    if (!response.ok) {
      throw new BadRequestError("Invalid input", {
        imageUrl: `Image not reachable (status ${response.status})`,
      });
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.startsWith("image/")) {
      throw new BadRequestError("Invalid input", {
        imageUrl: "URL does not point to a valid image",
      });
    }

    const pathname = url.pathname.toLowerCase();
    if (
      !/\.(png|jpg|jpeg)$/i.test(pathname) &&
      !["image/png", "image/jpeg"].includes(contentType)
    ) {
      throw new BadRequestError("Invalid input", {
        imageUrl: "Only PNG and JPG image URLs are supported",
      });
    }

    const contentLength = Number(response.headers.get("content-length") ?? 0);
    if (contentLength && contentLength > this.MAX_SIZE_BYTES) {
      throw new BadRequestError("Invalid input", {
        imageUrl: "Image exceeds 10MB size limit",
      });
    }
  }
}
