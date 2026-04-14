import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export type EventRsvpRow = {
  name: string;
  email: string;
  created_at: string;
};

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

export function downloadEventRsvpsCsv(rows: EventRsvpRow[], filenameBase: string) {
  const headers = ['Name', 'Email', 'RSVP Date'];
  const lines = [
    headers.join(','),
    ...rows.map((r) =>
      [r.name, r.email, new Date(r.created_at).toLocaleString('en-US')].map((v) => csvEscape(String(v ?? ''))).join(',')
    ),
  ];

  downloadBlob(`${filenameBase}.csv`, new Blob([lines.join('\r\n')], { type: 'text/csv;charset=utf-8' }));
}

export function downloadEventRsvpsPdf(rows: EventRsvpRow[], filenameBase: string, title: string) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });

  doc.setFontSize(14);
  doc.text(title, 40, 40);

  autoTable(doc, {
    startY: 60,
    head: [['Name', 'Email', 'RSVP Date']],
    body: rows.map((r) => [r.name, r.email, new Date(r.created_at).toLocaleString('en-US')]),
    styles: { fontSize: 9, cellPadding: 6 },
    headStyles: { fillColor: [210, 167, 74] },
    margin: { left: 40, right: 40 },
    tableWidth: 'auto',
  });

  doc.save(`${filenameBase}.pdf`);
}

