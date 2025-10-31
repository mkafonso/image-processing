import { describe, expect, it } from "vitest";
import { AppError } from "./app-error";
import { BadRequestError } from "./bad-request.error";

describe("BadRequestError", () => {
  it("should create a BadRequestError with status code 400", () => {
    const error = new BadRequestError("Invalid input");

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(AppError);
    expect(error).toBeInstanceOf(BadRequestError);
    expect(error.name).toBe("BadRequestError");
    expect(error.message).toBe("Invalid input");
    expect(error.statusCode).toBe(400);
    expect(error.details).toBeUndefined();
  });

  it("should accept details in the error", () => {
    const error = new BadRequestError("Invalid input", {
      email: "Formato inválido",
    });

    expect(error.details).toEqual({ email: "Formato inválido" });
  });
});
