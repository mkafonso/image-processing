import Fastify from "fastify";

import { jobsRoutes } from "./routes/jobs.routes";

const app = Fastify({ logger: true });

app.register(jobsRoutes);

const port = Number(process.env.PORT ?? 3000);
app.listen({ port, host: "0.0.0.0" }).then(() => {
  console.log(`🚀 Server listening on port ${port}`);
});
