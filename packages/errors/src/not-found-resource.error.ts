import { AppError } from "./app-error";

export class NotFoundResourceError extends AppError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 404, details);
  }
}
