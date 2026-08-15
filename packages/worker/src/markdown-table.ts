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
