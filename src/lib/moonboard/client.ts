import * as cheerio from "cheerio";
import { CookieJar, fetchWithJar } from "@/lib/moonboard/cookieJar";
import {
  MOONBOARD_ANGLE_MAP,
  MOONBOARD_BOARDS,
  MOONBOARD_BOARD_KEYS,
  MOONBOARD_HOST,
  type MoonboardAscent,
  type MoonboardBoardKey,
  type MoonboardCookie,
} from "@/lib/moonboard/types";

const TRIES_MAP: Record<string, string> = {
  Flashed: "1",
  "2nd try": "2",
  "3rd try": "3",
  "more than 3 tries": "4+",
  Project: "project",
};

interface LogbookPage {
  Id: string;
}

interface LogbookEntryRaw {
  Id?: string;
  DateClimbedAsString?: string;
  NumberOfTries?: string;
  Comment?: string | null;
  Problem?: {
    Name?: string;
    Grade?: string;
    UserGrade?: string;
    IsBenchmark?: boolean;
    MoonBoardConfiguration?: { Id?: number };
  };
}

function parseClimbDate(s: string): string {
  const d = new Date(s);
  if (!Number.isNaN(d.getTime())) {
    return d.toISOString().slice(0, 10);
  }
  const m = s.match(/(\d{1,2})\s+(\w{3})\s+(\d{4})/);
  if (m) {
    const parsed = new Date(`${m[2]} ${m[1]}, ${m[3]}`);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString().slice(0, 10);
    }
  }
  return new Date().toISOString().slice(0, 10);
}

function angleFromConfig(board: MoonboardBoardKey, configId: number | undefined): number | null {
  if (configId == null) return null;
  return MOONBOARD_ANGLE_MAP[board][configId] ?? null;
}

export async function moonboardLogin(
  username: string,
  password: string
): Promise<MoonboardCookie[]> {
  const jar = new CookieJar();

  const loginPage = await fetchWithJar(`${MOONBOARD_HOST}/account/login`, jar);
  if (loginPage.status === 403 || loginPage.status === 503) {
    throw new Error(
      "MoonBoard blocks automated login from ClimbCompare (bot protection). Use Logbook import from a screenshot instead."
    );
  }
  if (!loginPage.ok) {
    throw new Error(`MoonBoard login page failed (${loginPage.status})`);
  }
  const html = await loginPage.text();
  const $ = cheerio.load(html);
  const token = $('input[name="__RequestVerificationToken"]').attr("value");
  const formKey = $('input[name="form_key"]').attr("value");
  if (!token) {
    throw new Error("Could not read MoonBoard login form (site may have changed)");
  }

  const body = new URLSearchParams({
    "Login.Username": username,
    "Login.Password": password,
    "Login.RememberMe": "false",
    __RequestVerificationToken: token,
    ...(formKey ? { form_key: formKey } : {}),
  });

  const loginRes = await fetchWithJar(`${MOONBOARD_HOST}/Account/login`, jar, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Referer: `${MOONBOARD_HOST}/account/login`,
    },
    body: body.toString(),
  });

  if (!loginRes.ok && loginRes.status !== 302) {
    throw new Error(`MoonBoard login failed (${loginRes.status})`);
  }

  const cookies = jar.toSerializable();
  if (!cookies.some((c) => c.name === "_MoonBoard" || c.name.includes("MoonBoard"))) {
    const afterHtml = loginRes.status < 400 ? await loginRes.text() : "";
    if (
      afterHtml.includes("validation-summary-errors") ||
      afterHtml.toLowerCase().includes("incorrect")
    ) {
      throw new Error("Invalid MoonBoard username or password");
    }
    throw new Error(
      "MoonBoard login did not return a session. Check your credentials or try again later."
    );
  }

  return cookies;
}

async function postJson<T>(
  jar: CookieJar,
  path: string,
  data: Record<string, string>
): Promise<T> {
  const res = await fetchWithJar(`${MOONBOARD_HOST}${path}`, jar, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "X-Requested-With": "XMLHttpRequest",
    },
    body: new URLSearchParams(data).toString(),
  });
  if (!res.ok) {
    throw new Error(`MoonBoard API ${path} failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

async function* logbookPages(
  jar: CookieJar,
  board: MoonboardBoardKey,
  page = 1,
  pageSize = 40
): AsyncGenerator<LogbookPage> {
  const setupId = MOONBOARD_BOARDS[board].id;
  const json = await postJson<{ Data: LogbookPage[]; Total: number }>(
    jar,
    "/Logbook/GetLogbook",
    {
      sort: "",
      page: String(page),
      pageSize: String(pageSize),
      group: "",
      filter: `setupId~eq~'${setupId}'`,
    }
  );
  for (const row of json.Data ?? []) {
    yield row;
  }
  if (json.Total > pageSize * page) {
    yield* logbookPages(jar, board, page + 1, pageSize);
  }
}

async function* logbookEntriesForPage(
  jar: CookieJar,
  board: MoonboardBoardKey,
  entryId: string,
  page = 1,
  pageSize = 30
): AsyncGenerator<LogbookEntryRaw> {
  const setupId = MOONBOARD_BOARDS[board].id;
  const json = await postJson<{ Data: LogbookEntryRaw[]; Total: number }>(
    jar,
    `/Logbook/GetLogbookEntries/${entryId}`,
    {
      sort: "",
      page: String(page),
      pageSize: String(pageSize),
      group: "",
      filter: `setupId~eq~'${setupId}'`,
    }
  );
  for (const row of json.Data ?? []) {
    yield row;
  }
  if (json.Total > pageSize * page) {
    yield* logbookEntriesForPage(jar, board, entryId, page + 1, pageSize);
  }
}

function mapEntry(board: MoonboardBoardKey, entry: LogbookEntryRaw): MoonboardAscent | null {
  const problem = entry.Problem;
  if (!problem?.Name) return null;
  const climbedAt = parseClimbDate(entry.DateClimbedAsString ?? "");
  const configId = problem.MoonBoardConfiguration?.Id;
  const angle = angleFromConfig(board, configId);
  const externalKey = `${board}:${entry.Id ?? problem.Name}:${climbedAt}:${problem.Name}`;

  return {
    externalKey,
    boardKey: board,
    angle,
    climbName: problem.Name,
    climbedAt,
    gradeDisplay: problem.Grade ?? null,
    gradeLogged: problem.UserGrade ?? null,
    tries: entry.NumberOfTries ? TRIES_MAP[entry.NumberOfTries] ?? entry.NumberOfTries : null,
    isBenchmark: Boolean(problem.IsBenchmark),
    comment: entry.Comment ?? null,
  };
}

export async function fetchMoonboardAscents(
  cookies: MoonboardCookie[],
  options?: { boards?: MoonboardBoardKey[]; maxAscents?: number }
): Promise<MoonboardAscent[]> {
  const jar = CookieJar.fromSerializable(cookies);
  const boards = options?.boards ?? MOONBOARD_BOARD_KEYS;
  const maxAscents = options?.maxAscents ?? 2000;
  const out: MoonboardAscent[] = [];
  const seen = new Set<string>();

  for (const board of boards) {
    try {
      for await (const page of logbookPages(jar, board)) {
        for await (const raw of logbookEntriesForPage(jar, board, page.Id)) {
          const mapped = mapEntry(board, raw);
          if (!mapped || seen.has(mapped.externalKey)) continue;
          seen.add(mapped.externalKey);
          out.push(mapped);
          if (out.length >= maxAscents) return out;
        }
      }
    } catch (e) {
      console.warn(`Moonboard sync skipped board ${board}:`, e);
    }
  }

  out.sort((a, b) => b.climbedAt.localeCompare(a.climbedAt));
  return out;
}
