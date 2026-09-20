import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { User } from '../types';
import { displayName, isAccessHeld } from './constants';
import { formatDdMmYyyy, formatDdMmYyyyHHmm } from './dateUtils';

type ExportRow = {
  Name: string;
  Email: string;
  Phone: string;
  Role: string;
  Status: string;
  Leadership: string;
  Joined: string;
};

type ExportMeta = {
  churchName: string;
  exportedAt: Date;
};

export type UserExportContext = {
  directoryByUserId: Record<string, { id: string } | undefined>;
};

function formatLocalDateTime(d: Date): string {
  return formatDdMmYyyyHHmm(d);
}

function formatJoined(iso?: string): string {
  return formatDdMmYyyy(iso);
}

function accessStatus(user: User): string {
  if (user.is_approved) return 'Approved';
  if (isAccessHeld(user)) return 'Hold Access';
  return 'Pending';
}

function roleLabel(user: User): string {
  if (user.is_super_admin) return 'Super Admin';
  if (user.role === 'admin') return 'Admin';
  return 'Member';
}

function toRows(users: User[], context: UserExportContext): ExportRow[] {
  return users.map((u) => ({
    Name: displayName(u),
    Email: u.email ?? '',
    Phone: u.phone ?? '',
    Role: roleLabel(u),
    Status: accessStatus(u),
    Leadership: context.directoryByUserId[u.id] ? 'Linked' : 'Not linked',
    Joined: formatJoined(u.created_at),
  }));
}

function csvEscape(value: string): string {
  const s = value ?? '';
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
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

export function downloadAdminUsersCsv(
  users: User[],
  filenameBase: string,
  meta: ExportMeta,
  context: UserExportContext
) {
  const rows = toRows(users, context);
  const headers: (keyof ExportRow)[] = [
    'Name',
    'Email',
    'Phone',
    'Role',
    'Status',
    'Leadership',
    'Joined',
  ];
  const title = `${meta.churchName} – Users List`;
  const exportedLine = `Exported: ${formatLocalDateTime(meta.exportedAt)}`;

  const lines = [
    csvEscape(title),
    '',
    headers.join(','),
    ...rows.map((r) => headers.map((h) => csvEscape(String(r[h] ?? ''))).join(',')),
    '',
    csvEscape(exportedLine),
  ];

  const csv = lines.join('\r\n');
  downloadBlob(`${filenameBase}.csv`, new Blob([csv], { type: 'text/csv;charset=utf-8' }));
}

export function downloadAdminUsersPdf(
  users: User[],
  filenameBase: string,
  meta: ExportMeta,
  context: UserExportContext
) {
  const rows = toRows(users, context);
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });

  const headerText = `${meta.churchName} – Users List`;
  const exportedAtText = formatLocalDateTime(meta.exportedAt);

  autoTable(doc, {
    startY: 80,
    head: [['Name', 'Email', 'Phone', 'Role', 'Status', 'Leadership', 'Joined']],
    body: rows.map((r) => [r.Name, r.Email, r.Phone, r.Role, r.Status, r.Leadership, r.Joined]),
    styles: { fontSize: 9, cellPadding: 6 },
    headStyles: { fillColor: [210, 167, 74] },
    margin: { left: 40, right: 40, top: 80, bottom: 50 },
    tableWidth: 'auto',
    didDrawPage: (data) => {
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      doc.setTextColor(40);

      doc.setFontSize(14);
      doc.text(headerText, pageWidth / 2, 40, { align: 'center' });

      doc.setFontSize(9);
      doc.text(exportedAtText, 40, pageHeight - 20);
      doc.text(`Page ${data.pageNumber}`, pageWidth - 40, pageHeight - 20, { align: 'right' });
    },
  });

  doc.save(`${filenameBase}.pdf`);
}
