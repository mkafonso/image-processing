import { useEffect, useState } from "react";

import { getJobs } from "../services/api";
import { listenJob } from "../services/firebase";

export type Pagination = {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
};

export type Job = {
  id: string;
  image_url: string;
  status: string;
  progress: number;
  result_url?: string;
  error?: string | null;
  created_at: string;
  updated_at: string;
};

export type Jobs = {
  jobs: Job[];
  pagination: Pagination;
};

export const useJobs = () => {
  const [jobsData, setJobsData] = useState<Jobs>({
    jobs: [],
    pagination: { page: 1, page_size: 10, total: 0, total_pages: 0 },
  });

  const refetch = async () => {
    const res = await getJobs();
    setJobsData(res.data);
  };

  useEffect(() => {
    refetch();
  }, []);

  useEffect(() => {
    const listeners: (() => void)[] = [];

    jobsData.jobs.forEach((job) => {
      const unsubscribe = listenJob(job.id, (updatedJob) => {
        const mapped = {
          id: updatedJob.id ?? job.id,
          image_url: updatedJob.imageUrl ?? job.image_url,
          status: updatedJob.status ?? job.status,
          progress: updatedJob.progress ?? job.progress,
          result_url: updatedJob.resultUrl ?? job.result_url,
          error: updatedJob.error ?? job.error,
          created_at: updatedJob.createdAt ?? job.created_at,
          updated_at: updatedJob.updatedAt ?? job.updated_at,
        } as Job;

        setJobsData((prev) => ({
          ...prev,
          jobs: prev.jobs.map((j) =>
            j.id === job.id ? { ...j, ...mapped } : j
          ),
        }));
      });

      listeners.push(unsubscribe);
    });

    return () => {
      listeners.forEach((unsub) => unsub());
    };
  }, [jobsData.jobs.map((j) => j.id).join(",")]);

  return { jobsData, setJobsData, refetch };
};
