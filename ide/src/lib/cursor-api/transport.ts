// ─────────────────────────────────────────────
// Cursor API — Transport Layer
// gRPC-Web + HTTP transport setup
// ─────────────────────────────────────────────

export const CURSOR_API_ENDPOINTS = {
  main: "https://api2.cursor.sh",
  telemetry: "https://api3.cursor.sh",
  chat: "https://api3.cursor.sh",
  cmdK: "https://api3.cursor.sh",
  tab: "https://api4.cursor.sh",
  agent: "https://agent.api5.cursor.sh",
  agentPrivacy: "https://agentn.api5.cursor.sh",
  codebase: "https://repo42.cursor.sh",
} as const;

export type CursorEndpoint = keyof typeof CURSOR_API_ENDPOINTS;

// ── gRPC-Web Message Frame ────────────────────
// TODO: These gRPC-Web framing functions are reserved for future binary transport.
// The current implementation uses SSE/HTTP streaming (processStreamingResponse).
// Wire these in when migrating to gRPC-Web proto transport via @bufbuild/protobuf.

/**
 * Encodes a protobuf message into a gRPC-Web frame.
 * Frame format: [flags(1 byte)] [length(4 bytes)] [message bytes]
 */
export function encodeGrpcWebMessage(messageBytes: Uint8Array): Uint8Array {
  const frame = new Uint8Array(5 + messageBytes.length);
  frame[0] = 0; // flags: no compression
  const view = new DataView(frame.buffer);
  view.setUint32(1, messageBytes.length, false); // big-endian length
  frame.set(messageBytes, 5);
  return frame;
}

/**
 * Decodes gRPC-Web framed response into message bytes.
 * TODO: Wire this in when gRPC-Web proto transport is implemented.
 */
export function* decodeGrpcWebMessages(
  data: Uint8Array
): Generator<{ flags: number; message: Uint8Array }> {
  let offset = 0;
  while (offset < data.length) {
    if (offset + 5 > data.length) break;
    const flags = data[offset];
    const view = new DataView(data.buffer, data.byteOffset + offset + 1, 4);
    const length = view.getUint32(0, false);
    offset += 5;
    if (offset + length > data.length) break;
    yield { flags, message: data.slice(offset, offset + length) };
    offset += length;
  }
}

// ── SSE / Streaming ───────────────────────────

/**
 * Processes a streaming response (SSE / chunked JSON) from Cursor API.
 * Yields parsed chunks.
 */
export async function* processStreamingResponse(
  response: Response
): AsyncGenerator<{ type: "text" | "error" | "done"; content?: string; error?: string }> {
  if (!response.ok) {
    const errorText = await response.text();
    yield { type: "error" as const, error: `HTTP ${response.status}: ${errorText}` };
    return;
  }

  const reader = response.body?.getReader();
  if (!reader) {
    yield { type: "error" as const, error: "No response body" };
    return;
  }

  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed === ":") continue;

        if (trimmed.startsWith("data: ")) {
          const data = trimmed.slice(6);
          if (data === "[DONE]") {
            yield { type: "done" as const };
            return;
          }

          try {
            const parsed = JSON.parse(data);
            const content =
              parsed.choices?.[0]?.delta?.content ??
              parsed.delta?.text ??
              parsed.text ??
              "";

            if (content) {
              yield { type: "text" as const, content };
            }
          } catch {
            // Skip unparseable lines
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  yield { type: "done" as const };
}

// ── HTTP Client Utilities ─────────────────────

export interface FetchOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
  signal?: AbortSignal;
  stream?: boolean;
}

/**
 * Makes a fetch request, using Tauri's HTTP plugin when available for CORS bypass.
 */
export async function cursorFetch(
  url: string,
  options: FetchOptions = {}
): Promise<Response> {
  const { method = "POST", headers = {}, body, signal } = options;

  // Use native fetch (Tauri's http plugin handles CORS bypassing)
  return fetch(url, {
    method,
    headers,
    body,
    signal,
  });
}
