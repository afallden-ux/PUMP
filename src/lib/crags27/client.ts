import * as cheerio from "cheerio";
import { CookieJar, fetchWithJar } from "@/lib/moonboard/cookieJar";
import type { SerializableCookie } from "@/lib/logbook/sessionCrypto";
import { CRAGS27_HOST, type Crags27Ascent } from "@/lib/crags27/types";

const USER_AGENT =
  "Mozilla/5.0 (compatible; ClimbCompare/1.0; +https://boulder-pump.vercel.app)";

function slugifyProfileSlug(slug: string): string {
  return slug
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-_]/g, "");
}

function parseClimbDate(raw: string): string {
  const s = raw.trim();
  if (!s) return new Date().toISOString().slice(0, 10);
  const iso = new Date(s);
  if (!Number.isNaN(iso.getTime())) {
    return iso.toISOString().slice(0, 10);
  }
  const dmy = s.match(/(\d{1,2})[./](\d{1,2})[./](\d{4})/);
  if (dmy) {
    const parsed = new Date(`${dmy[3]}-${dmy[2]}-${dmy[1]}`);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString().slice(0, 10);
    }
  }
  return new Date().toISOString().slice(0, 10);
}

function isLoggedIn(html: string): boolean {
  return (
    html.includes('class="user-logged"') ||
    html.includes("user-logged") ||
    html.includes('href="/logout"') ||
    html.includes("Log out")
  );
}

export async function crags27Login(
  username: string,
  password: string
): Promise<SerializableCookie[]> {
  const jar = new CookieJar();

  const loginPage = await fetchWithJar(`${CRAGS27_HOST}/login`, jar, {
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

  const loginRes = await fetchWithJar(`${CRAGS27_HOST}/login`, jar, {
    method: "POST",
    headers: {
      "User-Agent": USER_AGENT,
      "Content-Type": "application/x-www-form-urlencoded",
      "X-CSRF-Token": csrf,
      Referer: `${CRAGS27_HOST}/login`,
    },
    body: body.toString(),
    redirect: "follow",
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

  return jar.toSerializable();
}

function parseAscentsFromHtml(html: string): Crags27Ascent[] {
  const lower = html.toLowerCase();
  if (lower.includes("tick list is empty") || lower.includes("no ascents yet")) {
    return [];
  }

  const $ = cheerio.load(html);
  const out: Crags27Ascent[] = [];
  const seen = new Set<string>();

  const rowSelectors = [
    ".col-md-12 tbody tr",
    "table tbody tr",
    ".tick-list tbody tr",
    ".ascents-table tbody tr",
  ];

  for (const sel of rowSelectors) {
    $(sel).each((_, row) => {
      const $row = $(row);
      const links = $row.find(".stxt a, td a").toArray();
      const route =
        links[0] != null ? $(links[0]).text().trim() : $row.find("a").first().text().trim();
      const crag =
        links[1] != null ? $(links[1]).text().trim() : $row.find("a").eq(1).text().trim();
      if (!route) return;

      const dateText =
        $row.find(".ascent-date").first().text().trim() ||
        $row.find("td").first().text().trim();
      const grade =
        $row.find("span.grade").last().text().trim() ||
        $row.find(".grade").last().text().trim() ||
        null;
      const ascentBits = $row
        .find(".ascent-type")
        .text()
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);
      const ascentStyle = ascentBits.length > 1 ? ascentBits[1] : ascentBits[0] || null;
      const routeType = $row.find("td").eq(4).text().trim() || null;
      const comment = $row.find(".ascent-details").text().trim() || null;
      const climbedAt = parseClimbDate(dateText);
      const externalKey = `${route}:${crag}:${climbedAt}:${grade ?? ""}`;
      if (seen.has(externalKey)) return;
      seen.add(externalKey);

      out.push({
        externalKey,
        climbName: route,
        climbedAt,
        gradeDisplay: grade,
        ascentStyle,
        cragName: crag || null,
        routeType,
        comment: comment || null,
      });
    });

    if (out.length > 0) break;
  }

  return out;
}

async function fetchTicksJson(
  jar: CookieJar,
  url: string
): Promise<Crags27Ascent[] | null> {
  try {
    const res = await fetchWithJar(url, jar, {
      headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { ticks?: string };
    if (!json.ticks) return null;
    return parseAscentsFromHtml(json.ticks);
  } catch {
    return null;
  }
}

export async function fetchCrags27Ascents(
  cookies: SerializableCookie[],
  profileSlug: string,
  options?: { maxAscents?: number }
): Promise<Crags27Ascent[]> {
  const slug = slugifyProfileSlug(profileSlug);
  if (!slug) {
    throw new Error("Profile slug is required (from your 27crags profile URL)");
  }

  const jar = CookieJar.fromSerializable(cookies);
  const maxAscents = options?.maxAscents ?? 3000;
  const paths = ["all", "boulder", "routes", "sport"];
  const merged: Crags27Ascent[] = [];
  const seen = new Set<string>();

  for (const kind of paths) {
    const url = `${CRAGS27_HOST}/climbers/${slug}/ascents/${kind}`;
    const res = await fetchWithJar(url, jar, {
      headers: { "User-Agent": USER_AGENT },
    });
    if (!res.ok) continue;

    const html = await res.text();
    let batch = parseAscentsFromHtml(html);

    const moreUrl =
      html.match(/data-url="([^"]+ticks[^"]+)"/i)?.[1] ||
      html.match(/href="([^"]+ticks[^"]+\.json[^"]*)"/i)?.[1];
    if (moreUrl) {
      const absolute = moreUrl.startsWith("http")
        ? moreUrl
        : `${CRAGS27_HOST}${moreUrl.startsWith("/") ? "" : "/"}${moreUrl}`;
      const extra = await fetchTicksJson(jar, absolute);
      if (extra?.length) batch = batch.concat(extra);
    }

    for (const a of batch) {
      if (seen.has(a.externalKey)) continue;
      seen.add(a.externalKey);
      merged.push(a);
      if (merged.length >= maxAscents) break;
    }
    if (merged.length >= maxAscents) break;
  }

  merged.sort((a, b) => b.climbedAt.localeCompare(a.climbedAt));
  return merged;
}
