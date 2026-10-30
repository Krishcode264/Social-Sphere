"use client";

/**
 * Single source of truth for WebRTC ICE servers (caller AND callee).
 *
 * - STUN entries are public and always included.
 * - TURN credentials are fetched from our own backend route
 *   (NEXT_PUBLIC_TURN_CREDENTIALS_URL), which holds the provider API key
 *   server-side. The key never reaches the client bundle.
 * - Fallback: if the fetch fails/times out, use STUN only (degraded, not broken).
 * - Refresh when the cache is older than ~10 minutes; prefetch on app load
 *   so a slow backend wake-up never blocks the moment of tapping "Call".
 */

const DEBUG_ICE = process.env.NEXT_PUBLIC_DEBUG_RTC !== "false";
const ilog = (...args: any[]) => {
  if (DEBUG_ICE) console.log("[ICE]", new Date().toISOString(), ...args);
};

export const STUN_ONLY_ICE_SERVERS: RTCIceServer[] = [
  { urls: ["stun:stun.l.google.com:19302", "stun:stun.cloudflare.com:3478"] },
];

const CACHE_REFRESH_AFTER_MS = 10 * 60 * 1000; // refresh after 10 minutes
const FETCH_TIMEOUT_MS = 3000; // never block a call longer than ~3s

let cachedIceServers: RTCIceServer[] = STUN_ONLY_ICE_SERVERS;
let cachedAt = 0;
let cachedSource: "fresh" | "fallback" = "fallback";
let inFlight: Promise<RTCIceServer[]> | null = null;

// rough relay-usage accounting for development (console only)
let totalCallsConnected = 0;
let relayCalls = 0;

export const reportSelectedCandidatePair = (
  localType: string | null,
  remoteType: string | null
) => {
  totalCallsConnected += 1;
  const isRelay = localType === "relay" || remoteType === "relay";
  if (isRelay) relayCalls += 1;
  ilog(
    "selected pair:",
    `${localType ?? "?"} <-> ${remoteType ?? "?"}`,
    `(relay usage so far: ${relayCalls}/${totalCallsConnected})`
  );
};

/** Force-relay debug mode: dev-only intent, default is "all". */
export const isRelayDebugEnabled = (): boolean => {
  if (process.env.NODE_ENV === "production") return false;
  if (process.env.NEXT_PUBLIC_RTC_FORCE_RELAY === "true") return true;
  if (typeof window !== "undefined") {
    return new URLSearchParams(window.location.search).has("forceRelay");
  }
  return false;
};

const urlsOf = (s: RTCIceServer): string[] =>
  Array.isArray(s.urls) ? s.urls : [s.urls];

/** Urls-only signature (username/credential rotate — must not trigger rebuilds). */
export const iceServersSignature = (servers: RTCIceServer[]): string =>
  servers.map((s) => urlsOf(s).join("+")).join(";");

const normalizeIceServers = (raw: any[]): RTCIceServer[] => {
  const out: RTCIceServer[] = [];
  for (const entry of raw) {
    if (!entry || typeof entry !== "object") continue;
    const urls = entry.urls ?? entry.url;
    if (Array.isArray(urls)) {
      if (urls.every((u: unknown) => typeof u === "string") && urls.length > 0) {
        out.push({
          urls: urls as string[],
          username: entry.username,
          credential: entry.credential,
        });
      }
    } else if (typeof urls === "string") {
      out.push({ urls, username: entry.username, credential: entry.credential });
    }
  }
  return out;
};

const dedupeAgainstStun = (servers: RTCIceServer[]): RTCIceServer[] => {
  const seen = new Set<string>(STUN_ONLY_ICE_SERVERS.flatMap(urlsOf));
  const result: RTCIceServer[] = [...STUN_ONLY_ICE_SERVERS];
  for (const s of servers) {
    const urls = urlsOf(s);
    if (urls.some((u) => seen.has(u))) continue;
    result.push(s);
    urls.forEach((u) => seen.add(u));
  }
  return result;
};

async function fetchCredentialsOnce(): Promise<RTCIceServer[] | null> {
  const url = process.env.NEXT_PUBLIC_TURN_CREDENTIALS_URL;
  if (!url) return null;
  let token: string | null = null;
  try {
    token = window.sessionStorage.getItem("token");
  } catch {}
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      credentials: "include",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    if (!res.ok) {
      ilog("credentials route returned", res.status, "- using STUN only");
      return null;
    }
    const data = await res.json();
    const raw = Array.isArray(data?.iceServers) ? data.iceServers : [];
    const turnEntries = normalizeIceServers(raw).filter((s) => {
      const urls = urlsOf(s);
      const isTurn = urls.some((u) => u.startsWith("turn"));
      if (isTurn && (!s.username || !s.credential)) {
        ilog("dropping TURN entry without credentials");
        return false;
      }
      return urls.length > 0;
    });
    if (turnEntries.length === 0) {
      ilog("no usable TURN entries in response - using STUN only");
      return null;
    }
    return dedupeAgainstStun(turnEntries);
  } catch (err: any) {
    if (err?.name === "AbortError") {
      ilog("credentials fetch timed out - using STUN only");
    } else {
      ilog("credentials fetch failed - using STUN only:", err?.message ?? err);
    }
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Load iceServers: serve the cache if fresh, otherwise fetch once (in-flight
 * calls are shared). On any failure, fall back to STUN only silently.
 */
export async function getIceServers(force = false): Promise<RTCIceServer[]> {
  const age = Date.now() - cachedAt;
  if (!force && cachedIceServers.length > 0 && age < CACHE_REFRESH_AFTER_MS) {
    ilog(
      "iceServers from cache:",
      cachedSource,
      "age(min):",
      Math.round(age / 60000)
    );
    return cachedIceServers;
  }
  if (inFlight) return inFlight;
  inFlight = (async () => {
    try {
      const servers = await fetchCredentialsOnce();
      if (servers) {
        cachedIceServers = servers;
        cachedSource = "fresh";
      } else {
        cachedIceServers = STUN_ONLY_ICE_SERVERS;
        cachedSource = "fallback";
      }
      cachedAt = Date.now();
      ilog("iceServers ready:", cachedSource, JSON.stringify(cachedIceServers.map(urlsOf)));
      return cachedIceServers;
    } finally {
      inFlight = null;
    }
  })();
  return inFlight;
}

/** Fire-and-forget prefetch; call when the app loads with a logged-in user. */
export const prefetchIceServers = (): void => {
  void getIceServers().catch(() => {});
};
