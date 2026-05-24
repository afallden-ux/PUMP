import * as cheerio from "cheerio";
import { normalizeCrags27Grade } from "@/lib/crags27/ascentTree";
import { CookieJar, fetchWithJar } from "@/lib/moonboard/cookieJar";
import type { SerializableCookie } from "@/lib/logbook/sessionCrypto";
import { CRAGS27_HOST, type Crags27TreeRow } from "@/lib/crags27/types";

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

export type Crags27AscentsPageState =
  | "ok"
  | "not_found"
  | "login_required"
  | "empty";

export interface Crags27LoginResult {
  cookies: SerializableCookie[];
  detectedSlug: string | null;
}

export function normalizeProfileSlug(input: string): string {
  const raw = input.trim();
  const fromUrl = raw.match(/\/climbers\/([a-zA-Z0-9_-]+)/i)?.[1];
  if (fromUrl) return fromUrl.toLowerCase();
  return raw
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-_]/g, "");
}

function isLoggedIn(html: string): boolean {
  return (
    html.includes('class="user-logged"') ||
    html.includes("user-logged") ||
    html.includes('href="/logout"') ||
    html.includes("Log out")
  );
}

function detectSlugFromLoginHtml(html: string): string | null {
  const $ = cheerio.load(html);
  const logout = $('a[href="/logout"], a[href*="/logout"]').first();
  const nav = logout.closest("nav, .navbar, .navbar-default, header");
  if (nav.length) {
    for (const el of nav.find('a[href^="/climbers/"]').toArray()) {
      const href = $(el).attr("href") ?? "";
      const m = href.match(/^\/climbers\/([a-z0-9_-]+)\/?$/i);
      if (m && m[1] !== "new") return m[1].toLowerCase();
    }
  }

  const myTick = html.match(
    /href="\/climbers\/([a-z0-9_-]+)"[^>]*>[^<]*(?:My tick|tick list)/i
  );
  if (myTick) return myTick[1].toLowerCase();

  return null;
}

export function detectAscentsPageState(
  html: string,
  status: number
): Crags27AscentsPageState {
  if (status === 404 || /404 Not found|doesn’t exist/i.test(html)) {
    return "not_found";
  }
  if (
    !isLoggedIn(html) &&
    (html.toLowerCase().includes('name="web_user[password]"') ||
      html.toLowerCase().includes("/login"))
  ) {
    return "login_required";
  }
  return "ok";
}

async function fetchWithJarFollow(
  url: string,
  jar: CookieJar,
  init?: RequestInit,
  maxRedirects = 8
): Promise<Response> {
  let current = url;
  for (let i = 0; i <= maxRedirects; i++) {
    const res = await fetchWithJar(current, jar, { ...init, redirect: "manual" });
    if (res.status >= 300 && res.status < 400) {
      const loc = res.headers.get("location");
      if (!loc || i === maxRedirects) return res;
      current = loc.startsWith("http")
        ? loc
        : new URL(loc, current).toString();
      continue;
    }
    return res;
  }
  throw new Error("Too many redirects while fetching 27crags");
}

export async function crags27Login(
  username: string,
  password: string
): Promise<Crags27LoginResult> {
  const jar = new CookieJar();

  const loginPage = await fetchWithJarFollow(`${CRAGS27_HOST}/login`, jar, {
    headers: { "User-Agent": USER_AGENT },
  });
  if (!loginPage.ok) {
    throw new Error(`27crags login page failed (${loginPage.status})`);
  }

  const html = await loginPage.text();
  const $ = cheerio.load(html);
  const csrf = $('meta[name="csrf-token"]').attr("content");
  if (!csrf) {
    throw new Error("Could not read 27crags login form (site may have changed)");
  }

  const body = new URLSearchParams({
    authenticity_token: csrf,
    "web_user[username]": username.trim(),
    "web_user[password]": password,
    "web_user[remember_me]": "1",
  });

  const loginRes = await fetchWithJarFollow(`${CRAGS27_HOST}/login`, jar, {
    method: "POST",
    headers: {
      "User-Agent": USER_AGENT,
      "Content-Type": "application/x-www-form-urlencoded",
      "X-CSRF-Token": csrf,
      Referer: `${CRAGS27_HOST}/login`,
    },
    body: body.toString(),
  });

  const afterHtml = await loginRes.text();
  if (!isLoggedIn(afterHtml)) {
    if (
      afterHtml.toLowerCase().includes("invalid") ||
      afterHtml.toLowerCase().includes("password")
    ) {
      throw new Error("Invalid 27crags username or password");
    }
    throw new Error(
      "27crags login did not return a session. Check credentials or try again later."
    );
  }

  return {
    cookies: jar.toSerializable(),
    detectedSlug: detectSlugFromLoginHtml(afterHtml),
  };
}

/** Parse the grade × style ascent tree table from an ascents page. */
export function parseAscentTreeFromHtml(html: string): Crags27TreeRow[] {
  const $ = cheerio.load(html);
  const table = $("table")
    .filter((_, el) => {
      const headers = $(el).find("th").text();
      return /red point/i.test(headers) && /diagram/i.test(headers);
    })
    .first();

  if (!table.length) return [];

  const out: Crags27TreeRow[] = [];
  const seen = new Set<string>();

  table.find("tbody tr").each((_, row) => {
    const $row = $(row);
    const tds = $row.find("td");
    if (tds.length < 6) return;

    const gradeRaw =
      $(tds[0]).text().trim() || $(tds[1]).text().trim();
    const grade = normalizeCrags27Grade(gradeRaw);
    if (!grade) return;

    const total = parseInt($(tds[2]).text().trim(), 10);
    if (Number.isNaN(total)) return;

    const onsight = parseInt($(tds[3]).text().trim(), 10) || 0;
    const flash = parseInt($(tds[4]).text().trim(), 10) || 0;
    const redpoint = parseInt($(tds[5]).text().trim(), 10) || 0;
    const toprope = parseInt($(tds[6]).text().trim(), 10) || 0;

    if (seen.has(grade)) return;
    seen.add(grade);

    out.push({ grade, total, onsight, flash, redpoint, toprope });
  });

  return out;
}

export async function fetchCrags27AscentTree(
  cookies: SerializableCookie[],
  profileSlug: string
): Promise<Crags27TreeRow[]> {
  const slug = normalizeProfileSlug(profileSlug);
  if (!slug) {
    throw new Error(
      "Profile slug is required — use the part after /climbers/ in your profile URL (e.g. alex)"
    );
  }

  const jar = CookieJar.fromSerializable(cookies);
  const url = `${CRAGS27_HOST}/climbers/${slug}/ascents/all`;
  const res = await fetchWithJarFollow(url, jar, {
    headers: { "User-Agent": USER_AGENT },
  });

  const html = await res.text();
  const pageState = detectAscentsPageState(html, res.status);

  if (pageState === "not_found") {
    throw new Error(
      `Profile "${slug}" not found on thetopo.com. Use your exact slug from thetopo.com/climbers/YOUR-SLUG.`
    );
  }
  if (pageState === "login_required") {
    throw new Error("27crags session expired — reconnect your account.");
  }

  const tree = parseAscentTreeFromHtml(html);
  if (tree.length === 0) {
    if (/tick list is empty|no ascents yet/i.test(html)) {
      return [];
    }
    throw new Error(
      "Could not find the ascent tree on 27crags. The page layout may have changed — try again later."
    );
  }

  const withTicks = tree.filter((r) => r.total > 0);
  if (withTicks.length === 0) return tree;

  return tree;
}
