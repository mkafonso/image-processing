import type { Job } from "../hooks/useJobs";

type Props = Job;

export const JobItem = (props: Props) => {
  return (
    <div className="border rounded p-4 mb-4 shadow hover:shadow-lg transition">
      <p className="font-semibold break-all">ID: {props.id}</p>
      <p className="mb-2">
        Status: <span className="font-medium">{props.status}</span>
      </p>

      {props.progress != null && (
        <div className="w-full bg-stone-200 rounded h-4 mb-2">
          <div
            className="bg-green-500 h-4 rounded transition-all"
            style={{ width: `${props.progress}%` }}
          />
        </div>
      )}

      {props.result_url && (
        <img
          src={`http://localhost:3000${props.result_url}`}
          alt="Result"
          className="w-48 h-auto rounded mt-2 border"
        />
      )}

      {props.error && <p className="text-red-500 mt-2">Error: {props.error}</p>}
    </div>
  );
};
