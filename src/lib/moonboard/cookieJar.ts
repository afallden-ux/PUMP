import type { MoonboardCookie } from "@/lib/moonboard/types";

export class CookieJar {
  private cookies = new Map<string, string>();

  static fromSerializable(cookies: MoonboardCookie[]): CookieJar {
    const jar = new CookieJar();
    for (const c of cookies) {
      jar.cookies.set(c.name, c.value);
    }
    return jar;
  }

  toSerializable(): MoonboardCookie[] {
    return [...this.cookies.entries()].map(([name, value]) => ({ name, value }));
  }

  absorbSetCookie(header: string | null) {
    if (!header) return;
    const parts = header.split(/,(?=\s*[^;]+=)/);
    for (const part of parts) {
      const segment = part.split(";")[0]?.trim();
      if (!segment) continue;
      const eq = segment.indexOf("=");
      if (eq <= 0) continue;
      const name = segment.slice(0, eq).trim();
      const value = segment.slice(eq + 1).trim();
      if (name) this.cookies.set(name, value);
    }
  }

  headerValue(): string {
    return [...this.cookies.entries()]
      .map(([n, v]) => `${n}=${v}`)
      .join("; ");
  }

  has(name: string): boolean {
    return this.cookies.has(name);
  }
}

export async function fetchWithJar(
  url: string,
  jar: CookieJar,
  init?: RequestInit
): Promise<Response> {
  const headers = new Headers(init?.headers);
  const cookie = jar.headerValue();
  if (cookie) headers.set("Cookie", cookie);
  if (!headers.has("User-Agent")) {
    headers.set(
      "User-Agent",
      "Mozilla/5.0 (compatible; ClimbCompare/1.0; +https://boulder-pump.vercel.app)"
    );
  }
  const res = await fetch(url, { ...init, headers, redirect: "manual" });
  const setCookie = res.headers.getSetCookie?.() ?? [];
  if (setCookie.length > 0) {
    for (const sc of setCookie) jar.absorbSetCookie(sc);
  } else {
    jar.absorbSetCookie(res.headers.get("set-cookie"));
  }
  return res;
}
