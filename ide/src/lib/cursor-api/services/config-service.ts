// ─────────────────────────────────────────────
// Cursor API — Config Service
// Server-side model list, feature flags
// ─────────────────────────────────────────────

import { buildCursorHeaders } from "../headers";
import { CURSOR_API_ENDPOINTS } from "../transport";

export interface ServerConfig {
  models: RemoteModel[];
  features: Record<string, boolean>;
  limits: Record<string, number>;
}

export interface RemoteModel {
  id: string;
  name: string;
  description?: string;
  context_window: number;
  max_output_tokens: number;
  is_fast: boolean;
  requires_pro: boolean;
  provider: string;
}

export async function getServerConfig(
  accessToken: string
): Promise<ServerConfig | null> {
  try {
    const response = await fetch(
      `${CURSOR_API_ENDPOINTS.main}/api/config`,
      {
        headers: await buildCursorHeaders(accessToken),
      }
    );
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

export async function getAvailableModels(
  accessToken: string
): Promise<RemoteModel[]> {
  const config = await getServerConfig(accessToken);
  return config?.models ?? [];
}
