import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const createJob = (imageUrl: string) =>
  api.post("/jobs", { image_url: imageUrl });

export const getJobs = () => api.get("/jobs");

export const getJobById = (id: string) => api.get(`/jobs/${id}`);

export default api;
