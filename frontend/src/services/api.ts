import axios from "axios";

const api = axios.create({
  baseURL: "/api",
});

export const createJob = (imageUrl: string) =>
  api.post("/jobs", { image_url: imageUrl });

export const getJobs = () => api.get("/jobs");

export const getJobById = (id: string) => api.get(`/jobs/${id}`);

export default api;
