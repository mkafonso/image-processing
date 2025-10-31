import { describe, expect, it } from "vitest";
import { AppError } from "./app-error";

describe("AppError", () => {
  it("should create an AppError with default status code", () => {
    const error = new AppError("Something went wrong");

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(AppError);
    expect(error.name).toBe("AppError");
    expect(error.message).toBe("Something went wrong");
    expect(error.statusCode).toBe(500);
    expect(error.details).toBeUndefined();
  });

  it("should accept a custom status code and details", () => {
    const error = new AppError("Unauthorized", 401, {
      reason: "Invalid token",
    });

    expect(error.statusCode).toBe(401);
    expect(error.details).toEqual({ reason: "Invalid token" });
  });
});
