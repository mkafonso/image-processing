import { beforeEach, describe, expect, it } from "vitest";
import { Job } from "./job.entity";

describe("Core Job Entity", () => {
  let job: Job;

  beforeEach(() => {
    job = new Job({
      id: "fe8c2acd-faa3-4f98-b69d-2695bf8bfc4e",
      imageUrl: "https://example.com/image.png",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  });

  it("should initialize with default values", () => {
    expect(job.id).toBe("fe8c2acd-faa3-4f98-b69d-2695bf8bfc4e");
    expect(job.imageUrl).toBe("https://example.com/image.png");
    expect(job.status).toBe("pending");
    expect(job.progress).toBe(0);
    expect(job.resultUrl).toBeUndefined();
    expect(job.error).toBeUndefined();
  });

  it("should update status and timestamp", () => {
    const oldUpdatedAt = job.updatedAt;
    job.updateStatus("processing");
    expect(job.status).toBe("processing");
    expect(job.updatedAt.getTime()).toBeGreaterThanOrEqual(
      oldUpdatedAt.getTime()
    );
  });

  it("should update progress", () => {
    job.updateProgress(75);
    expect(job.progress).toBe(75);
  });

  it("should handle errors correctly", () => {
    job.setError("Something went wrong");
    expect(job.error).toBe("Something went wrong");
    expect(job.status).toBe("failed");
  });
});
