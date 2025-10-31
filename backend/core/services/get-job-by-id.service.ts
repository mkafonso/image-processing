import {
  BadRequestError,
  NotFoundResourceError,
} from "@image-processing/errors";
import type { Job } from "../../core/entities/job.entity";
import type { JobsRepositoryPort } from "../../core/ports/jobs-repository.port";

export type GetJobByIdServiceInput = {
  id: string;
};

export type GetJobByIdServiceOutput = Job;

export class GetJobByIdService {
  constructor(private jobsRepository: JobsRepositoryPort) {}

  async execute(
    input: GetJobByIdServiceInput
  ): Promise<GetJobByIdServiceOutput> {
    await this.validate(input);

    const job = await this.jobsRepository.findById(input.id);

    if (!job) {
      throw new NotFoundResourceError(`Job with ID ${input.id} not found`);
    }

    return job;
  }

  private async validate(input: GetJobByIdServiceInput): Promise<void> {
    if (!input.id || typeof input.id !== "string" || input.id.trim() === "") {
      throw new BadRequestError("Invalid or missing job ID");
    }
  }
}
