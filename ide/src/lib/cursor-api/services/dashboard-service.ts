// ─────────────────────────────────────────────
// Cursor API — Dashboard Service
// User info, teams, usage stats
// ─────────────────────────────────────────────

import { buildCursorHeaders } from "../headers";
import { CURSOR_API_ENDPOINTS } from "../transport";
import type { CursorUser, CursorUsage } from "../types";

export async function getUserInfo(accessToken: string): Promise<CursorUser | null> {
  try {
    const response = await fetch(`${CURSOR_API_ENDPOINTS.main}/auth/me`, {
      headers: await buildCursorHeaders(accessToken),
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

export async function getUsageStats(accessToken: string): Promise<CursorUsage | null> {
  try {
    const response = await fetch(`${CURSOR_API_ENDPOINTS.main}/api/usage`, {
      headers: await buildCursorHeaders(accessToken),
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

export async function getTeams(accessToken: string): Promise<unknown[]> {
  try {
    const response = await fetch(`${CURSOR_API_ENDPOINTS.main}/api/teams`, {
      headers: await buildCursorHeaders(accessToken),
    });
    if (!response.ok) return [];
    const data = await response.json();
    return data.teams ?? [];
  } catch {
    return [];
  }
}
