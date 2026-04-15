// ─────────────────────────────────────────────
// Cursor API — Auth Service
// ─────────────────────────────────────────────

import {
  startAuthFlow,
  pollForTokens,
  refreshAccessToken,
  saveTokens,
  loadTokens,
  clearTokens,
  isTokenExpired,
} from "../auth";
import type { CursorAuthTokens, CursorUser } from "../types";
import { CURSOR_API_ENDPOINTS } from "../transport";
import { buildCursorHeaders } from "../headers";

export class AuthService {
  private tokens: CursorAuthTokens | null = null;
  private pollInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.tokens = loadTokens();
  }

  isAuthenticated(): boolean {
    return this.tokens !== null && !isTokenExpired(this.tokens);
  }

  getAccessToken(): string | null {
    if (!this.tokens) return null;
    if (isTokenExpired(this.tokens)) return null;
    return this.tokens.accessToken;
  }

  /**
   * Starts the OAuth PKCE login flow.
   * Returns a URL to open in the browser.
   */
  async startLogin(): Promise<{ authUrl: string; uuid: string }> {
    const { authUrl, codeVerifier, state } = await startAuthFlow();
    // Store verifier for later use
    sessionStorage.setItem("xcursor-code-verifier", codeVerifier);
    sessionStorage.setItem("xcursor-auth-state", state);
    return { authUrl, uuid: state };
  }

  /**
   * Polls for tokens after the user completes the browser login.
   * Resolves when tokens are received or rejects on timeout.
   */
  async waitForTokens(uuid: string, timeoutMs = 120000): Promise<boolean> {
    const codeVerifier = sessionStorage.getItem("xcursor-code-verifier") ?? "";
    const startTime = Date.now();

    return new Promise((resolve) => {
      this.pollInterval = setInterval(async () => {
        if (Date.now() - startTime > timeoutMs) {
          this.stopPolling();
          resolve(false);
          return;
        }

        const tokens = await pollForTokens(uuid, codeVerifier);
        if (tokens) {
          this.tokens = tokens;
          saveTokens(tokens);
          this.stopPolling();
          resolve(true);
        }
      }, 2000);
    });
  }

  stopPolling(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  /**
   * Ensures a valid access token is available, refreshing if needed.
   */
  async ensureValidToken(): Promise<string | null> {
    if (!this.tokens) return null;

    if (!isTokenExpired(this.tokens)) {
      return this.tokens.accessToken;
    }

    // Try to refresh
    if (this.tokens.refreshToken) {
      const newTokens = await refreshAccessToken(this.tokens.refreshToken);
      if (newTokens) {
        this.tokens = newTokens;
        saveTokens(newTokens);
        return newTokens.accessToken;
      }
    }

    // Refresh failed — clear tokens
    this.tokens = null;
    clearTokens();
    return null;
  }

  async logout(): Promise<void> {
    this.stopPolling();
    this.tokens = null;
    clearTokens();
  }

  /**
   * Fetches the current user's profile.
   */
  async getCurrentUser(): Promise<CursorUser | null> {
    const token = await this.ensureValidToken();
    if (!token) return null;

    try {
      const response = await fetch(`${CURSOR_API_ENDPOINTS.main}/auth/me`, {
        headers: buildCursorHeaders(token),
      });

      if (!response.ok) return null;
      return await response.json();
    } catch {
      return null;
    }
  }
}

// Singleton
export const authService = new AuthService();
