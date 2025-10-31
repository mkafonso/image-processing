import { Job } from "../../core/entities/job.entity";

type CreateJobFactoryInput = {
  id?: string;
  imageUrl?: string;
  status?: "pending" | "processing" | "completed" | "failed";
  progress?: number;
  resultUrl?: string;
  error?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export function makeJob(overrides: CreateJobFactoryInput = {}): Job {
  const now = new Date();

  return new Job({
    id: overrides.id ?? crypto.randomUUID(),
    imageUrl: overrides.imageUrl ?? "https://example.com/default.png",
    status: overrides.status ?? "pending",
    progress: overrides.progress ?? 0,
    resultUrl: overrides.resultUrl,
    error: overrides.error,
    createdAt: overrides.createdAt ?? now,
    updatedAt: overrides.updatedAt ?? now,
  });
}
