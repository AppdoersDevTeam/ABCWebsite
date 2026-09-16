import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  CHANGELOG_AREA_LABELS,
  CHANGELOG_KIND_LABELS,
  type ChangelogEntry,
} from './changelog';
import { formatFullDateTimeInTimezone, formatDdMmYyyyHHmm } from './dateUtils';

export type ChangelogExportMeta = {
  churchName: string;
  exportedAt: Date;
  /** e.g. "Type: Added · Area: Users · Search: hold" */
  filterSummary?: string;
  viewerTimezone?: string;
};

type ExportRow = {
  when: string;
  changedBy: string;
  type: string;
  area: string;
  title: string;
  summary: string;
  details: string;
};

function formatLocalDateTime(d: Date): string {
  return formatDdMmYyyyHHmm(d);
}

function toRows(entries: ChangelogEntry[], meta: ChangelogExportMeta): ExportRow[] {
  return entries.map((entry) => ({
    when: formatFullDateTimeInTimezone(entry.changedAt, meta.viewerTimezone),
    changedBy: entry.changedBy,
    type: CHANGELOG_KIND_LABELS[entry.kind],
    area: CHANGELOG_AREA_LABELS[entry.area],
    title: entry.title,
    summary: entry.summary,
    details: (entry.details ?? []).join('; '),
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

/** CSV download — opens in Microsoft Excel. */
export function downloadChangelogCsv(
  entries: ChangelogEntry[],
  filenameBase: string,
  meta: ChangelogExportMeta
) {
  const rows = toRows(entries, meta);
  const title = `${meta.churchName} – Changelog`;
  const exportedLine = `Exported: ${formatLocalDateTime(meta.exportedAt)}`;
  const filterLine = meta.filterSummary ? `Filters: ${meta.filterSummary}` : '';
  const headers = ['When', 'Changed by', 'Type', 'Area', 'Title', 'Summary', 'Details'];

  const lines = [
    csvEscape(title),
    filterLine ? csvEscape(filterLine) : '',
    '',
    headers.join(','),
    ...rows.map((r) =>
      [r.when, r.changedBy, r.type, r.area, r.title, r.summary, r.details]
        .map((v) => csvEscape(String(v ?? '')))
        .join(',')
    ),
    '',
    csvEscape(exportedLine),
  ].filter((line, idx) => !(idx === 1 && !filterLine));

  downloadBlob(`${filenameBase}.csv`, new Blob([lines.join('\r\n')], { type: 'text/csv;charset=utf-8' }));
}

export function downloadChangelogPdf(
  entries: ChangelogEntry[],
  filenameBase: string,
  meta: ChangelogExportMeta
) {
  const rows = toRows(entries, meta);
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });

  const headerText = `${meta.churchName} – Changelog`;
  const exportedAtText = formatLocalDateTime(meta.exportedAt);
  const filterText = meta.filterSummary ? `Filters: ${meta.filterSummary}` : '';

  autoTable(doc, {
    startY: filterText ? 92 : 80,
    head: [['When', 'Changed by', 'Type', 'Area', 'Title', 'Summary', 'Details']],
    body: rows.map((r) => [r.when, r.changedBy, r.type, r.area, r.title, r.summary, r.details]),
    styles: { fontSize: 8, cellPadding: 5, overflow: 'linebreak' },
    headStyles: { fillColor: [210, 167, 74] },
    columnStyles: {
      0: { cellWidth: 95 },
      1: { cellWidth: 72 },
      2: { cellWidth: 44 },
      3: { cellWidth: 56 },
      4: { cellWidth: 110 },
      5: { cellWidth: 'auto' },
      6: { cellWidth: 'auto' },
    },
    margin: { left: 36, right: 36, top: 80, bottom: 50 },
    didDrawPage: (data) => {
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      doc.setTextColor(40);
      doc.setFontSize(14);
      doc.text(headerText, pageWidth / 2, 36, { align: 'center' });

      if (filterText) {
        doc.setFontSize(9);
        doc.text(filterText, pageWidth / 2, 52, { align: 'center' });
      }

      doc.setFontSize(9);
      doc.text(exportedAtText, 36, pageHeight - 20);
      doc.text(`Page ${data.pageNumber}`, pageWidth - 36, pageHeight - 20, { align: 'right' });
    },
  });

  doc.save(`${filenameBase}.pdf`);
}
