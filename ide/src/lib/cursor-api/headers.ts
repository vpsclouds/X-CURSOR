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
 * Generates a simple checksum for request integrity
 * In real Cursor: hmac-sha256 of the request body with a device-specific key
 */
export function generateChecksum(body: string, accessToken: string): string {
  // Simplified checksum — real Cursor uses HMAC-SHA256
  const data = `${body}${accessToken}${CLIENT_VERSION}`;
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(8, "0");
}

/**
 * Builds standard Cursor API headers
 */
export function buildCursorHeaders(
  accessToken: string,
  requestBody?: string
): Record<string, string> {
  const sessionId = getSessionId();
  const machineId = getMachineId();
  const checksum = requestBody
    ? generateChecksum(requestBody, accessToken)
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
export function buildGrpcWebHeaders(accessToken: string): Record<string, string> {
  return {
    ...buildCursorHeaders(accessToken),
    "Content-Type": "application/grpc-web+proto",
    Accept: "application/grpc-web+proto",
    "x-grpc-web": "1",
  };
}

/**
 * Builds headers for the OpenAI-compatible proxy endpoint
 */
export function buildOpenAICompatHeaders(
  accessToken: string,
  model?: string
): Record<string, string> {
  const headers = buildCursorHeaders(accessToken);
  if (model) {
    headers["x-cursor-model"] = model;
  }
  return headers;
}
