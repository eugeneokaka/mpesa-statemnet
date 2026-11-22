import { AwsClient } from "aws4fetch";

export const maxDuration = 300;

const MAX_BYTES = 4 * 1024 * 1024;
const MULTIPART_OVERHEAD = 64 * 1024;
const UPSTREAM_TIMEOUT_MS = 295_000;

function trimBase(value: string | undefined): string {
  return (value ?? "").replace(/\/+$/, "");
}

function mode(): string {
  return process.env.API_MODE ?? (process.env.NODE_ENV === "production" ? "lambda" : "local");
}

function targetUrl(): string | null {
  if (mode() === "lambda") {
    const base = trimBase(process.env.LAMBDA_FUNCTION_URL);
    return base ? `${base}/api/analyze` : null;
  }
  const base = trimBase(process.env.LOCAL_API_URL ?? "http://localhost:8000");
  return `${base}/api/analyze`;
}

export async function POST(request: Request) {
  const started = Date.now();
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().startsWith("multipart/form-data")) {
    return Response.json(
      { detail: "Expected a multipart/form-data upload." },
      { status: 400 },
    );
  }

  const body = await request.arrayBuffer();
  if (body.byteLength === 0) {
    return Response.json({ detail: "The uploaded file is empty." }, { status: 400 });
  }
  if (body.byteLength > MAX_BYTES + MULTIPART_OVERHEAD) {
    return Response.json(
      { detail: "File is too large (max 4 MB)." },
      { status: 413 },
    );
  }

  const selectedMode = mode();
  const url = targetUrl();
  console.log(
    `[analyze] request mode=${selectedMode} bytes=${body.byteLength} configured=${Boolean(url)}`,
  );

  if (!url) {
    console.error(
      "[analyze] not configured env=" +
        JSON.stringify({
          hasLambdaFunctionUrl: Boolean(process.env.LAMBDA_FUNCTION_URL),
          hasAwsRegion: Boolean(process.env.AWS_REGION),
          hasAccessKeyId: Boolean(process.env.AWS_ACCESS_KEY_ID),
          hasSecretAccessKey: Boolean(process.env.AWS_SECRET_ACCESS_KEY),
        }),
    );
    return Response.json(
      { detail: "The analysis service is not configured." },
      { status: 500 },
    );
  }

  const init: RequestInit = {
    method: "POST",
    headers: { "content-type": contentType },
    body,
    signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
  };

  try {
    let response: Response;
    if (selectedMode === "lambda") {
      const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
      const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
      const region = process.env.AWS_REGION;
      if (!accessKeyId || !secretAccessKey || !region) {
        console.error(
          "[analyze] missing AWS config for lambda mode env=" +
            JSON.stringify({
              hasAccessKeyId: Boolean(accessKeyId),
              hasSecretAccessKey: Boolean(secretAccessKey),
              hasAwsRegion: Boolean(region),
            }),
        );
        return Response.json(
          { detail: "The analysis service is not configured." },
          { status: 500 },
        );
      }

      console.log(
        `[analyze] signing lambda request host=${new URL(url).host} path=${new URL(url).pathname} region=${region}`,
      );

      const signer = new AwsClient({
        accessKeyId,
        secretAccessKey,
        region,
        service: "lambda",
      });
      const signed = await signer.sign(url, init);
      response = await fetch(signed);
    } else {
      response = await fetch(url, init);
    }

    const text = await response.text();
    if (!response.ok) {
      console.error(
        `[analyze] upstream error mode=${selectedMode} status=${response.status} body=${text.slice(0, 500)}`,
      );
    }
    console.log(
      `[analyze] upstream mode=${selectedMode} status=${response.status} durationMs=${Date.now() - started}`,
    );
    return new Response(text, {
      status: response.status,
      headers: {
        "content-type": response.headers.get("content-type") ?? "application/json",
        "cache-control": "no-store",
      },
    });
  } catch (error) {
    if (
      error instanceof Error &&
      (error.name === "TimeoutError" || error.name === "AbortError")
    ) {
      console.error(
        `[analyze] upstream timeout mode=${selectedMode} durationMs=${Date.now() - started}`,
      );
      return Response.json(
        {
          detail:
            "The analysis took too long. Request a shorter statement period, for example 3-6 months.",
        },
        { status: 504 },
      );
    }
    console.error(
      `[analyze] proxy failure mode=${selectedMode} durationMs=${Date.now() - started}`,
      error,
    );
    return Response.json(
      { detail: "Could not reach the analysis server." },
      { status: 502 },
    );
  }
}
