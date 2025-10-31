import type { FastifyInstance } from "fastify";

import { GetJobByIdService } from "../../core/services/get-job-by-id.service";
import {
  ListJobsService,
  type ListJobsServiceInput,
} from "../../core/services/list-jobs.service";
import { NewImageProcessingService } from "../../core/services/new-image-processing.service";
import { FirestoreJobsRepository } from "../../infra/firebase/firestore-jobs.repository";
import { BullMQQueueProvider } from "../../infra/queue/bullmq-queue.provider";
import { GetJobByIdMapper } from "../mappers/get-job-by-id.mapper";
import { ListJobsMapper } from "../mappers/list-jobs.mapper";

export async function jobsRoutes(app: FastifyInstance) {
  const jobsRepository = new FirestoreJobsRepository();
  const queueProvider = new BullMQQueueProvider();

  app.get("/api/jobs", async (request, reply) => {
    try {
      const query = request.query as ListJobsServiceInput;

      const service = new ListJobsService(jobsRepository);
      const response = await service.execute({
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

  app.post("/api/jobs", async (request, reply) => {
    try {
      const { image_url } = request.body as { image_url: string };

      const service = new NewImageProcessingService(
        jobsRepository,
        queueProvider
      );

      await service.execute({ imageUrl: image_url ?? "" });

      return reply.code(201).send();
    } catch (err: any) {
      console.error(err);

      if (err.name === "BadRequestError") {
        return reply.code(400).send({
          message: err.message,
          errors: err.errors ?? {},
        });
      }

      return reply.code(500).send({
        message: "Failed to create job",
        error: err.message ?? err,
      });
    }
  });

  app.get("/api/jobs/:id", async (request, reply) => {
    try {
      const { id } = request.params as { id: string };

      const service = new GetJobByIdService(jobsRepository);
      const response = await service.execute({ id });

      const httpResponse = GetJobByIdMapper.toHttp(response);

      return reply.code(200).send(httpResponse);
    } catch (err: any) {
      console.error(err);

      if (err.name === "BadRequestError") {
        return reply.code(400).send({
          message: err.message,
          errors: err.errors ?? {},
        });
      }

      if (err.name === "NotFoundResourceError") {
        return reply.code(404).send({ message: err.message });
      }

      return reply.code(500).send({
        message: "Failed to get job",
        error: err.message ?? err,
      });
    }
  });
}
