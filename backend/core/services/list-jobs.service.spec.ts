import { BadRequestError } from "@image-processing/errors";
import { beforeEach, describe, expect, it } from "vitest";
import { makeJob } from "../../__tests__/factories/job.factory";
import { MemoryJobsRepository } from "../../__tests__/repositories/memory-jobs.repository";
import { ListJobsService } from "./list-jobs.service";

describe("ListJobsService", () => {
  let jobsRepository: MemoryJobsRepository;
  let service: ListJobsService;

  beforeEach(() => {
    jobsRepository = new MemoryJobsRepository();
    service = new ListJobsService(jobsRepository);
  });

  it("should return empty list when there are no jobs", async () => {
    const result = await service.execute();
    expect(result.jobs).toHaveLength(0);
    expect(result.pagination).toEqual({
      page: 1,
      pageSize: 10,
      total: 0,
      totalPages: 0,
    });
  });

  it("should return all jobs with default pagination", async () => {
    await jobsRepository.save(makeJob({ id: "1" }));
    await jobsRepository.save(makeJob({ id: "2" }));

    const result = await service.execute();

    expect(result.jobs).toHaveLength(2);
    expect(result.pagination).toEqual({
      page: 1,
      pageSize: 10,
      total: 2,
      totalPages: 1,
    });
  });

  it("should return paginated results correctly", async () => {
    for (let i = 1; i <= 15; i++) {
      await jobsRepository.save(
        makeJob({
          id: String(i),
          createdAt: new Date(Date.now() - i * 1000),
        })
      );
    }

    const result = await service.execute({ page: 2, pageSize: 5 });

    expect(result.jobs).toHaveLength(5);
    expect(result.pagination).toEqual({
      page: 2,
      pageSize: 5,
      total: 15,
      totalPages: 3,
    });

    const timestamps = result.jobs.map((j) => j.createdAt.getTime());
    expect(timestamps).toEqual([...timestamps].sort((a, b) => b - a));
  });

  it("should use default values when input is empty", async () => {
    const result = await service.execute({});
    expect(result.pagination.page).toBe(1);
    expect(result.pagination.pageSize).toBe(10);
  });

  it("should throw BadRequestError for invalid page number", async () => {
    await expect(service.execute({ page: 0 })).rejects.toBeInstanceOf(
      BadRequestError
    );
  });

  it("should throw BadRequestError for non-integer pageSize", async () => {
    await expect(service.execute({ pageSize: 2.5 })).rejects.toBeInstanceOf(
      BadRequestError
    );
  });

  it("should throw BadRequestError for pageSize above max", async () => {
    await expect(service.execute({ pageSize: 101 })).rejects.toBeInstanceOf(
      BadRequestError
    );
  });

  it("should throw BadRequestError for negative page", async () => {
    await expect(service.execute({ page: -1 })).rejects.toBeInstanceOf(
      BadRequestError
    );
  });
});
