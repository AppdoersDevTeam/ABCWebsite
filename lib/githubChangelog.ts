import type { ChangelogArea, ChangelogEntry, ChangelogKind } from './changelog';

const DEFAULT_REPO = 'AppdoersDevTeam/ABCWebsite';
const CACHE_KEY = 'abc-github-changelog-v1';
const CACHE_MS = 5 * 60 * 1000;

type GithubCommit = {
  sha: string;
  html_url?: string;
  commit?: {
    message?: string;
    author?: { name?: string; date?: string };
    committer?: { name?: string; date?: string };
  };
  author?: { login?: string };
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

function inferKind(message: string): ChangelogKind {
  const head = message.trim().toLowerCase();
  if (/^(fix|bug|hotfix|patch)\b/.test(head) || /\bfix(es|ed)?\b/.test(head.slice(0, 80))) {
    return 'fixed';
  }
  if (/^(feat|feature|add|added|new)\b/.test(head)) return 'added';
  return 'changed';
}

function inferArea(message: string): ChangelogArea {
  const t = message.toLowerCase();
  if (/\b(user|approval|hold access|login|oauth|password)\b/.test(t)) return 'users';
  if (/\b(auth|sign[- ]?in|sign[- ]?up)\b/.test(t)) return 'auth';
  if (/\b(calendar|annual)\b/.test(t)) return 'calendar';
  if (/\bdevotional/.test(t)) return 'devotionals';
  if (/\bevent/.test(t)) return 'events';
  if (/\b(leadership|directory|team member)\b/.test(t)) return 'leadership';
  if (/\bnewsletter/.test(t)) return 'newsletters';
  if (/\bprayer/.test(t)) return 'prayer';
  if (/\broster/.test(t)) return 'roster';
  if (/\bsermon/.test(t)) return 'sermons';
  if (/\b(changelog|deploy|system setup|settings)\b/.test(t)) return 'admin';
  if (/\b(public|home page|about)\b/.test(t)) return 'public';
  return 'system';
}

function commitToEntry(commit: GithubCommit): ChangelogEntry | null {
  const message = (commit.commit?.message || '').trim();
  if (!message) return null;
  const [titleLine, ...rest] = message.split('\n');
  const title = titleLine.replace(/^\s*(feat|fix|chore|docs|refactor|style|test|perf)(\(.+?\))?:\s*/i, '').trim() || titleLine.trim();
  const summary = rest.join('\n').trim() || title;
  const changedAt =
    commit.commit?.author?.date || commit.commit?.committer?.date || new Date().toISOString();
  const changedBy =
    commit.commit?.author?.name || commit.author?.login || commit.commit?.committer?.name || 'GitHub';

  return {
    id: `gh-${commit.sha}`,
    changedAt,
    changedBy,
    kind: inferKind(message),
    area: inferArea(message),
    title: title.slice(0, 140),
    summary: summary.slice(0, 400),
    details: commit.html_url ? [`GitHub: ${commit.html_url}`] : undefined,
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
    const payload: CachePayload = { fetchedAt: Date.now(), entries };
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(payload));
  } catch {
    /* ignore quota */
  }
}

async function fetchCommitPage(page: number, perPage: number): Promise<GithubCommit[]> {
  const repo = repoSlug();
  const url = `https://api.github.com/repos/${repo}/commits?per_page=${perPage}&page=${page}`;
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  const token = (import.meta.env.VITE_GITHUB_TOKEN || '').trim();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(url, { headers });
  if (!res.ok) {
    throw new Error(`GitHub ${res.status}`);
  }
  return (await res.json()) as GithubCommit[];
}

/** Newest GitHub commits as changelog entries. Cached briefly in the browser. */
export async function fetchGithubChangelog(force = false): Promise<GithubChangelogResult> {
  if (!force) {
    const cached = readCache();
    if (cached) return { ok: true, entries: cached };
  }

  try {
    const pages = await Promise.all([fetchCommitPage(1, 100), fetchCommitPage(2, 100)]);
    const seen = new Set<string>();
    const entries: ChangelogEntry[] = [];
    for (const commit of pages.flat()) {
      if (!commit?.sha || seen.has(commit.sha)) continue;
      seen.add(commit.sha);
      const entry = commitToEntry(commit);
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
  for (const entry of [...github, ...curated]) {
    if (!byId.has(entry.id)) byId.set(entry.id, entry);
  }
  return Array.from(byId.values()).sort(
    (a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime()
  );
}
