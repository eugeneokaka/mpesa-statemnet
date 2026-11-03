export async function hashFile(file: File): Promise<string> {
  if (!globalThis.crypto?.subtle) {
    throw new Error("Web Crypto is not available in this browser.");
  }
  const buffer = await file.arrayBuffer();
  const digest = await crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}
