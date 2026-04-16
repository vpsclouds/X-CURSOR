// ─────────────────────────────────────────────
// Cursor API Headers
// Generates x-cursor-* headers based on decompiled source
// ─────────────────────────────────────────────

const CLIENT_VERSION = "0.50.7";
const CLIENT_TYPE = "electron";
const GHOST_MODE_ENABLED = false;

/**
 * Generates a UUID v4
 */
function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Gets or creates a persistent session ID
 */
export function getSessionId(): string {
  let sessionId = sessionStorage.getItem("xcursor-session-id");
  if (!sessionId) {
    sessionId = generateUUID();
    sessionStorage.setItem("xcursor-session-id", sessionId);
  }
  return sessionId;
}

/**
 * Gets or creates a persistent machine ID (analogous to Cursor's machineId)
 */
export function getMachineId(): string {
  let machineId = localStorage.getItem("xcursor-machine-id");
  if (!machineId) {
    machineId = generateUUID();
    localStorage.setItem("xcursor-machine-id", machineId);
  }
  return machineId;
}

/**
 * Generates a SHA-256 checksum for request integrity.
 * Returns a promise; call sites that need sync behavior can await before building headers.
 */
export async function generateChecksum(body: string, accessToken: string): Promise<string> {
  const data = `${body}${accessToken}${CLIENT_VERSION}`;
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Builds standard Cursor API headers (async to support SHA-256 checksum).
 */
export async function buildCursorHeaders(
  accessToken: string,
  requestBody?: string
): Promise<Record<string, string>> {
  const sessionId = getSessionId();
  const machineId = getMachineId();
  const checksum = requestBody
    ? await generateChecksum(requestBody, accessToken)
    : "";

  return {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
    "x-cursor-client-version": CLIENT_VERSION,
    "x-cursor-client-type": CLIENT_TYPE,
    "x-session-id": sessionId,
    "x-machine-id": machineId,
    "x-cursor-checksum": checksum,
    "x-ghost-mode": GHOST_MODE_ENABLED ? "true" : "false",
    "User-Agent": `cursor/${CLIENT_VERSION}`,
  };
}

/**
 * Builds headers for gRPC-Web requests
 */
export async function buildGrpcWebHeaders(accessToken: string): Promise<Record<string, string>> {
  return {
    ...(await buildCursorHeaders(accessToken)),
    "Content-Type": "application/grpc-web+proto",
    Accept: "application/grpc-web+proto",
    "x-grpc-web": "1",
  };
}

/**
 * Builds headers for the OpenAI-compatible proxy endpoint
 */
export async function buildOpenAICompatHeaders(
  accessToken: string,
  model?: string
): Promise<Record<string, string>> {
  const headers = await buildCursorHeaders(accessToken);
  if (model) {
    headers["x-cursor-model"] = model;
  }
  return headers;
}
