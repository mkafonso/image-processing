import { describe, expect, it } from "vitest";
import { AppError } from "./app-error";
import { NotFoundResourceError } from "./not-found-resource.error";

describe("NotFoundResourceError", () => {
  it("should create a NotFoundResourceError with status code 404", () => {
    const error = new NotFoundResourceError("Invalid input");

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(AppError);
    expect(error).toBeInstanceOf(NotFoundResourceError);
    expect(error.name).toBe("NotFoundResourceError");
    expect(error.message).toBe("Invalid input");
    expect(error.statusCode).toBe(404);
    expect(error.details).toBeUndefined();
  });

  it("should accept details in the error", () => {
    const error = new NotFoundResourceError("Invalid input", {
      jobId: "resource not found",
    });

    expect(error.details).toEqual({ jobId: "resource not found" });
  });
});
