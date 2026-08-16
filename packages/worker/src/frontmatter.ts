/**
 * The real life-management repo prefixes most markdown files with a YAML
 * frontmatter block containing a `last_updated` (and sometimes `created`)
 * date, e.g.:
 *
 * ---
 * title: "サブスク管理"
 * last_updated: "2026-06-29"
 * ---
 *
 * This is a much more reliable "last touched" signal than the file name
 * for categories whose files aren't named with a leading date (finance/,
 * home/, decisions/). Deliberately a narrow regex scan rather than a full
 * YAML parser to keep the Worker bundle small.
 */
const LAST_UPDATED_RE = /^last_updated:\s*"?(\d{4}-\d{2}-\d{2})"?\s*$/m;
const CREATED_RE = /^created:\s*"?(\d{4}-\d{2}-\d{2})"?\s*$/m;

export function parseFrontmatterDate(content: string): string | undefined {
  return (LAST_UPDATED_RE.exec(content) ?? CREATED_RE.exec(content))?.[1];
}
