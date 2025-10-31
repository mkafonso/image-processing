import { Worker } from "bullmq";
import sharp from "sharp";

import { MemoryJobsRepository } from "../../__tests__/repositories/memory-jobs.repository";

const jobsRepository = new MemoryJobsRepository();

const redisHost = process.env.REDIS_HOST ?? "localhost";
const redisPort = process.env.REDIS_PORT ?? "6379";

/**
 * Worker responsible for processing jobs from the "imageProcessing" queue.
 * Each job will:
 *  - Update status and progress in Firestore
 *  - Download the image from URL
 *  - Process the image (resize, grayscale and add watermark)
 *  - Upload result to Firebase Storage
 *  - Update final status
 */
export const worker = new Worker(
  "imageProcessing",
  async (job) => {
    const { jobId, imageUrl } = job.data;

    try {
      // Start processing
      await jobsRepository.updateStatus(jobId, "processing");
      await jobsRepository.updateProgress(jobId, 10);

      // Download original image
      const response = await fetch(imageUrl);
      if (!response.ok)
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      const imageBuffer = Buffer.from(await response.arrayBuffer());

      await jobsRepository.updateProgress(jobId, 30);

      // Process the image with Sharp
      const watermarkText = "Made in China 👻";
      const processedBuffer = await sharp(imageBuffer)
        .resize(800)
        .grayscale()
        .composite([
          {
            input: Buffer.from(
              `<svg height="40" width="800">
                 <text x="10" y="30" font-size="24" fill="white" opacity="0.5">${watermarkText}</text>
               </svg>`
            ),
            gravity: "southeast",
          },
        ])
        .toFormat("png")
        .toBuffer();

      await jobsRepository.updateProgress(jobId, 70);

      // Upload result to Firebase Storage via repository
      const filename = `${jobId}-processed.png`;
      const processedUrl = await jobsRepository.uploadResult(
        jobId,
        processedBuffer,
        filename
      );

      await jobsRepository.updateProgress(jobId, 90);

      // Update final job data
      const jobEntity = await jobsRepository.findById(jobId);
      if (jobEntity) {
        jobEntity.resultUrl = processedUrl;
        jobEntity.updatedAt = new Date();
        await jobsRepository.update(jobEntity);
      }

      await jobsRepository.updateStatus(jobId, "completed");
      await jobsRepository.updateProgress(jobId, 100);

      console.log(`✅ Job ${jobId} completed successfully.`);
    } catch (error: any) {
      console.error(`❌ Job ${job.data.jobId} failed:`, error.message);

      await jobsRepository.updateStatus(jobId, "failed");
      await jobsRepository.updateProgress(jobId, 0);

      throw error;
    }
  },
  {
    concurrency: 5,
    connection: {
      host: redisHost,
      port: Number(redisPort),
    },
  }
);

worker.on("completed", (job) => {
  console.log(`🎉 Job ${job.id} finished.`);
});

worker.on("failed", (job, err) => {
  console.error(`💥 Job ${job?.id} failed:`, err.message);
});
