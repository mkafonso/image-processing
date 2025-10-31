import type { ListJobsServiceOutput } from "../../core/services/list-jobs.service";

export class ListJobsMapper {
  static toHttp(output: ListJobsServiceOutput) {
    return {
      jobs: output.jobs.map((job) => ({
        id: job.id,
        image_url: job.imageUrl,
        status: job.status,
        progress: job.progress,
        result_url: job.resultUrl ?? null,
        error: job.error ?? null,
        created_at: job.createdAt.toISOString(),
        updated_at: job.updatedAt.toISOString(),
      })),
      pagination: {
        page: output.pagination.page,
        page_size: output.pagination.pageSize,
        total: output.pagination.total,
        total_pages: output.pagination.totalPages,
      },
    };
  }
}
