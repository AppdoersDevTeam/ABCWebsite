import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { TeamMember } from '../types';
import { getDisplayRole, inferProfileType } from './teamMemberUtils';

type ExportRow = {
  Name: string;
  Email: string;
  Phone: string;
  Role: string;
  Groups: string;
  JobRoles: string;
  Status: string;
};

type ExportMeta = {
  churchName: string;
  exportedAt: Date;
};

const PROFILE_LABEL: Record<ReturnType<typeof inferProfileType>, string> = {
  staff: 'Staff',
  attendee: 'Attendee',
  member: 'Member',
};

function formatLocalDateTime(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function toRows(members: TeamMember[]): ExportRow[] {
  const sorted = [...members].sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''));
  return sorted.map((m) => ({
    Name: m.name ?? '',
    Email: m.email ?? '',
    Phone: m.phone ?? '',
    Role: getDisplayRole(m),
    Groups: (m.groups || []).map((g) => g.name).filter(Boolean).join('; '),
    JobRoles: (m.job_roles || []).map((r) => r.name).filter(Boolean).join('; '),
    Status: PROFILE_LABEL[inferProfileType(m)],
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

export function downloadDirectoryCsv(members: TeamMember[], filenameBase: string, meta: ExportMeta) {
  const rows = toRows(members);
  const headers: (keyof ExportRow)[] = ['Name', 'Email', 'Phone', 'Role', 'Groups', 'JobRoles', 'Status'];
  const title = `${meta.churchName} – Directory/People List`;
  const exportedLine = `Exported: ${formatLocalDateTime(meta.exportedAt)}`;

  const lines = [
    csvEscape(title),
    '',
    ['Name', 'Email', 'Phone', 'Role', 'Groups', 'Job Roles', 'Status'].join(','),
    ...rows.map((r) => headers.map((h) => csvEscape(String(r[h] ?? ''))).join(',')),
    '',
    csvEscape(exportedLine),
  ];

  const csv = lines.join('\r\n');
  downloadBlob(`${filenameBase}.csv`, new Blob([csv], { type: 'text/csv;charset=utf-8' }));
}

export function downloadDirectoryPdf(members: TeamMember[], filenameBase: string, meta: ExportMeta) {
  const rows = toRows(members);
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });

  const headerText = `${meta.churchName} – Directory/People List`;
  const exportedAtText = formatLocalDateTime(meta.exportedAt);

  autoTable(doc, {
    startY: 80,
    head: [['Name', 'Email', 'Phone', 'Role', 'Groups', 'Job Roles', 'Status']],
    body: rows.map((r) => [r.Name, r.Email, r.Phone, r.Role, r.Groups, r.JobRoles, r.Status]),
    styles: { fontSize: 9, cellPadding: 6 },
    headStyles: { fillColor: [210, 167, 74] }, // gold-ish
    margin: { left: 40, right: 40, top: 80, bottom: 50 },
    tableWidth: 'auto',
    didDrawPage: (data) => {
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      doc.setTextColor(40);

      doc.setFontSize(14);
      doc.text(headerText, 40, 40);

      doc.setFontSize(9);
      doc.text(exportedAtText, 40, pageHeight - 20);
      doc.text(`Page ${data.pageNumber}`, pageWidth - 40, pageHeight - 20, { align: 'right' });
    },
  });

  doc.save(`${filenameBase}.pdf`);
}

