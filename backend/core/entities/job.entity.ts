export type JobStatus = "pending" | "processing" | "completed" | "failed";

export type JobProps = {
  id: string;
  imageUrl: string;
  status?: JobStatus;
  progress?: number;
  resultUrl?: string;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
};

export class Job {
  public readonly id: string;
  public readonly imageUrl: string;
  public status: JobStatus;
  public progress: number;
  public resultUrl?: string;
  public error?: string;
  public readonly createdAt: Date;
  public updatedAt: Date;

  constructor(props: JobProps) {
    this.id = props.id;
    this.imageUrl = props.imageUrl;
    this.status = props.status ?? "pending";
    this.progress = props.progress ?? 0;
    this.resultUrl = props.resultUrl;
    this.error = props.error;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  updateStatus(status: JobStatus) {
    this.status = status;
    this.touch();
  }

  updateProgress(progress: number) {
    this.progress = progress;
    this.touch();
  }

  setError(error: string) {
    this.error = error;
    this.status = "failed";
    this.touch();
  }

  private touch() {
    this.updatedAt = new Date();
  }
}
