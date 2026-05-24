import type { EightaAscent, EightaCategory } from "@/lib/eighta/types";

function detectDelimiter(headerLine: string): string {
  const semis = (headerLine.match(/;/g) ?? []).length;
  const commas = (headerLine.match(/,/g) ?? []).length;
  return semis >= commas ? ";" : ",";
}

function parseCsvLine(line: string, delimiter: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (ch === delimiter && !inQuotes) {
      out.push(cur);
      cur = "";
      continue;
    }
    cur += ch;
  }
  out.push(cur);
  return out.map((s) => s.trim());
}

function normalizeHeader(h: string): string {
  return h.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function parseDateCell(raw: string): string {
  const s = raw.trim();
  if (!s) return new Date().toISOString().slice(0, 10);
  const d = new Date(s);
  if (!Number.isNaN(d.getTime())) {
    return d.toISOString().slice(0, 10);
  }
  const parts = s.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (parts) return `${parts[1]}-${parts[2]}-${parts[3]}`;
  return new Date().toISOString().slice(0, 10);
}

function inferCategory(style: string, grade: string): EightaCategory {
  const g = grade.toUpperCase();
  if (/^V\d|V\d/i.test(g) || g.startsWith("V")) return "bouldering";
  const s = style.toLowerCase();
  if (s.includes("boulder")) return "bouldering";
  return "sportclimbing";
}

/** Parse official 8a.nu logbook CSV export. */
export function parseEightaCsv(text: string): EightaAscent[] {
  const lines = text.replace(/\r\n/g, "\n").split("\n").filter((l) => l.trim());
  if (lines.length < 2) return [];

  const delimiter = detectDelimiter(lines[0]);
  const headers = parseCsvLine(lines[0], delimiter).map(normalizeHeader);
  const idx = (name: string) => headers.indexOf(normalizeHeader(name));

  const dateIdx = idx("date");
  const styleIdx = idx("style");
  const routeIdx = idx("route");
  const gradeIdx = idx("grade");
  const cragIdx = idx("crag");
  const sectorIdx = idx("sector");
  const notesIdx = idx("notes");
  const ratingIdx = idx("rating");

  const out: EightaAscent[] = [];
  const seen = new Set<string>();

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i], delimiter);
    const route = routeIdx >= 0 ? cols[routeIdx] : "";
    if (!route) continue;

    const climbedAt = parseDateCell(dateIdx >= 0 ? cols[dateIdx] : "");
    const gradeDisplay = gradeIdx >= 0 ? cols[gradeIdx] || null : null;
    const ascentStyle = styleIdx >= 0 ? cols[styleIdx] || null : null;
    const category = inferCategory(ascentStyle ?? "", gradeDisplay ?? "");
    const externalKey = `csv:${category}:${route}:${climbedAt}:${gradeDisplay ?? ""}`;
    if (seen.has(externalKey)) continue;
    seen.add(externalKey);

    out.push({
      externalKey,
      category,
      climbName: route,
      climbedAt,
      gradeDisplay,
      ascentStyle,
      cragName: cragIdx >= 0 ? cols[cragIdx] || null : null,
      areaName: sectorIdx >= 0 ? cols[sectorIdx] || null : null,
      comment: notesIdx >= 0 ? cols[notesIdx] || null : null,
      rating:
        ratingIdx >= 0 && cols[ratingIdx]
          ? Number.parseInt(cols[ratingIdx], 10) || null
          : null,
    });
  }

  return out;
}
