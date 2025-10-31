import type { Job } from "../hooks/useJobs";
import { JobItem } from "./job-item";

type Props = { jobs: Job[] };

export const JobList = (props: Props) => {
  const { jobs } = props;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {jobs?.map((job) => (
        <JobItem key={job.id + new Date().getTime()} {...job} />
      ))}
    </div>
  );
};
