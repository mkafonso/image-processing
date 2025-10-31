import {
  BadRequestError,
  NotFoundResourceError,
} from "@image-processing/errors";
import { beforeEach, describe, expect, it } from "vitest";
import { makeJob } from "../../__tests__/factories/job.factory";
import { MemoryJobsRepository } from "../../__tests__/repositories/memory-jobs.repository";
import { GetJobByIdService } from "./get-job-by-id.service";

describe("GetJobByIdService", () => {
  let jobsRepository: MemoryJobsRepository;
  let service: GetJobByIdService;

  beforeEach(() => {
    jobsRepository = new MemoryJobsRepository();
    service = new GetJobByIdService(jobsRepository);
  });

  it("should return a job when given a valid ID", async () => {
    const job = makeJob({ id: "123" });
    await jobsRepository.save(job);

    const result = await service.execute({ id: "123" });

    expect(result).toEqual(job);
  });

  it("should throw NotFoundResourceError if job does not exist", async () => {
    await expect(
      service.execute({ id: "non-existent" })
    ).rejects.toBeInstanceOf(NotFoundResourceError);
  });

  it("should throw BadRequestError if id is missing", async () => {
    // @ts-expect-error intentional invalid input
    await expect(service.execute({})).rejects.toBeInstanceOf(BadRequestError);
  });

  it("should throw BadRequestError if id is empty string", async () => {
    await expect(service.execute({ id: "" })).rejects.toBeInstanceOf(
      BadRequestError
    );
  });

  it("should throw BadRequestError if id is not a string", async () => {
    // @ts-expect-error intentional invalid input
    await expect(service.execute({ id: 123 })).rejects.toBeInstanceOf(
      BadRequestError
    );
  });
});
