// ─────────────────────────────────────────────
// Cursor API — PKCE OAuth Authentication
// Based on decompiled Cursor source
// ─────────────────────────────────────────────

import type { CursorAuthTokens, CursorAuthPollResponse } from "./types";

const CURSOR_AUTH_URL = "https://authenticator.cursor.sh";
const CURSOR_API_BASE = "https://api2.cursor.sh";
const CLIENT_ID = "client_id";
const REDIRECT_URI = "xcursor://auth/callback";

// ── PKCE Helpers ─────────────────────────────

async function generateCodeVerifier(): Promise<string> {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return btoa(String.fromCharCode(...new Uint8Array(hash)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

function generateState(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

// ── Auth Flow ────────────────────────────────

export interface AuthStartResult {
  authUrl: string;
  codeVerifier: string;
  state: string;
}

/**
 * Starts the PKCE OAuth flow.
 * Returns the auth URL to open in browser and the code verifier to use for polling.
 */
export async function startAuthFlow(): Promise<AuthStartResult> {
  const codeVerifier = await generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  const state = generateState();

  const params = new URLSearchParams({
    response_type: "code",
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    scope: "openid email profile",
    state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  });

  const authUrl = `${CURSOR_AUTH_URL}/authorize?${params.toString()}`;

  return { authUrl, codeVerifier, state };
}

/**
 * Polls for auth tokens after user completes browser login.
 * Used by Cursor's native deep-link flow.
 */
export async function pollForTokens(
  uuid: string,
  codeVerifier: string
): Promise<CursorAuthTokens | null> {
  try {
    const url = `${CURSOR_API_BASE}/auth/poll?uuid=${encodeURIComponent(uuid)}&verifier=${encodeURIComponent(codeVerifier)}`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "x-cursor-client-version": "0.50.7",
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) return null;

    const data: CursorAuthPollResponse = await response.json();

    if (data.access_token) {
      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token ?? "",
        expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
      };
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Refreshes access token using a refresh token.
 */
export async function refreshAccessToken(
  refreshToken: string
): Promise<CursorAuthTokens | null> {
  try {
    const response = await fetch(`${CURSOR_API_BASE}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-cursor-client-version": "0.50.7",
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    if (data.access_token) {
      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token ?? refreshToken,
        expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
      };
    }

    return null;
  } catch {
    return null;
  }
}

// ── Token Storage ────────────────────────────

const TOKEN_KEY_ACCESS = "cursorAuth/accessToken";
const TOKEN_KEY_REFRESH = "cursorAuth/refreshToken";
const TOKEN_KEY_EXPIRES = "cursorAuth/expiresAt";

export function saveTokens(tokens: CursorAuthTokens): void {
  localStorage.setItem(TOKEN_KEY_ACCESS, tokens.accessToken);
  localStorage.setItem(TOKEN_KEY_REFRESH, tokens.refreshToken);
  localStorage.setItem(TOKEN_KEY_EXPIRES, tokens.expiresAt.toString());
}

export function loadTokens(): CursorAuthTokens | null {
  const accessToken = localStorage.getItem(TOKEN_KEY_ACCESS);
  const refreshToken = localStorage.getItem(TOKEN_KEY_REFRESH);
  const expiresAt = localStorage.getItem(TOKEN_KEY_EXPIRES);

  if (!accessToken) return null;

  return {
    accessToken,
    refreshToken: refreshToken ?? "",
    expiresAt: expiresAt ? parseInt(expiresAt) : 0,
  };
}

export function clearTokens(): void {
  localStorage.removeItem(TOKEN_KEY_ACCESS);
  localStorage.removeItem(TOKEN_KEY_REFRESH);
  localStorage.removeItem(TOKEN_KEY_EXPIRES);
}

export function isTokenExpired(tokens: CursorAuthTokens): boolean {
  return Date.now() >= tokens.expiresAt - 5 * 60 * 1000; // 5 min buffer
}
