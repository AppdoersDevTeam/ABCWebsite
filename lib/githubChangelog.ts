import type { ChangelogArea, ChangelogEntry, ChangelogKind } from './changelog';
import {
  INTERNAL_APP_LOCATION,
  locationFromArea,
  locationFromFiles,
  locationFromPath,
} from './changelogLocations';
import { formatDdMmYyyy } from './dateUtils';

const DEFAULT_REPO = 'AppdoersDevTeam/ABCWebsite';
const CACHE_KEY = 'abc-github-changelog-v5';
const CACHE_MS = 5 * 60 * 1000;
const DETAIL_BATCH = 8;

type GithubFile = {
  filename?: string;
  status?: string;
  additions?: number;
  deletions?: number;
};

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

function areaFromLocation(location: string): ChangelogArea {
  switch (location) {
    case 'User Management':
      return 'users';
    case 'Prayers':
      return 'prayer';
    case 'Newsletters':
      return 'newsletters';
    case 'Devotionals':
      return 'devotionals';
    case 'Leadership':
      return 'leadership';
    case 'Events':
      return 'events';
    case 'Rosters (Beta)':
      return 'roster';
    case 'Annual Calendar':
      return 'calendar';
    case 'Sermons':
      return 'sermons';
    case 'User Security':
      return 'auth';
    case 'Overview':
    case 'Overviews':
    case 'Help':
    case 'Logs':
    case 'Changelog':
    case 'System Setup':
      return 'admin';
    default:
      return 'system';
  }
}

function inferArea(message: string, files: string[] = [], location?: string): ChangelogArea {
  if (location && location !== INTERNAL_APP_LOCATION) return areaFromLocation(location);
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

function finishSentence(text: string): string {
  const trimmed = text.replace(/^[-*•]\s*/, '').replace(/\s+/g, ' ').trim();
  if (!trimmed) return '';
  return /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`;
}

function friendlyFileLabel(filename: string): string {
  const base = filename.split('/').pop()?.replace(/\.(tsx|ts|jsx|js|mjs|md|json)$/i, '') ?? filename;
  return base.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[-_]/g, ' ');
}

function joinList(items: string[]): string {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
}

function fileAction(status?: string): 'Added' | 'Removed' | 'Updated' {
  if (status === 'added') return 'Added';
  if (status === 'removed') return 'Removed';
  return 'Updated';
}

function bulletsFromFiles(files: GithubFile[]): string[] {
  const grouped = new Map<string, GithubFile[]>();
  for (const file of files) {
    const name = file.filename?.trim();
    if (!name || name.startsWith('.') || name.includes('package-lock')) continue;
    const loc = locationFromPath(name);
    const list = grouped.get(loc) ?? [];
    list.push(file);
    grouped.set(loc, list);
  }

  const bullets: string[] = [];
  for (const [location, list] of grouped) {
    const labels = [...new Set(list.map((file) => friendlyFileLabel(file.filename || '')))].slice(0, 5);
    const additions = list.reduce((sum, file) => sum + (file.additions ?? 0), 0);
    const deletions = list.reduce((sum, file) => sum + (file.deletions ?? 0), 0);
    const statuses = new Set(list.map((file) => fileAction(file.status)));
    const action = statuses.size === 1 ? [...statuses][0] : 'Updated';
    const extra = list.length > labels.length ? ` and ${list.length - labels.length} more file${list.length - labels.length === 1 ? '' : 's'}` : '';
    const counts =
      additions || deletions
        ? ` ${additions} line${additions === 1 ? '' : 's'} added and ${deletions} removed.`
        : '';
    bullets.push(
      finishSentence(
        `${location}: ${action.toLowerCase()} ${joinList(labels)}${extra}.${counts}`
      )
    );
    if (bullets.length >= 10) break;
  }
  return bullets;
}

function bulletsFromMessage(bodyLines: string[]): string[] {
  return bodyLines
    .map((line) => finishSentence(line))
    .filter((line) => line && !/github\.com/i.test(line) && !/^co-authored-by:/i.test(line))
    .slice(0, 10);
}

function uniqueBullets(groups: string[][]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const group of groups) {
    for (const item of group) {
      const key = item.toLowerCase();
      if (!item || seen.has(key)) continue;
      seen.add(key);
      out.push(item);
      if (out.length >= 12) return out;
    }
  }
  return out;
}

function commitToEntry(commit: GithubCommit): ChangelogEntry | null {
  const message = (commit.commit?.message || '').trim();
  if (!message) return null;
  const [titleLine, ...rest] = message.split('\n');
  const headingRaw = stripConventionalPrefix(titleLine).replace(/\[CHG-[^\]]+\]/gi, '').trim();
  const bodyLines = rest.map((line) => line.trim()).filter(Boolean);
  const files = commit.files ?? [];
  const filenames = files.map((file) => file.filename || '').filter(Boolean);
  const location = filenames.length
    ? locationFromFiles(filenames)
    : locationFromArea(inferArea(message, filenames), `${headingRaw} ${bodyLines.join(' ')}`);

  const thoughtBullets = bulletsFromMessage(bodyLines);
  const fileBullets = bulletsFromFiles(files);
  const details = uniqueBullets([thoughtBullets, fileBullets]);
  const fallbackDetails = details.length
    ? details
    : [
        finishSentence(`These updates were made in ${location}`),
        'Reviewed the related screens so the change stays consistent in the live app.',
      ];

  const when = commit.commit?.author?.date || commit.commit?.committer?.date;
  const dateLabel = when ? formatDdMmYyyy(when) : '';
  const firstThought = thoughtBullets[0] || (!isGenericMessage(message) ? finishSentence(sentenceCase(headingRaw)) : '');
  const summary = firstThought
    ? firstThought
    : `These updates were made in ${location}${dateLabel ? ` on ${dateLabel}` : ''}. The notes below list what changed.`;

  return {
    id: `gh-${commit.sha}`,
    changedAt: when || new Date().toISOString(),
    changedBy: commit.commit?.author?.name || commit.author?.login || commit.commit?.committer?.name || 'Development team',
    kind: inferKind(message),
    area: inferArea(message, filenames, location),
    title: location,
    heading: location,
    summary,
    details: fallbackDetails,
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

async function fetchCommitDetails(commits: GithubCommit[]): Promise<Map<string, GithubCommit>> {
  const bySha = new Map<string, GithubCommit>();
  for (let i = 0; i < commits.length; i += DETAIL_BATCH) {
    const chunk = commits.slice(i, i + DETAIL_BATCH);
    const details = await Promise.all(chunk.map((commit) => fetchCommitDetail(commit.sha)));
    for (const detail of details) {
      if (detail?.sha) bySha.set(detail.sha, detail);
    }
  }
  return bySha;
}

/** Newest GitHub commits as changelog entries. Cached briefly in the browser. */
export async function fetchGithubChangelog(force = false): Promise<GithubChangelogResult> {
  if (!force) {
    const cached = readCache();
    if (cached) return { ok: true, entries: cached };
  }

  try {
    const page = await fetchCommitPage(1, 40);
    const bySha = await fetchCommitDetails(page);

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
