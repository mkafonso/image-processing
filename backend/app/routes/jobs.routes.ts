import type { FastifyInstance } from "fastify";

import { MemoryJobsRepository } from "../../__tests__/repositories/memory-jobs.repository";
import {
  ListJobsService,
  type ListJobsServiceInput,
} from "../../core/services/list-jobs.service";
import { ListJobsMapper } from "../mappers/list-jobs.mapper";

export async function jobsRoutes(app: FastifyInstance) {
  const jobsRepository = new MemoryJobsRepository();

  app.get("/api/jobs", async (request, reply) => {
    try {
      const query = request.query as ListJobsServiceInput;

      const listJobsService = new ListJobsService(jobsRepository);
      const response = await listJobsService.execute({
        page: query.page ? Number(query.page) : undefined,
        pageSize: query.pageSize ? Number(query.pageSize) : undefined,
      });

      const httpResponse = ListJobsMapper.toHttp(response);

      return reply.code(200).send(httpResponse);
    } catch (err) {
      console.error(err);
      return reply.code(500).send({ message: "Failed to list jobs" });
    }
  });
}
