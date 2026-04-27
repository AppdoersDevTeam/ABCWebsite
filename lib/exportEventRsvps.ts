import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export type EventRsvpRow = {
  name: string;
  email: string;
  created_at: string;
};

type ExportMeta = {
  churchName: string;
  exportedAt: Date;
};

function csvEscape(value: string): string {
  const s = value ?? '';
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function formatLocalDateTime(d: Date): string {
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

export function downloadEventRsvpsCsv(rows: EventRsvpRow[], filenameBase: string, title: string, meta: ExportMeta) {
  const headers = ['Name', 'Email', 'RSVP Date'];
  const exportedLine = `Exported: ${formatLocalDateTime(meta.exportedAt)}`;
  const lines = [
    csvEscape(`${meta.churchName} – ${title}`),
    '',
    headers.join(','),
    ...rows.map((r) =>
      [r.name, r.email, formatLocalDateTime(new Date(r.created_at))]
        .map((v) => csvEscape(String(v ?? '')))
        .join(',')
    ),
    '',
    csvEscape(exportedLine),
  ];

  downloadBlob(`${filenameBase}.csv`, new Blob([lines.join('\r\n')], { type: 'text/csv;charset=utf-8' }));
}

export function downloadEventRsvpsPdf(rows: EventRsvpRow[], filenameBase: string, title: string, meta: ExportMeta) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });

  autoTable(doc, {
    startY: 80,
    head: [['Name', 'Email', 'RSVP Date']],
    body: rows.map((r) => [r.name, r.email, formatLocalDateTime(new Date(r.created_at))]),
    styles: { fontSize: 9, cellPadding: 6 },
    headStyles: { fillColor: [210, 167, 74] },
    margin: { left: 40, right: 40, top: 80, bottom: 50 },
    tableWidth: 'auto',
    didDrawPage: (data) => {
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      doc.setTextColor(40);

      doc.setFontSize(14);
      doc.text(`${meta.churchName} – ${title}`, pageWidth / 2, 40, { align: 'center' });

      doc.setFontSize(9);
      doc.text(formatLocalDateTime(meta.exportedAt), 40, pageHeight - 20);
      doc.text(`Page ${data.pageNumber}`, pageWidth - 40, pageHeight - 20, { align: 'right' });
    },
  });

  doc.save(`${filenameBase}.pdf`);
}

