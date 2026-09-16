import { jsPDF } from "jspdf";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outPath = join(__dirname, "../public/rapp-blank-order-form.pdf");

const BED = [
  'Twin 38"',
  '48"',
  'Full 54"',
  'Queen 60"',
  'King 76"',
  "90×190",
  "90×200",
  "100×200",
  "120×200",
  "140×200",
  "160×200",
  "180×200",
  "200×200",
];
const FITTED = [
  'Twin 38"',
  '48"',
  'Full 54"',
  'Queen 60"',
  'King 76"',
  "90×190",
  "100×200",
  "120×200",
  "140×200",
  "160×200",
  "180×200",
];
const PILLOW = [
  '50×70 (20×26")',
  '66×66 (26×26")',
  '30×51 (12×20")',
  "50×80",
  "60×90",
];
const DUVET = [
  "Queen 240×230",
  "King 270×240",
  "140×200",
  "150×200",
  "160×200",
  "200×220",
  "240×220",
];

const GOLD = [154, 123, 79];
const INK = [26, 26, 26];
const MUTED = [85, 85, 85];

function makePdf() {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = 210;
  const margin = 12;
  const contentW = pageW - margin * 2;
  let y = margin;

  const ensure = (need) => {
    if (y + need > 287) {
      doc.addPage();
      y = margin;
    }
  };

  const blankField = (label, x, width, yy) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...MUTED);
    doc.text(label.toUpperCase(), x, yy);
    const labelW = doc.getTextWidth(label.toUpperCase()) + 2;
    doc.setDrawColor(34, 34, 34);
    doc.setLineWidth(0.25);
    doc.line(x + labelW, yy + 0.5, x + width, yy + 0.5);
  };

  const circleChip = (text, x, yy) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    const padX = 2.2;
    const h = 5.2;
    const w = doc.getTextWidth(text) + padX * 2;
    doc.setDrawColor(34, 34, 34);
    doc.setLineWidth(0.3);
    doc.roundedRect(x, yy, w, h, h / 2, h / 2, "S");
    doc.setTextColor(...INK);
    doc.text(text, x + padX, yy + 3.5);
    return w + 1.6;
  };

  const circleRow = (title, options) => {
    ensure(22);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(...GOLD);
    doc.text(title.toUpperCase(), margin, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text("Qty", pageW - margin - 22, y);
    doc.rect(pageW - margin - 16, y - 3.2, 16, 4.5);
    y += 3.5;
    doc.setFontSize(6.5);
    doc.setTextColor(136, 136, 136);
    doc.text("Circle size", margin, y);
    y += 2.5;

    let x = margin;
    const rowH = 6.2;
    for (const opt of [...options, "Other ________"]) {
      doc.setFontSize(7);
      const chipW = doc.getTextWidth(opt) + 4.4 + 1.6;
      if (x + chipW > pageW - margin) {
        x = margin;
        y += rowH;
        ensure(rowH + 2);
      }
      circleChip(opt, x, y);
      x += chipW;
    }
    y += rowH + 2;
  };

  const roomBlock = (index) => {
    ensure(95);
    const startY = y;
    // estimate height roughly; draw border after content using a second pass is hard —
    // draw light border as we go with a fixed min box via roundedRect after measuring.

    doc.setFont("times", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...INK);
    doc.text(`Room ${index}`, margin + 2, y + 5);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text("Name ________________________", margin + 28, y + 5);
    y += 10;

    const colW = (contentW - 8) / 3;
    blankField("Style", margin + 2, colW - 2, y);
    blankField("Color", margin + 2 + colW + 4, colW - 2, y);
    blankField("Thread", margin + 2 + (colW + 4) * 2, colW - 2, y);
    y += 7;

    circleRow("Bed size", BED);
    circleRow("Pillow cases", PILLOW);
    circleRow("Fitted sheet", FITTED);
    circleRow("Duvet cover", DUVET);

    const half = (contentW - 6) / 2;
    blankField("Type of pillow", margin + 2, half, y);
    blankField("Type of duvet", margin + 2 + half + 6, half, y);
    y += 7;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...INK);
    doc.text("☐  Mattress protector    Qty ____", margin + 2, y);
    doc.text("☐  Pillow protector    Qty ____", margin + 95, y);
    y += 6;

    doc.setFontSize(7);
    doc.setTextColor(...MUTED);
    doc.text("NOTES", margin + 2, y);
    y += 2;
    doc.setDrawColor(153, 153, 153);
    doc.setLineWidth(0.2);
    for (let i = 0; i < 2; i++) {
      y += 5;
      doc.line(margin + 2, y, pageW - margin - 2, y);
    }
    y += 4;

    // border around room
    doc.setDrawColor(187, 187, 187);
    doc.setLineWidth(0.3);
    doc.rect(margin, startY, contentW, y - startY);
    y += 5;
  };

  // Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...GOLD);
  doc.text("RAPP COLLECTIONS", margin, y);
  y += 7;
  doc.setFont("times", "bold");
  doc.setFontSize(18);
  doc.setTextColor(...INK);
  doc.text("Order form", margin, y);
  y += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  doc.text("CIRCLE SIZES  ·  FILL IN BLANKS", margin, y);
  y += 4;
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageW - margin, y);
  y += 8;

  const metaW = contentW / 3 - 2;
  blankField("Project", margin, metaW, y);
  blankField("Date", margin + metaW + 4, metaW * 0.7, y);
  blankField("Client", margin + metaW + 4 + metaW * 0.7 + 4, metaW, y);
  y += 10;

  roomBlock(1);
  roomBlock(2);

  ensure(40);
  doc.setFont("times", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...INK);
  doc.text("Additional notes", margin, y);
  y += 3;
  doc.setDrawColor(153, 153, 153);
  for (let i = 0; i < 3; i++) {
    y += 6;
    doc.line(margin, y, pageW - margin, y);
  }
  y += 12;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...MUTED);
  doc.text("CLIENT SIGNATURE", margin, y);
  doc.text("DATE", pageW / 2 + 5, y);
  y += 12;
  doc.setDrawColor(34, 34, 34);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageW / 2 - 5, y);
  doc.line(pageW / 2 + 5, y, pageW - margin, y);

  return doc;
}

const doc = makePdf();
mkdirSync(dirname(outPath), { recursive: true });
const buf = Buffer.from(doc.output("arraybuffer"));
writeFileSync(outPath, buf);
console.log("Wrote", outPath);
