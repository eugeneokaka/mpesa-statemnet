import type { Analysis } from "./types";

const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

export class ApiError extends Error {}

export async function analyzeStatement(file: File, pin: string): Promise<Analysis> {
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new ApiError("File is too large (max 4 MB).");
  }

  const form = new FormData();
  form.append("file", file);
  form.append("pin", pin);

  let response: Response;
  try {
    response = await fetch("/api/analyze", {
      method: "POST",
      body: form,
    });
  } catch {
    throw new ApiError(
      "Could not reach the analysis server. Make sure the backend is running.",
    );
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
