import { execSync } from 'node:child_process';

function sh(cmd) {
  return execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}

function getEnv(name, optional = false) {
  const v = process.env[name];
  if (!v && !optional) throw new Error(`Missing env var ${name}. Set it to your Slack webhook URL.`);
  return v || '';
}

function parseStatus(line) {
  const m = line.match(/^[+-]\*\*Status\*\*:\s*(.+?)\s*$/);
  return m ? m[1].trim() : null;
}

function ticketIdFromPath(path) {
  const m = path.match(/\/([A-Z]+-(?:FEAT|BUG|DESIGN|CONTENT|INFRA)-\d+)\.md$/);
  return m ? m[1] : null;
}

function collectTransitionsFromDiff(diffText) {
  const transitions = [];
  let file = null;
  let oldStatus = null;
  let newStatus = null;

  const flush = () => {
    if (!file || !oldStatus || !newStatus) return;
    if (oldStatus === newStatus) return;
    transitions.push({ file, oldStatus, newStatus });
  };

  for (const line of diffText.split(/\r?\n/)) {
    const m = line.match(/^diff --git a\/(.+?) b\/(.+)$/);
    if (m) {
      flush();
      file = m[2];
      oldStatus = null;
      newStatus = null;
      continue;
    }
    if (!file) continue;
    if (line.startsWith('--- ') || line.startsWith('+++ ') || line.startsWith('index ') || line.startsWith('@@')) continue;

    const s = parseStatus(line);
    if (!s) continue;
    if (line.startsWith('-')) oldStatus = s;
    if (line.startsWith('+')) newStatus = s;
  }

  flush();
  return transitions;
}

async function postSlack(webhookUrl, text) {
  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Slack webhook failed: HTTP ${res.status} ${res.statusText} ${body}`.trim());
  }
}

async function main() {
  const webhookUrl = getEnv('SLACK_WEBHOOK_URL');
  const repoName = getEnv('SLACK_REPO_NAME', true) || 'ABCWebsite';

  // Commit info
  const sha = sh('git rev-parse --short HEAD');
  const author = sh('git log -1 --format=%an');
  const subject = sh('git log -1 --format=%s');

  // What changed in this commit?
  const nameOnly = sh('git diff-tree --no-commit-id --name-only -r HEAD');
  const files = nameOnly.split(/\r?\n/).filter(Boolean);

  const ticketFiles = files.filter((f) => f.startsWith('tickets/') && f.endsWith('.md'));
  const ticketIds = Array.from(
    new Set(ticketFiles.map((f) => ticketIdFromPath(f)).filter(Boolean))
  );

  // Only notify when tickets are involved OR when status line changed.
  // We still compute status transitions even if other files changed.
  const diffTickets = sh('git show --unified=0 --pretty=format: -- tickets || true');
  const transitions = collectTransitionsFromDiff(diffTickets)
    .map((t) => ({ ...t, ticketId: ticketIdFromPath(t.file) }))
    .filter((t) => t.ticketId);

  const shouldNotify = ticketFiles.length > 0 || transitions.length > 0;
  if (!shouldNotify) return;

  const lines = [];
  lines.push(`Ticket update — ${repoName}`);
  lines.push(`Commit ${sha} by ${author}: ${subject}`);

  if (ticketIds.length > 0) {
    lines.push(`Tickets touched: ${ticketIds.join(', ')}`);
  }

  if (transitions.length > 0) {
    for (const t of transitions) {
      lines.push(`${t.ticketId}: ${t.oldStatus} → ${t.newStatus}`);
    }
  }

  await postSlack(webhookUrl, lines.join('\n'));
}

main().catch((err) => {
  console.error(err);
  process.exit(0); // never block commits because Slack failed
});

