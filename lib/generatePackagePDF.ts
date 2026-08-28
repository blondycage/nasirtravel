import { jsPDF } from 'jspdf';
import {
  normalizePackageInfoTables,
  packageInfoTableHasContent,
  type PackageInfoTable,
} from '@/lib/utils/packageInfoTables';

interface Tour {
  _id: string;
  title: string;
  description: string;
  category: string;
  image: string;
  price: string;
  dates: string;
  accommodation: string;
  departure?: string;
  itinerary?: { day: number; title: string; description: string }[];
  inclusions?: string[];
  exclusions?: string[];
  infoTables?: PackageInfoTable[];
}

function stripHtml(html: string): string {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
}

type RGB = [number, number, number];

const BLUE: RGB    = [30, 64, 175];
const ORANGE: RGB  = [249, 115, 22];
const DARK: RGB    = [17, 24, 39];
const GRAY: RGB    = [107, 114, 128];
const LGRAY: RGB   = [243, 244, 246];
const GREEN: RGB   = [22, 163, 74];
const RED: RGB     = [220, 38, 38];
const WHITE: RGB   = [255, 255, 255];

export async function generatePackagePDF(tour: Tour): Promise<void> {
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const PAGE_W = 210;
  const PAGE_H = 297;
  const MARGIN = 18;
  const CONTENT_W = PAGE_W - MARGIN * 2;
  let y = 0;

  const checkPage = (needed: number) => {
    if (y + needed > PAGE_H - 18) {
      pdf.addPage();
      y = MARGIN;
    }
  };

  const sectionHeader = (title: string, color: RGB = BLUE) => {
    checkPage(16);
    pdf.setFillColor(...color);
    pdf.rect(MARGIN, y, 3, 10, 'F');
    pdf.setTextColor(...DARK);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text(title, MARGIN + 6, y + 7);
    y += 14;
  };

  const writeWrappedText = ({
    text,
    x,
    maxWidth,
    fontSize = 8.5,
    color = GRAY,
    lineHeight = 4.6,
    fontStyle = 'normal',
  }: {
    text: string;
    x: number;
    maxWidth: number;
    fontSize?: number;
    color?: RGB;
    lineHeight?: number;
    fontStyle?: 'normal' | 'bold';
  }) => {
    pdf.setTextColor(...color);
    pdf.setFontSize(fontSize);
    pdf.setFont('helvetica', fontStyle);
    const lines = pdf.splitTextToSize(text || '-', maxWidth);

    lines.forEach((line: string) => {
      checkPage(lineHeight + 1);
      pdf.text(line, x, y);
      y += lineHeight;
    });
  };

  const drawPackageTable = (table: PackageInfoTable) => {
    const columns = table.columns.length > 0 ? table.columns : ['Details'];
    const rows = table.rows.filter((row: string[]) => row.some(Boolean));
    const colCount = columns.length;
    const colW = CONTENT_W / colCount;
    const cellPad = 2;
    const headerFontSize = colCount > 6 ? 6 : 7.2;
    const bodyFontSize = colCount > 6 ? 6 : 7.5;
    const lineHeight = colCount > 6 ? 3.3 : 3.8;

    const drawHeader = () => {
      checkPage(12);
      pdf.setDrawColor(156, 163, 175);
      pdf.setLineWidth(0.25);

      columns.forEach((column, columnIndex) => {
        const x = MARGIN + columnIndex * colW;
        pdf.rect(x, y, colW, 9, 'S');
        pdf.setTextColor(...DARK);
        pdf.setFontSize(headerFontSize);
        pdf.setFont('helvetica', 'bold');
        const lines = pdf.splitTextToSize(column || `Column ${columnIndex + 1}`, colW - cellPad * 2);
        pdf.text(lines.slice(0, 2), x + cellPad, y + 3.4);
      });

      y += 9;
    };

    if (table.title) {
      checkPage(12);
      pdf.setTextColor(...DARK);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text(table.title, MARGIN, y);
      y += 6;
    }

    if (table.notes) {
      writeWrappedText({
        text: table.notes,
        x: MARGIN,
        maxWidth: CONTENT_W,
        fontSize: 8,
        lineHeight: 4.2,
      });
      y += 2;
    }

    if (rows.length === 0) {
      y += 4;
      return;
    }

    drawHeader();

    rows.forEach((row: string[], rowIndex: number) => {
      pdf.setFontSize(bodyFontSize);
      pdf.setFont('helvetica', 'normal');

      const cellLines: string[][] = columns.map((_, columnIndex) =>
        pdf.splitTextToSize(row[columnIndex] || '-', colW - cellPad * 2)
      );
      const rowH = Math.max(8, Math.max(...cellLines.map((lines: string[]) => lines.length)) * lineHeight + 4);

      if (y + rowH > PAGE_H - 18) {
        pdf.addPage();
        y = MARGIN;
        drawHeader();
      }

      pdf.setDrawColor(156, 163, 175);
      pdf.setLineWidth(0.25);

      columns.forEach((_, columnIndex) => {
        const x = MARGIN + columnIndex * colW;
        pdf.rect(x, y, colW, rowH, 'S');
        pdf.setTextColor(...DARK);
        pdf.setFontSize(bodyFontSize);
        pdf.setFont('helvetica', 'normal');
        pdf.text(cellLines[columnIndex], x + cellPad, y + 4);
      });

      y += rowH;
    });

    y += 8;
  };

  // ── HEADER BAR ──────────────────────────────────────────────────────────────
  pdf.setFillColor(...WHITE);
  pdf.rect(0, 0, PAGE_W, 38, 'F');
  // Bottom border line on header
  pdf.setDrawColor(...BLUE);
  pdf.setLineWidth(0.5);
  pdf.line(0, 38, PAGE_W, 38);

  // Logo
  try {
    const res = await fetch('/logo.png');
    const blob = await res.blob();
    const dataUrl = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
    pdf.addImage(dataUrl, 'PNG', MARGIN, 6, 36, 26);
  } catch {
    pdf.setTextColor(...DARK);
    pdf.setFontSize(13);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Naasir Travel', MARGIN, 22);
  }

  pdf.setTextColor(...DARK);
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.text('naasirtravel.com', PAGE_W - MARGIN, 18, { align: 'right' });
  pdf.text('+1 (888) 662-7467', PAGE_W - MARGIN, 26, { align: 'right' });

  y = 48;

  // ── TITLE ───────────────────────────────────────────────────────────────────
  pdf.setTextColor(...DARK);
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  const titleLines = pdf.splitTextToSize(tour.title, CONTENT_W);
  pdf.text(titleLines, MARGIN, y);
  y += titleLines.length * 8 + 2;

  pdf.setDrawColor(...ORANGE);
  pdf.setLineWidth(0.8);
  pdf.line(MARGIN, y, MARGIN + 55, y);
  y += 8;

  // ── DETAILS GRID ────────────────────────────────────────────────────────────
  const details: { label: string; value: string }[] = [
    { label: 'DATES',         value: tour.dates },
    { label: 'ACCOMMODATION', value: tour.accommodation },
    ...(tour.departure ? [{ label: 'DEPARTURE', value: tour.departure }] : []),
    { label: 'CATEGORY',      value: tour.category },
  ];

  const rows = Math.ceil(details.length / 2);
  const boxH = rows * 10 + 6;
  pdf.setFillColor(...LGRAY);
  pdf.roundedRect(MARGIN, y, CONTENT_W, boxH, 2, 2, 'F');

  const colW = CONTENT_W / 2;
  details.forEach((d, i) => {
    const cx = MARGIN + 5 + (i % 2) * colW;
    const cy = y + 5 + Math.floor(i / 2) * 10;
    pdf.setTextColor(...GRAY);
    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'bold');
    pdf.text(d.label, cx, cy);
    pdf.setTextColor(...DARK);
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    const valLines = pdf.splitTextToSize(d.value || '-', colW - 8);
    pdf.text(valLines[0], cx, cy + 4.5);
  });

  y += boxH + 10;

  // ── DESCRIPTION ─────────────────────────────────────────────────────────────
  if (tour.description) {
    sectionHeader('About This Package');
    const plain = stripHtml(tour.description).replace(/\n{3,}/g, '\n\n').trim();
    pdf.setTextColor(...GRAY);
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    const lines = pdf.splitTextToSize(plain, CONTENT_W);
    lines.forEach((line: string) => {
      checkPage(6);
      pdf.text(line, MARGIN, y);
      y += 5;
    });
    y += 5;
  }

  const infoTables = normalizePackageInfoTables(tour.infoTables || [])
    .filter(packageInfoTableHasContent)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  if (infoTables.length > 0) {
    sectionHeader('Package Details & Options');
    infoTables.forEach(drawPackageTable);
  }

  // ── INCLUSIONS ──────────────────────────────────────────────────────────────
  if (tour.inclusions && tour.inclusions.length > 0) {
    sectionHeader('Inclusions', BLUE);
    tour.inclusions.forEach((item) => {
      checkPage(10);
      pdf.setFillColor(...GREEN);
      pdf.circle(MARGIN + 2, y - 1, 1.8, 'F');
      pdf.setTextColor(...DARK);
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      const itemLines = pdf.splitTextToSize(item, CONTENT_W - 9);
      itemLines.forEach((l: string, li: number) => {
        checkPage(6);
        pdf.text(l, MARGIN + 7, y + li * 5);
      });
      y += itemLines.length * 5 + 2;
    });
    y += 4;
  }

  // ── EXCLUSIONS ──────────────────────────────────────────────────────────────
  if (tour.exclusions && tour.exclusions.length > 0) {
    sectionHeader('Exclusions', ORANGE);
    tour.exclusions.forEach((item) => {
      checkPage(10);
      pdf.setFillColor(...RED);
      pdf.circle(MARGIN + 2, y - 1, 1.8, 'F');
      pdf.setTextColor(...DARK);
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      const itemLines = pdf.splitTextToSize(item, CONTENT_W - 9);
      itemLines.forEach((l: string, li: number) => {
        checkPage(6);
        pdf.text(l, MARGIN + 7, y + li * 5);
      });
      y += itemLines.length * 5 + 2;
    });
    y += 4;
  }

  // ── ITINERARY ───────────────────────────────────────────────────────────────
  if (tour.itinerary && tour.itinerary.length > 0) {
    sectionHeader('Day-by-Day Itinerary');
    tour.itinerary.forEach((day) => {
      checkPage(22);
      // Day badge
      pdf.setFillColor(...BLUE);
      pdf.roundedRect(MARGIN, y - 1, 18, 7, 1, 1, 'F');
      pdf.setTextColor(...WHITE);
      pdf.setFontSize(7.5);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`Day ${day.day}`, MARGIN + 9, y + 3.5, { align: 'center' });
      // Title
      pdf.setTextColor(...DARK);
      pdf.setFontSize(9.5);
      pdf.setFont('helvetica', 'bold');
      const titleW = CONTENT_W - 22;
      const dayTitleLines = pdf.splitTextToSize(day.title, titleW);
      pdf.text(dayTitleLines[0], MARGIN + 22, y + 3.5);
      y += 10;
      // Description
      pdf.setTextColor(...GRAY);
      pdf.setFontSize(8.5);
      pdf.setFont('helvetica', 'normal');
      const descLines = pdf.splitTextToSize(day.description, CONTENT_W - 4);
      descLines.forEach((l: string) => {
        checkPage(6);
        pdf.text(l, MARGIN + 4, y);
        y += 4.8;
      });
      y += 4;
    });
  }

  // ── FOOTER ON ALL PAGES ─────────────────────────────────────────────────────
  const totalPages = (pdf as any).internal.getNumberOfPages() as number;
  for (let p = 1; p <= totalPages; p++) {
    pdf.setPage(p);
    pdf.setFillColor(...BLUE);
    pdf.rect(0, PAGE_H - 14, PAGE_W, 14, 'F');
    pdf.setTextColor(...WHITE);
    pdf.setFontSize(7.5);
    pdf.setFont('helvetica', 'normal');
    pdf.text(
      'Naasir Travel  |  naasirtravel.com  |  +1 (888) 662-7467  |  Richmond, BC, Canada',
      PAGE_W / 2, PAGE_H - 6, { align: 'center' }
    );
    pdf.text(`Page ${p} of ${totalPages}`, PAGE_W - MARGIN, PAGE_H - 6, { align: 'right' });
  }

  const filename = `${tour.title.replace(/[^a-zA-Z0-9]/g, '-').replace(/-+/g, '-').toLowerCase()}-itinerary.pdf`;
  pdf.save(filename);
}
