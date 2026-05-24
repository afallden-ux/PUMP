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

const SESSION_COOKIE = "_27crags_session";

function hasSessionCookie(jar: CookieJar): boolean {
  return jar.has(SESSION_COOKIE) && Boolean(jar.toSerializable().find((c) => c.name === SESSION_COOKIE)?.value);
}

/** Server HTML no longer includes nav logout (React nav) — use URL + login form presence. */
function isLoginPage(html: string, finalUrl: string): boolean {
  return (
    finalUrl.includes("/login") &&
    html.includes('name="web_user[password]"')
  );
}

function loginFormError(html: string): string | null {
  const $ = cheerio.load(html);
  const alert = $(".alert-danger, .flash.error, .error-message, .alert-error")
    .first()
    .text()
    .trim()
    .replace(/\s+/g, " ");
  if (alert.length > 0) return alert;
  if (/invalid (?:email|username|password|credentials)/i.test(html)) {
    return "Invalid 27crags username or password";
  }
  return null;
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
  status: number,
  finalUrl?: string
): Crags27AscentsPageState {
  if (status === 404 || /404 Not found|doesn’t exist/i.test(html)) {
    return "not_found";
  }
  if (
    (finalUrl && isLoginPage(html, finalUrl)) ||
    html.includes('name="web_user[password]"')
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
): Promise<{ response: Response; finalUrl: string }> {
  let current = url;
  let requestInit: RequestInit | undefined = init;

  for (let i = 0; i <= maxRedirects; i++) {
    const res = await fetchWithJar(current, jar, {
      ...requestInit,
      redirect: "manual",
    });
    if (res.status >= 300 && res.status < 400) {
      const loc = res.headers.get("location");
      if (!loc || i === maxRedirects) {
        return { response: res, finalUrl: current };
      }
      current = loc.startsWith("http")
        ? loc
        : new URL(loc, current).toString();
      requestInit = {
        headers: requestInit?.headers,
      };
      continue;
    }
    return { response: res, finalUrl: current };
  }
  throw new Error("Too many redirects while fetching 27crags");
}

export async function crags27Login(
  username: string,
  password: string
): Promise<Crags27LoginResult> {
  const jar = new CookieJar();

  const { response: loginPageRes } = await fetchWithJarFollow(
    `${CRAGS27_HOST}/login`,
    jar,
    {
      headers: { "User-Agent": USER_AGENT },
    }
  );
  if (!loginPageRes.ok) {
    throw new Error(`27crags login page failed (${loginPageRes.status})`);
  }

  const html = await loginPageRes.text();
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

  const { response: loginRes, finalUrl } = await fetchWithJarFollow(
    `${CRAGS27_HOST}/login`,
    jar,
    {
      method: "POST",
      headers: {
        "User-Agent": USER_AGENT,
        "Content-Type": "application/x-www-form-urlencoded",
        "X-CSRF-Token": csrf,
        Referer: `${CRAGS27_HOST}/login`,
      },
      body: body.toString(),
    }
  );

  const afterHtml = await loginRes.text();

  if (isLoginPage(afterHtml, finalUrl)) {
    throw new Error(
      loginFormError(afterHtml) ?? "Invalid 27crags username or password"
    );
  }

  if (!hasSessionCookie(jar)) {
    throw new Error(
      "27crags did not set a session cookie. Try again in a few minutes."
    );
  }

  const { response: homeRes, finalUrl: homeUrl } = await fetchWithJarFollow(
    `${CRAGS27_HOST}/`,
    jar,
    { headers: { "User-Agent": USER_AGENT } }
  );
  const homeHtml = await homeRes.text();

  if (isLoginPage(homeHtml, homeUrl)) {
    throw new Error("Invalid 27crags username or password");
  }

  return {
    cookies: jar.toSerializable(),
    detectedSlug: detectSlugFromLoginHtml(homeHtml),
  };
}

/** Parse the grade × style ascent tree table from an ascents page. */
export function parseAscentTreeFromHtml(html: string): Crags27TreeRow[] {
  const $ = cheerio.load(html);
  const table = $("table")
    .filter((_, el) => {
      const text = $(el).text();
      return /red point/i.test(text) && /diagram/i.test(text);
    })
    .first();

  if (!table.length) return [];

  const byGrade = new Map<string, Crags27TreeRow>();

  table.find("tbody tr").each((_, row) => {
    const $row = $(row);
    const gradeRaw =
      $row.find("td.grade").first().text().trim() ||
      $row.find("td").first().text().trim();
    const grade = normalizeCrags27Grade(gradeRaw);
    if (!grade) return;

    const nums = $row
      .find("td.text-right")
      .map((_, td) => parseInt($(td).text().trim(), 10))
      .get()
      .filter((n) => !Number.isNaN(n));

    let counts: {
      total: number;
      onsight: number;
      flash: number;
      redpoint: number;
      toprope: number;
    } | null = null;

    if (nums.length >= 5) {
      counts = {
        total: nums[0],
        onsight: nums[1] ?? 0,
        flash: nums[2] ?? 0,
        redpoint: nums[3] ?? 0,
        toprope: nums[4] ?? 0,
      };
    } else if (nums.length >= 4) {
      counts = {
        total: nums[0],
        onsight: nums[1] ?? 0,
        flash: nums[2] ?? 0,
        redpoint: nums[3] ?? 0,
        toprope: 0,
      };
    } else {
      const tds = $row.find("td");
      if (tds.length >= 6) {
        const g0 = $(tds[0]).text().trim().toLowerCase();
        const g1 = $(tds[1]).text().trim().toLowerCase();
        const offset = g0 && g1 && g0 === g1 ? 1 : 0;
        const total = parseInt($(tds[offset + 1]).text().trim(), 10);
        if (!Number.isNaN(total)) {
          counts = {
            total,
            onsight: parseInt($(tds[offset + 2]).text().trim(), 10) || 0,
            flash: parseInt($(tds[offset + 3]).text().trim(), 10) || 0,
            redpoint: parseInt($(tds[offset + 4]).text().trim(), 10) || 0,
            toprope: parseInt($(tds[offset + 5]).text().trim(), 10) || 0,
          };
        }
      }
    }

    if (!counts) return;

    const existing = byGrade.get(grade);
    if (existing) {
      byGrade.set(grade, {
        grade,
        total: existing.total + counts.total,
        onsight: existing.onsight + counts.onsight,
        flash: existing.flash + counts.flash,
        redpoint: existing.redpoint + counts.redpoint,
        toprope: existing.toprope + counts.toprope,
      });
    } else {
      byGrade.set(grade, { grade, ...counts });
    }
  });

  return [...byGrade.values()];
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
  const { response: res, finalUrl } = await fetchWithJarFollow(url, jar, {
    headers: { "User-Agent": USER_AGENT },
  });

  const html = await res.text();
  const pageState = detectAscentsPageState(html, res.status, finalUrl);

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

  if (tree.every((r) => r.total === 0)) {
    return tree;
  }

  return tree;
}
