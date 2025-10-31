import fastifyStatic from "@fastify/static";
import Fastify from "fastify";
import path from "path";

import { jobsRoutes } from "./routes/jobs.routes";

const app = Fastify({ logger: true });

app.register(fastifyStatic, {
  root: path.join(__dirname, "../../uploads"),
  prefix: "/uploads/",
  decorateReply: false,
});

app.register(jobsRoutes);

const port = Number(process.env.PORT ?? 3000);
app.listen({ port, host: "0.0.0.0" }).then(() => {
  console.log(`🚀 Server listening on port ${port}`);
});
