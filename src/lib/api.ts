import type { Analysis } from "./types";

const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
const REQUEST_TIMEOUT_MS = 295_000;

export class ApiError extends Error {}

function isAbortError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    (error as { name?: string }).name === "AbortError"
  );
}

export async function analyzeStatement(file: File, pin: string): Promise<Analysis> {
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new ApiError("File is too large (max 4 MB).");
  }

  const form = new FormData();
  form.append("file", file);
  form.append("pin", pin);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch("/api/analyze", {
      method: "POST",
      body: form,
      signal: controller.signal,
    });
  } catch (error) {
    if (isAbortError(error)) {
      throw new ApiError(
        "This statement took too long to analyze. Try a shorter period, for example 3-6 months.",
      );
    }
    throw new ApiError(
      "Could not reach the analysis server. Check your connection and try again.",
    );
  } finally {
    clearTimeout(timer);
  }

  if (!response.ok) {
    let detail = `Request failed (${response.status}).`;
    try {
      const body = await response.json();
      if (typeof body?.detail === "string") {
        detail = body.detail;
      }
    } catch {
      // keep the generic message
    }
    throw new ApiError(detail);
  }

  return (await response.json()) as Analysis;
}
