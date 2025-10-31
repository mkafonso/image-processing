import fastifyCors from "@fastify/cors";
import fastifyStatic from "@fastify/static";
import Fastify from "fastify";
import path from "path";

import { jobsRoutes } from "./routes/jobs.routes";

const app = Fastify({ logger: true });

app.register(fastifyCors, {
  origin: ["http://localhost:5173"],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
});

app.register(fastifyStatic, {
  root: path.join(__dirname, "../../uploads"),
  prefix: "/uploads/",
  decorateReply: false,
});

app.register(jobsRoutes);

app.get("/api/health", async (_req, reply) => {
  return reply.code(200).send({ status: "ok" });
});

const port = Number(process.env.PORT ?? 3000);
app.listen({ port, host: "0.0.0.0" }).then(() => {
  console.log(`🚀 Server listening on port ${port}`);
});
