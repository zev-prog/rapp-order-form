import { jsPDF } from "jspdf";
import { CUSTOM } from "./catalogue";
import type { FillLine, LineItem, Project, RoomOrder } from "./types";

function sizeLabel(size: string, customSize: string): string {
  if (size === CUSTOM) return customSize.trim() || "Custom";
  return size;
}

function lineText(line: LineItem): string {
  return `${line.qty} × ${sizeLabel(line.size, line.customSize)}`;
}

function fillText(line: FillLine): string {
  const fill = line.fill === "down" ? "Down" : "Synthetic";
  return `${line.qty} × ${fill} · ${sizeLabel(line.size, line.customSize)}`;
}

function slug(name: string): string {
  const s = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return s || "order";
}

function addWrapped(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
): number {
  const lines = doc.splitTextToSize(text, maxWidth) as string[];
  for (const line of lines) {
    if (y > 280) {
      doc.addPage();
      y = 20;
    }
    doc.text(line, x, y);
    y += lineHeight;
  }
  return y;
}

function ensureSpace(doc: jsPDF, y: number, need: number): number {
  if (y + need > 280) {
    doc.addPage();
    return 20;
  }
  return y;
}

function writeRoom(doc: jsPDF, room: RoomOrder, y: number): number {
  const left = 20;
  const maxW = 170;

  y = ensureSpace(doc, y, 20);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(58, 52, 41);
  y = addWrapped(doc, room.name || "Room", left, y, maxW, 6);
  y += 2;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(80, 72, 60);

  if (room.style.trim()) {
    y = addWrapped(doc, `Style: ${room.style.trim()}`, left, y, maxW, 5);
  }

  y = addWrapped(
    doc,
    `Bed: ${room.bedQty} × ${sizeLabel(room.bedSize, room.customBedSize)}`,
    left,
    y,
    maxW,
    5
  );

  const writeGroup = (title: string, items: string[]) => {
    if (!items.length) return;
    y = ensureSpace(doc, y, 10);
    doc.setFont("helvetica", "bold");
    y = addWrapped(doc, title, left, y, maxW, 5);
    doc.setFont("helvetica", "normal");
    for (const item of items) {
      y = addWrapped(doc, `  • ${item}`, left, y, maxW, 5);
    }
  };

  writeGroup(
    "Pillow cases",
    room.pillowCases.filter((l) => l.qty > 0).map(lineText)
  );
  writeGroup(
    "Fitted sheets",
    room.fittedSheets.filter((l) => l.qty > 0).map(lineText)
  );
  writeGroup(
    "Duvet covers",
    room.duvets.filter((l) => l.qty > 0).map(lineText)
  );
  writeGroup(
    "Pillow fills",
    room.pillowFills.filter((l) => l.qty > 0).map(fillText)
  );
  writeGroup(
    "Duvet fills",
    room.duvetFills.filter((l) => l.qty > 0).map(fillText)
  );

  const options: string[] = [];
  if (room.mattressProtector && room.mattressProtectorQty > 0) {
    options.push(`Mattress protector × ${room.mattressProtectorQty}`);
  }
  if (room.pillowProtector && room.pillowProtectorQty > 0) {
    options.push(`Pillow protector × ${room.pillowProtectorQty}`);
  }
  writeGroup("Options", options);

  if (room.notes.trim()) {
    y = ensureSpace(doc, y, 10);
    doc.setFont("helvetica", "bold");
    y = addWrapped(doc, "Room notes", left, y, maxW, 5);
    doc.setFont("helvetica", "normal");
    y = addWrapped(doc, room.notes.trim(), left + 2, y, maxW - 2, 5);
  }

  y += 6;
  doc.setDrawColor(200, 190, 175);
  doc.line(left, y, left + maxW, y);
  y += 8;
  return y;
}

export function downloadProjectPdf(project: Project): void {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const left = 20;
  const maxW = 170;
  let y = 20;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(154, 123, 79);
  doc.text("RAPP COLLECTIONS", left, y);
  y += 8;

  doc.setFontSize(18);
  doc.setTextColor(58, 52, 41);
  doc.text("Order form", left, y);
  y += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(80, 72, 60);
  const date = new Date().toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  y = addWrapped(
    doc,
    `Project: ${project.name.trim() || "Untitled"}`,
    left,
    y,
    maxW,
    5
  );
  y = addWrapped(doc, `Date: ${date}`, left, y, maxW, 5);
  y += 4;

  doc.setDrawColor(201, 169, 98);
  doc.setLineWidth(0.4);
  doc.line(left, y, left + maxW, y);
  y += 10;

  for (const room of project.rooms) {
    y = writeRoom(doc, room, y);
  }

  if (project.notes.trim()) {
    y = ensureSpace(doc, y, 16);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(58, 52, 41);
    y = addWrapped(doc, "Additional notes", left, y, maxW, 6);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(80, 72, 60);
    y = addWrapped(doc, project.notes.trim(), left, y, maxW, 5);
  }

  const filename = `rapp-order-${slug(project.name)}-${date.replace(/[^0-9a-z]+/gi, "-").toLowerCase()}.pdf`;
  doc.save(filename);
}
