import { BadRequestError } from "@image-processing/errors";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryQueueProvider } from "../../__tests__/providers/memory-queue.provider";
import { MemoryJobsRepository } from "../../__tests__/repositories/memory-jobs.repository";
import { Job } from "../entities/job.entity";
import { NewImageProcessingService } from "./new-image-processing.service";

describe("NewImageProcessingService", () => {
  let jobsRepository: MemoryJobsRepository;
  let queueProvider: MemoryQueueProvider;
  let service: NewImageProcessingService;

  beforeEach(() => {
    jobsRepository = new MemoryJobsRepository();
    queueProvider = new MemoryQueueProvider();
    service = new NewImageProcessingService(jobsRepository, queueProvider);
    vi.restoreAllMocks();
  });

  const mockFetch = (status = 200, headers: Record<string, string> = {}) => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: status >= 200 && status < 300,
        status,
        headers: {
          get: (key: string) => headers[key.toLowerCase()],
        },
      })
    );
  };

  it("should create and enqueue a job for a valid PNG image", async () => {
    mockFetch(200, {
      "content-type": "image/png",
      "content-length": "1024",
    });

    const input = { imageUrl: "https://example.com/image.png" };
    await service.execute(input);

    const jobs = await jobsRepository.findAll();
    expect(jobs).toHaveLength(1);
    expect(jobs[0]).toBeInstanceOf(Job);
    expect(queueProvider.enqueued).toHaveLength(1);
    expect(queueProvider.enqueued[0]?.imageUrl).toBe(input.imageUrl);
  });

  it("should trim spaces around URL before processing", async () => {
    mockFetch(200, {
      "content-type": "image/jpeg",
      "content-length": "2048",
    });

    const input = { imageUrl: "   https://example.com/photo.jpg   " };
    await service.execute(input);

    expect(jobsRepository.findAll()).resolves.toHaveLength(1);
    expect(queueProvider.enqueued[0]?.imageUrl).toBe(
      "https://example.com/photo.jpg"
    );
  });

  it("should throw BadRequestError if imageUrl is empty", async () => {
    await expect(service.execute({ imageUrl: "   " })).rejects.toBeInstanceOf(
      BadRequestError
    );
  });

  it("should throw BadRequestError for invalid URL format", async () => {
    await expect(
      service.execute({ imageUrl: "not-a-url" })
    ).rejects.toBeInstanceOf(BadRequestError);
  });

  it("should throw BadRequestError for disallowed protocol", async () => {
    await expect(
      service.execute({ imageUrl: "ftp://example.com/image.png" })
    ).rejects.toBeInstanceOf(BadRequestError);
  });

  it("should throw BadRequestError if URL is unreachable", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("network fail"))
    );

    await expect(
      service.execute({ imageUrl: "https://example.com/image.png" })
    ).rejects.toBeInstanceOf(BadRequestError);
  });

  it("should throw BadRequestError if remote returns non-OK status", async () => {
    mockFetch(404, { "content-type": "image/png" });

    await expect(
      service.execute({ imageUrl: "https://example.com/image.png" })
    ).rejects.toBeInstanceOf(BadRequestError);
  });

  it("should throw BadRequestError if image exceeds 10MB", async () => {
    mockFetch(200, {
      "content-type": "image/jpeg",
      "content-length": String(11 * 1024 * 1024), // 11MB
    });

    await expect(
      service.execute({ imageUrl: "https://example.com/huge.jpg" })
    ).rejects.toBeInstanceOf(BadRequestError);
  });
});
