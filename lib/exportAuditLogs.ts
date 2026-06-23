import type { AuditLog } from '../types';

function csvEscape(value: string): string {
  const s = value ?? '';
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function formatLocalDateTime(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function downloadAuditLogsCsv(rows: AuditLog[], filenameBase: string) {
  const headers = ['Date', 'Summary', 'Category', 'Action', 'User', 'Email', 'Role', 'Entity', 'Entity ID'];
  const lines = [
    headers.join(','),
    ...rows.map((r) =>
      [
        formatLocalDateTime(r.created_at),
        r.summary,
        r.category,
        r.action,
        r.actor_label || '',
        r.actor_email || '',
        r.actor_role,
        r.entity_type || '',
        r.entity_id || '',
      ]
        .map((v) => csvEscape(String(v ?? '')))
        .join(',')
    ),
  ];
  downloadBlob(`${filenameBase}.csv`, new Blob([lines.join('\r\n')], { type: 'text/csv;charset=utf-8' }));
}
