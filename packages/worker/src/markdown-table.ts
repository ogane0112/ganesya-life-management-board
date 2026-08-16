/**
 * Minimal GitHub-Flavored-Markdown table parser.
 *
 * Deliberately dependency-free (keeps the Worker bundle small) and only
 * supports the subset of GFM tables this project relies on: a header row,
 * a separator row (`---`), and data rows, all using `|` delimiters.
 *
 * Returns an array of objects keyed by the (lower-cased, trimmed) header
 * cell text. Cells are trimmed; an empty cell becomes `""`.
 */
export function parseMarkdownTable(content: string): Record<string, string>[] {
  const lines = content
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.startsWith("|") && l.endsWith("|"));

  if (lines.length < 2) return [];

  const splitRow = (line: string): string[] =>
    line
      .slice(1, -1)
      .split("|")
      .map((cell) => cell.trim());

  const header = splitRow(lines[0]).map((h) => h.toLowerCase());
  const isSeparator = (line: string) =>
    splitRow(line).every((cell) => /^:?-+:?$/.test(cell));

  const dataLines = isSeparator(lines[1]) ? lines.slice(2) : lines.slice(1);

  return dataLines.map((line) => {
    const cells = splitRow(line);
    const row: Record<string, string> = {};
    header.forEach((key, i) => {
      row[key] = cells[i] ?? "";
    });
    return row;
  });
}

/**
 * Real life-management markdown files often hold multiple tables under
 * different `##`/`###` headings (e.g. qualifications.md has separate
 * "held", "in progress", and "education" tables). This extracts just the
 * body text between a heading matching `headingRegex` and the next
 * heading of the same-or-shallower level, so a specific table can be
 * isolated before parsing.
 *
 * Returns "" (parses to no rows) if no matching heading is found.
 */
export function extractSection(content: string, headingRegex: RegExp): string {
  const lines = content.split("\n");
  const startIdx = lines.findIndex((line) => headingRegex.test(line));
  if (startIdx === -1) return "";

  const headingLevel = (/^#+/.exec(lines[startIdx]) ?? [""])[0].length;
  const rest = lines.slice(startIdx + 1);
  const endIdx = rest.findIndex((line) => {
    const m = /^(#+)\s/.exec(line);
    return m ? m[1].length <= headingLevel : false;
  });

  return (endIdx === -1 ? rest : rest.slice(0, endIdx)).join("\n");
}

/**
 * Pivots a "key/value" style two-column table (as used for e.g. "現職" —
 * one row per field, not one row per record) into a single lookup object.
 * Extra columns beyond keyCol/valueCol are ignored.
 */
export function tableToKeyValue(
  rows: Record<string, string>[],
  keyCol: string,
  valueCol: string,
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const row of rows) {
    const key = row[keyCol];
    if (key) result[key] = row[valueCol] ?? "";
  }
  return result;
}
