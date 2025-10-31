import { BadRequestError } from "@image-processing/errors";
import type { Job } from "../../core/entities/job.entity";
import type { JobsRepositoryPort } from "../../core/ports/jobs-repository.port";

export type ListJobsServiceInput = {
  page?: number;
  pageSize?: number;
};

export type ListJobsServiceOutput = {
  jobs: Job[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

export class ListJobsService {
  private readonly DEFAULT_PAGE = 1;
  private readonly DEFAULT_PAGE_SIZE = 10;
  private readonly MAX_PAGE_SIZE = 100;

  constructor(private jobsRepository: JobsRepositoryPort) {}

  async execute(
    input: ListJobsServiceInput = {}
  ): Promise<ListJobsServiceOutput> {
    const sanitized = this.sanitize(input);
    await this.validate(sanitized);

    const { jobs, total } = await this.jobsRepository.findPaginated(
      sanitized.page,
      sanitized.pageSize
    );

    return {
      jobs,
      pagination: {
        page: sanitized.page,
        pageSize: sanitized.pageSize,
        total,
        totalPages: Math.ceil(total / sanitized.pageSize),
      },
    };
  }

  private sanitize(
    input: ListJobsServiceInput
  ): Required<ListJobsServiceInput> {
    return {
      page: Number(input.page ?? this.DEFAULT_PAGE),
      pageSize: Number(input.pageSize ?? this.DEFAULT_PAGE_SIZE),
    };
  }

  private async validate(input: Required<ListJobsServiceInput>): Promise<void> {
    const errors: Record<string, string> = {};

    if (!Number.isInteger(input.page) || input.page < 1) {
      errors.page = "Page must be an integer greater than 0";
    }

    if (
      !Number.isInteger(input.pageSize) ||
      input.pageSize < 1 ||
      input.pageSize > this.MAX_PAGE_SIZE
    ) {
      errors.pageSize = `Page size must be between 1 and ${this.MAX_PAGE_SIZE}`;
    }

    if (Object.keys(errors).length > 0) {
      throw new BadRequestError("Invalid input", errors);
    }
  }
}
