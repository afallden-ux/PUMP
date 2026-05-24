import * as cheerio from "cheerio";
import { CookieJar, fetchWithJar } from "@/lib/moonboard/cookieJar";
import type { SerializableCookie } from "@/lib/logbook/sessionCrypto";
import {
  EIGHTA_CATEGORIES,
  type EightaAscent,
  type EightaCategory,
} from "@/lib/eighta/types";

const USER_AGENT =
  "Mozilla/5.0 (compatible; ClimbCompare/1.0; +https://boulder-pump.vercel.app)";

function slugify(username: string): string {
  return username
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

function parseClimbDate(value: unknown): string {
  if (value == null) return new Date().toISOString().slice(0, 10);
  if (typeof value === "number") {
    const ms = value > 1e12 ? value : value * 1000;
    return new Date(ms).toISOString().slice(0, 10);
  }
  const s = String(value).trim();
  const d = new Date(s);
  if (!Number.isNaN(d.getTime())) {
    return d.toISOString().slice(0, 10);
  }
  return new Date().toISOString().slice(0, 10);
}

async function followRedirects(
  jar: CookieJar,
  startUrl: string,
  init?: RequestInit,
  maxHops = 12
): Promise<Response> {
  let url = startUrl;
  for (let i = 0; i < maxHops; i++) {
    const res = await fetchWithJar(url, jar, {
      ...init,
      redirect: "manual",
      headers: {
        "User-Agent": USER_AGENT,
        ...(init?.headers ?? {}),
      },
    });
    if (res.status >= 300 && res.status < 400) {
      const loc = res.headers.get("location");
      if (!loc) return res;
      url = loc.startsWith("http") ? loc : new URL(loc, url).toString();
      init = { ...init, method: "GET", body: undefined };
      continue;
    }
    return res;
  }
  throw new Error("Too many redirects during 8a.nu login");
}

export async function eightaLogin(
  username: string,
  password: string
): Promise<SerializableCookie[]> {
  const jar = new CookieJar();

  const loginStart = await followRedirects(jar, "https://www.8a.nu/login");
  const loginHtml = await loginStart.text();
  const $ = cheerio.load(loginHtml);
  const action =
    $("#kc-form-login").attr("action") ||
    $("form#kc-form-login").attr("action") ||
    $("form").first().attr("action");
  if (!action) {
    throw new Error("Could not read 8a.nu login form (site may have changed)");
  }

  const form = new URLSearchParams();
  form.set("username", username.trim());
  form.set("password", password);
  $("form#kc-form-login input[type='hidden'], form input[type='hidden']").each(
    (_, el) => {
      const name = $(el).attr("name");
      const value = $(el).attr("value");
      if (name && value != null && name !== "username" && name !== "password") {
        form.set(name, value);
      }
    }
  );

  const authRes = await followRedirects(jar, action, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Referer: loginStart.url,
    },
    body: form.toString(),
  });

  const after = await authRes.text();
  if (
    after.toLowerCase().includes("invalid username or password") ||
    after.toLowerCase().includes("invalid password")
  ) {
    throw new Error("Invalid 8a.nu username or password");
  }

  if (!jar.headerValue()) {
    throw new Error(
      "8a.nu login did not return a session. Check credentials or try again later."
    );
  }

  return jar.toSerializable();
}

interface EightaAscentRaw {
  ascentId?: string | number;
  zlaggableName?: string;
  difficulty?: string;
  date?: string | number;
  type?: string;
  comment?: string | null;
  notes?: string | null;
  cragName?: string | null;
  areaName?: string | null;
  rating?: number | null;
}

function mapRawAscent(
  category: EightaCategory,
  raw: EightaAscentRaw
): EightaAscent | null {
  const name = raw.zlaggableName?.trim();
  if (!name) return null;
  const climbedAt = parseClimbDate(raw.date);
  const externalKey = `${category}:${raw.ascentId ?? name}:${climbedAt}`;

  return {
    externalKey,
    category,
    climbName: name,
    climbedAt,
    gradeDisplay: raw.difficulty?.trim() || null,
    ascentStyle: raw.type?.trim() || null,
    cragName: raw.cragName?.trim() || null,
    areaName: raw.areaName?.trim() || null,
    comment: (raw.comment || raw.notes || null)?.trim() || null,
    rating: raw.rating ?? null,
  };
}

async function fetchCategoryAscents(
  jar: CookieJar,
  slug: string,
  category: EightaCategory,
  maxAscents: number,
  seen: Set<string>,
  out: EightaAscent[]
): Promise<void> {
  let pageIndex = 0;

  while (out.length < maxAscents) {
    const qs = new URLSearchParams({
      category,
      pageIndex: String(pageIndex),
      pageSize: "50",
      sortfield: "grade_desc",
      timeFilter: "0",
      gradeFilter: "0",
      typeFilter: "",
      isAscented: "true",
    });

    const res = await fetchWithJar(
      `https://www.8a.nu/api/users/${slug}/ascents?${qs}`,
      jar,
      { headers: { Accept: "application/json", "User-Agent": USER_AGENT } }
    );

    if (res.status === 404 && pageIndex === 0) {
      return;
    }
    if (!res.ok) {
      throw new Error(`8a.nu API failed (${res.status}) for ${category}`);
    }

    const data = (await res.json()) as { ascents?: EightaAscentRaw[] };
    const batch = data.ascents ?? [];
    if (batch.length === 0) break;

    for (const raw of batch) {
      const mapped = mapRawAscent(category, raw);
      if (!mapped || seen.has(mapped.externalKey)) continue;
      seen.add(mapped.externalKey);
      out.push(mapped);
      if (out.length >= maxAscents) return;
    }

    pageIndex += 1;
  }
}

export async function fetchEightaAscents(
  cookies: SerializableCookie[],
  profileSlug: string,
  options?: { maxAscents?: number; categories?: EightaCategory[] }
): Promise<EightaAscent[]> {
  const slug = slugify(profileSlug);
  if (!slug) {
    throw new Error("8a.nu profile slug is required (from your profile URL)");
  }

  const jar = CookieJar.fromSerializable(cookies);
  const maxAscents = options?.maxAscents ?? 4000;
  const categories = options?.categories ?? EIGHTA_CATEGORIES;
  const out: EightaAscent[] = [];
  const seen = new Set<string>();

  for (const category of categories) {
    await fetchCategoryAscents(jar, slug, category, maxAscents, seen, out);
    if (out.length >= maxAscents) break;
  }

  out.sort((a, b) => b.climbedAt.localeCompare(a.climbedAt));
  return out;
}
