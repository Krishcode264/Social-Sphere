import express, { Request, Response } from "express";
import checkTokenValidity from "../middlewares/authenticate_jwt";

/**
 * GET /api/turn-credentials
 *
 * Authenticated route that hands short-lived TURN credentials to the client.
 * The TURN provider API key lives ONLY in backend env vars:
 *   TURN_PROVIDER_API_URL  - provider credentials endpoint (format from the
 *                            provider dashboard, e.g. Metered Open Relay)
 *   TURN_PROVIDER_API_KEY  - provider API key (appended if not already in URL)
 *
 * Response shape (single source of truth for ICE servers):
 *   { iceServers: [...STUN..., ...TURN...], degraded?: true, source: "provider" | "fallback" }
 *
 * - Provider response cached in memory for 15 minutes (must be shorter than
 *   the credential lifetime; adjust TTL_CREDENTIALS_MS if the provider issues
 *   shorter-lived credentials).
 * - On provider failure returns 200 with STUN only + degraded: true, so the
 *   frontend keeps working (calls connect on easy networks without TURN).
 * - Per-user rate limiting protects the free relay quota.
 * - Never logs the API key or credentials.
 */

export const turnCredentialsRouter = express.Router();

// Public STUN entries are always included; the frontend appends nothing.
const STUN_ICE_SERVERS = [
  { urls: ["stun:stun.l.google.com:19302", "stun:stun.cloudflare.com:3478"] },
];

const TTL_CREDENTIALS_MS = 15 * 60 * 1000;
const PROVIDER_TIMEOUT_MS = 5000;
const RATE_LIMIT_MAX = 6;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;

type IceServerish = {
  urls: string[] | string;
  username?: string;
  credential?: string;
};

interface CacheEntry {
  iceServers: IceServerish[];
  fetchedAt: number;
  providerOk: boolean;
}

let cache: CacheEntry | null = null;

// per-user rate limiter (userId -> timestamps)
const rateBuckets = new Map<string, number[]>();

const isRateLimited = (userId: string): boolean => {
  const now = Date.now();
  const bucket = (rateBuckets.get(userId) ?? []).filter(
    (t) => now - t < RATE_LIMIT_WINDOW_MS
  );
  if (bucket.length >= RATE_LIMIT_MAX) {
    rateBuckets.set(userId, bucket);
    return true;
  }
  bucket.push(now);
  rateBuckets.set(userId, bucket);
  return false;
};

const providerUrls = (): { url: string; key: string | undefined } => {
  let url = process.env.TURN_PROVIDER_API_URL;
  const key = process.env.TURN_PROVIDER_API_KEY;
  if (!url) return { url: "", key };
  if (key && !url.includes("apiKey") && !url.includes("api_key")) {
    url += (url.includes("?") ? "&" : "?") + "apiKey=" + encodeURIComponent(key);
  }
  return { url, key };
};

const talkToProvider = async (): Promise<IceServerish[] | null> => {
  const { url, key } = providerUrls();
  if (!url) return null;
  if (!key) {
    console.warn("[TURN] TURN_PROVIDER_API_KEY is not set");
    return null;
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PROVIDER_TIMEOUT_MS);
  const startedAt = Date.now();
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) {
      console.error(`[TURN] provider returned ${res.status} after ${Date.now() - startedAt}ms`);
      return null;
    }
    const data: any = await res.json();
    const raw = Array.isArray(data?.iceServers) ? data.iceServers : [];
    const servers: IceServerish[] = [];
    for (const entry of raw) {
      if (!entry || typeof entry !== "object") continue;
      const urls = entry.urls ?? entry.url;
      const isTurn = JSON.stringify(urls).includes("turn");
      if (!urls || (isTurn && (!entry.username || !entry.credential))) continue;
      servers.push({ urls, username: entry.username, credential: entry.credential });
    }
    console.log(`[TURN] provider OK, ${servers.length} entries, ${Date.now() - startedAt}ms`);
    return servers.length > 0 ? servers : null;
  } catch (err: any) {
    if (err?.name === "AbortError") {
      console.error(`[TURN] provider timeout after ${Date.now() - startedAt}ms`);
    } else {
      console.error("[TURN] provider request failed:", err?.message ?? err);
    }
    return null;
  } finally {
    clearTimeout(timer);
  }
};

turnCredentialsRouter.get("/", checkTokenValidity, async (req: any, res: Response) => {
  const userId: string = req.body?.user?.id ?? "unknown";

  if (isRateLimited(userId)) {
    res.status(429).json({ message: "Too many credential requests" });
    return;
  }

  // serve fresh cache
  if (cache && Date.now() - cache.fetchedAt < TTL_CREDENTIALS_MS) {
    res.status(200).json({
      iceServers: [...STUN_ICE_SERVERS, ...cache.iceServers],
      source: cache.providerOk ? "provider" : "fallback",
      ...(cache.providerOk ? {} : { degraded: true }),
    });
    return;
  }

  const providerEntries = await talkToProvider();
  cache = providerEntries
    ? { iceServers: providerEntries, fetchedAt: Date.now(), providerOk: true }
    : { iceServers: [], fetchedAt: Date.now(), providerOk: false };

  res.status(200).json({
    iceServers: [...STUN_ICE_SERVERS, ...cache.iceServers],
    source: cache.providerOk ? "provider" : "fallback",
    ...(cache.providerOk ? {} : { degraded: true }),
  });
});
