import { JobForm } from "./components/job-form";
import { JobList } from "./components/job-list";
import { useJobs } from "./hooks/useJobs";

export function App() {
  const { jobsData, refetch } = useJobs();

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-600">
        Image Processing Pipeline
      </h1>

      <JobForm onJobCreated={refetch} />
      <JobList jobs={jobsData.jobs} />
    </div>
  );
}
