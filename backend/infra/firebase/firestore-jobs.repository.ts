import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import { Job } from "../../core/entities/job.entity";
import type { JobsRepositoryPort } from "../../core/ports/jobs-repository.port";
import { firestore } from "./firebase";

export class FirestoreJobsRepository implements JobsRepositoryPort {
  private collection = firestore.collection("jobs");

  async save(job: Job): Promise<void> {
    await this.collection.doc(job.id).set({
      ...job,
      createdAt: job.createdAt.toISOString(),
      updatedAt: job.updatedAt.toISOString(),
    });
  }

  async update(job: Job): Promise<void> {
    await this.collection.doc(job.id).update({
      ...job,
      updatedAt: new Date().toISOString(),
    });
  }

  async findAll(): Promise<Job[]> {
    const snapshot = await this.collection.orderBy("createdAt", "desc").get();
    return snapshot.docs.map((doc) => this.mapToEntity(doc.data()));
  }

  async findById(id: string): Promise<Job | null> {
    const doc = await this.collection.doc(id).get();
    if (!doc.exists) return null;
    return this.mapToEntity(doc.data());
  }

  async updateProgress(jobId: string, progress: number): Promise<void> {
    await this.collection.doc(jobId).update({
      progress,
      updatedAt: new Date().toISOString(),
    });
  }

  async updateStatus(
    jobId: string,
    status: "pending" | "processing" | "completed" | "failed"
  ): Promise<void> {
    await this.collection.doc(jobId).update({
      status,
      updatedAt: new Date().toISOString(),
    });
  }

  async saveImageInputForDebug(jobId: string, buffer: Buffer): Promise<void> {
    const hash = crypto.createHash("sha1").update(buffer).digest("hex");
    const baseDir = path.resolve(__dirname, "../../../uploads/results", hash);
    const originalPath = path.join(baseDir, "original.png");

    if (!fs.existsSync(originalPath)) {
      await fs.promises.mkdir(baseDir, { recursive: true });
      await fs.promises.writeFile(originalPath, buffer);
      console.log(`📸 Saved new original image (hash=${hash})`);
    } else {
      console.log(`♻️ Reusing existing original image (hash=${hash})`);
    }

    await this.collection.doc(jobId).update({ imageHash: hash });
  }

  async uploadResult(
    jobId: string,
    buffer: Buffer,
    filename: string
  ): Promise<string> {
    const doc = await this.collection.doc(jobId).get();
    const data = doc.data();
    const hash = data?.imageHash ?? "unknown";

    const baseDir = path.resolve(__dirname, "../../../uploads/results", hash);
    await fs.promises.mkdir(baseDir, { recursive: true });

    const resultPath = path.join(baseDir, `${jobId}-${filename}`);
    await fs.promises.writeFile(resultPath, buffer);

    const resultUrl = `/uploads/results/${hash}/${jobId}-${filename}`;
    await this.collection.doc(jobId).update({ resultUrl });

    return resultUrl;
  }

  async findPaginated(
    page: number,
    pageSize: number
  ): Promise<{ jobs: Job[]; total: number }> {
    const snapshot = await this.collection.orderBy("createdAt", "desc").get();
    const allJobs = snapshot.docs.map((doc) => this.mapToEntity(doc.data()));

    const total = allJobs.length;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const jobs = allJobs.slice(start, end);

    return { jobs, total };
  }

  private mapToEntity(data: any): Job {
    const toDate = (value: any): Date => {
      if (value instanceof Date) return value;
      if (value && typeof value.toDate === "function") return value.toDate();
      const parsed = new Date(value);
      return isNaN(parsed.getTime()) ? new Date(0) : parsed;
    };

    return new Job({
      id: data.id,
      imageUrl: data.imageUrl,
      status: data.status,
      progress: data.progress ?? 0,
      createdAt: toDate(data.createdAt),
      updatedAt: toDate(data.updatedAt),
      resultUrl: data.resultUrl ?? undefined,
    });
  }
}
