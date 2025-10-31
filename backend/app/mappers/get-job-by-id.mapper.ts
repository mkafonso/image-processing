import type { GetJobByIdServiceOutput } from "../../core/services/get-job-by-id.service";

export class GetJobByIdMapper {
  static toHttp(output: GetJobByIdServiceOutput) {
    return {
      jobs: {
        id: output.id,
        image_url: output.imageUrl,
        status: output.status,
        progress: output.progress,
        result_url: output.resultUrl ?? null,
        error: output.error ?? null,
        created_at: output.createdAt.toISOString(),
        updated_at: output.updatedAt.toISOString(),
      },
    };
  }
}
