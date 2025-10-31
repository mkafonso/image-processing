import { useState } from "react";

import { createJob } from "../services/api";

type Props = {
  onJobCreated: () => void;
};

export function JobForm(props: Props) {
  const { onJobCreated } = props;
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createJob(url);
      onJobCreated();
      setUrl("");
    } catch (err: any) {
      alert(err.response?.data?.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 mb-6">
      <input
        type="url"
        placeholder="Enter image URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        required
        className="border border-stone-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-stone-400"
      >
        {loading ? "Sending..." : "Submit"}
      </button>
    </form>
  );
}
