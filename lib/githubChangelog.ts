import type { ChangelogArea, ChangelogEntry, ChangelogKind } from './changelog';
import { formatDdMmYyyy } from './dateUtils';

const DEFAULT_REPO = 'AppdoersDevTeam/ABCWebsite';
const CACHE_KEY = 'abc-github-changelog-v3';
const CACHE_MS = 5 * 60 * 1000;

type GithubFile = { filename?: string; status?: string };

type GithubCommit = {
  sha: string;
  html_url?: string;
  commit?: {
    message?: string;
    author?: { name?: string; date?: string };
    committer?: { name?: string; date?: string };
  };
  author?: { login?: string };
  files?: GithubFile[];
};

type CachePayload = {
  fetchedAt: number;
  entries: ChangelogEntry[];
};

export type GithubChangelogResult = {
  ok: boolean;
  entries: ChangelogEntry[];
  error?: string;
};

const FILE_LABELS: Record<string, string> = {
  AdminUsers: 'User Management',
  AdminTeam: 'Leadership',
  AdminChangelog: 'Changelog',
  AdminOverview: 'Admin Overview',
  AdminRoster: 'Rosters',
  AdminEvents: 'Events',
  AdminDevotional: 'Devotionals',
  AdminNewsletter: 'Newsletters',
  AdminLogs: 'System Logs',
  AdminLayout: 'Admin menu',
  DashboardLayout: 'Member menu',
  LinkDirectoryUserModal: 'Leadership account linking',
  dateUtils: 'system date format',
  eventDateUtils: 'event dates',
  githubChangelog: 'Changelog from GitHub',
  changelog: 'Changelog records',
  HelpContent: 'Help',
};

function repoSlug(): string {
  const fromEnv = (import.meta.env.VITE_GITHUB_REPO || '').trim();
  return fromEnv || DEFAULT_REPO;
}

function githubHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  const token = (import.meta.env.VITE_GITHUB_TOKEN || '').trim();
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

function inferKind(message: string): ChangelogKind {
  const head = message.trim().toLowerCase();
  if (/^(fix|bug|hotfix|patch)\b/.test(head) || /\bfix(es|ed)?\b/.test(head.slice(0, 80))) {
    return 'fixed';
  }
  if (/^(feat|feature|add|added|new)\b/.test(head)) return 'added';
  return 'changed';
}

function inferArea(message: string, files: string[] = []): ChangelogArea {
  const t = `${message} ${files.join(' ')}`.toLowerCase();
  if (/\b(user|approval|hold access|login|oauth|password)\b/.test(t) || /adminusers/.test(t)) return 'users';
  if (/\b(auth|sign[- ]?in|sign[- ]?up)\b/.test(t)) return 'auth';
  if (/\b(calendar|annual)\b/.test(t)) return 'calendar';
  if (/\bdevotional/.test(t)) return 'devotionals';
  if (/\bevent/.test(t)) return 'events';
  if (/\b(leadership|directory|teammember|adminteam)\b/.test(t)) return 'leadership';
  if (/\bnewsletter/.test(t)) return 'newsletters';
  if (/\bprayer/.test(t)) return 'prayer';
  if (/\broster/.test(t)) return 'roster';
  if (/\bsermon/.test(t)) return 'sermons';
  if (/\b(changelog|githubchangelog|adminchangelog)\b/.test(t)) return 'admin';
  if (/\b(public|home page|about)\b/.test(t)) return 'public';
  return 'system';
}

function stripConventionalPrefix(line: string): string {
  return line.replace(/^\s*(feat|fix|chore|docs|refactor|style|test|perf|infra)(\(.+?\))?:\s*/i, '').trim();
}

function isGenericMessage(message: string): boolean {
  const first = message.split('\n')[0].trim();
  return /^(updates?\s+\d+|update|wip|misc|changes?|note for saving)\b/i.test(first) || first.length < 8;
}

function sentenceCase(text: string): string {
  const trimmed = text.replace(/\s+/g, ' ').trim();
  if (!trimmed) return '';
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

function labelFromFilename(filename: string): string {
  const base = filename.split('/').pop()?.replace(/\.(tsx|ts|jsx|js|mjs|md|json)$/i, '') ?? filename;
  if (FILE_LABELS[base]) return FILE_LABELS[base];
  return base.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[-_]/g, ' ');
}

function bulletsFromFiles(files: GithubFile[]): string[] {
  const unique = new Map<string, string>();
  for (const file of files) {
    const name = file.filename?.trim();
    if (!name || name.startsWith('.') || name.includes('package-lock')) continue;
    const action = file.status === 'added' ? 'Added' : file.status === 'removed' ? 'Removed' : 'Updated';
    const label = labelFromFilename(name);
    const key = `${action} ${label}`;
    if (!unique.has(key)) unique.set(key, `${action} ${label}.`);
    if (unique.size >= 8) break;
  }
  return Array.from(unique.values());
}

function bulletsFromMessage(bodyLines: string[]): string[] {
  return bodyLines
    .map((line) => line.replace(/^[-*•]\s*/, '').trim())
    .filter((line) => line && !/github\.com/i.test(line) && !/^co-authored-by:/i.test(line))
    .slice(0, 8)
    .map((line) => (line.endsWith('.') ? line : `${line}.`));
}

function commitToEntry(commit: GithubCommit): ChangelogEntry | null {
  const message = (commit.commit?.message || '').trim();
  if (!message) return null;
  const [titleLine, ...rest] = message.split('\n');
  const headingRaw = stripConventionalPrefix(titleLine) || 'Website update';
  const heading = isGenericMessage(message)
    ? 'Website update'
    : sentenceCase(headingRaw.replace(/\[CHG-[^\]]+\]/gi, '').trim() || 'Website update');
  const bodyLines = rest.map((line) => line.trim()).filter(Boolean);
  const files = commit.files ?? [];
  const fileBullets = bulletsFromFiles(files);
  const messageBullets = bulletsFromMessage(bodyLines);
  const details = (fileBullets.length ? fileBullets : messageBullets).length
    ? fileBullets.length
      ? fileBullets
      : messageBullets
    : [
        'Applied a website update across the church site.',
        'Reviewed related screens so the change stays consistent.',
      ];

  const when = commit.commit?.author?.date || commit.commit?.committer?.date;
  const dateLabel = when ? formatDdMmYyyy(when) : '';
  const summary = isGenericMessage(message)
    ? `Website updates were applied${dateLabel ? ` on ${dateLabel}` : ''}. The notes below list what this change covered.`
    : sentenceCase(bodyLines[0] || `${heading} was shipped to the live website.`);

  return {
    id: `gh-${commit.sha}`,
    changedAt: when || new Date().toISOString(),
    changedBy: commit.commit?.author?.name || commit.author?.login || commit.commit?.committer?.name || 'Development team',
    kind: inferKind(message),
    area: inferArea(message, files.map((file) => file.filename || '')),
    title: heading,
    heading,
    summary,
    details,
  };
}

function readCache(): ChangelogEntry[] | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachePayload;
    if (!parsed?.fetchedAt || !Array.isArray(parsed.entries)) return null;
    if (Date.now() - parsed.fetchedAt > CACHE_MS) return null;
    return parsed.entries;
  } catch {
    return null;
  }
}

function writeCache(entries: ChangelogEntry[]) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ fetchedAt: Date.now(), entries }));
  } catch {
    /* ignore quota */
  }
}

async function fetchCommitPage(page: number, perPage: number): Promise<GithubCommit[]> {
  const repo = repoSlug();
  const res = await fetch(`https://api.github.com/repos/${repo}/commits?per_page=${perPage}&page=${page}`, {
    headers: githubHeaders(),
  });
  if (!res.ok) throw new Error(`GitHub ${res.status}`);
  return (await res.json()) as GithubCommit[];
}

async function fetchCommitDetail(sha: string): Promise<GithubCommit | null> {
  const repo = repoSlug();
  const res = await fetch(`https://api.github.com/repos/${repo}/commits/${sha}`, {
    headers: githubHeaders(),
  });
  if (!res.ok) return null;
  return (await res.json()) as GithubCommit;
}

/** Newest GitHub commits as changelog entries. Cached briefly in the browser. */
export async function fetchGithubChangelog(force = false): Promise<GithubChangelogResult> {
  if (!force) {
    const cached = readCache();
    if (cached) return { ok: true, entries: cached };
  }

  try {
    const page = await fetchCommitPage(1, 40);
    const generic = page.filter((commit) => isGenericMessage(commit.commit?.message || '')).slice(0, 12);
    const details = await Promise.all(generic.map((commit) => fetchCommitDetail(commit.sha)));
    const bySha = new Map(details.filter(Boolean).map((commit) => [commit!.sha, commit!]));

    const seen = new Set<string>();
    const entries: ChangelogEntry[] = [];
    for (const commit of page) {
      if (!commit?.sha || seen.has(commit.sha)) continue;
      seen.add(commit.sha);
      const entry = commitToEntry(bySha.get(commit.sha) || commit);
      if (entry) entries.push(entry);
    }
    entries.sort((a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime());
    writeCache(entries);
    return { ok: true, entries };
  } catch (e) {
    const cached = readCache();
    if (cached) return { ok: true, entries: cached };
    return {
      ok: false,
      entries: [],
      error: e instanceof Error ? e.message : 'Could not load GitHub commits',
    };
  }
}

export function mergeChangelogEntries(
  curated: ChangelogEntry[],
  github: ChangelogEntry[]
): ChangelogEntry[] {
  const byId = new Map<string, ChangelogEntry>();
  for (const entry of [...curated, ...github]) {
    if (!byId.has(entry.id)) byId.set(entry.id, entry);
  }
  return Array.from(byId.values()).sort(
    (a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime()
  );
}
