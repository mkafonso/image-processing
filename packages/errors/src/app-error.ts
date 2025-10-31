export class AppError extends Error {
  public readonly statusCode: number;
  public readonly details?: Record<string, any>;

  constructor(
    message: string,
    statusCode = 500,
    details?: Record<string, any>
  ) {
    super(message);

    Object.setPrototypeOf(this, new.target.prototype);

    this.name = new.target.name;
    this.statusCode = statusCode;
    this.details = details;
  }
}
