import { AppError } from "./app-error";

export class BadRequestError extends AppError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 400, details);
  }
}
