export type FillType = "none" | "synthetic" | "down";
export type ActiveFill = "synthetic" | "down";

export type LineItem = {
  id: string;
  qty: number;
  size: string;
  customSize: string;
};

export type FillLine = LineItem & {
  fill: ActiveFill;
};

/** @deprecated alias — same as FillLine */
export type PillowFillLine = FillLine;

export type RoomOrder = {
  id: string;
  name: string;
  open: boolean;
  style: string;
  bedSize: string;
  customBedSize: string;
  bedQty: number;
  pillowCases: LineItem[];
  fittedSheets: LineItem[];
  duvets: LineItem[];
  pillowFills: FillLine[];
  duvetFills: FillLine[];
  mattressProtector: boolean;
  mattressProtectorQty: number;
  pillowProtector: boolean;
  pillowProtectorQty: number;
  notes: string;
};

export type Project = {
  name: string;
  notes: string;
  rooms: RoomOrder[];
};

export function newId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function emptyLine(defaultSize = "", qty = 1): LineItem {
  return {
    id: newId(),
    qty,
    size: defaultSize,
    customSize: "",
  };
}

export function emptyFillLine(
  defaultSize = "",
  qty = 1,
  fill: ActiveFill = "synthetic"
): FillLine {
  return {
    ...emptyLine(defaultSize, qty),
    fill,
  };
}

export function emptyPillowFill(
  defaultSize = "",
  qty = 2,
  fill: ActiveFill = "synthetic"
): FillLine {
  return emptyFillLine(defaultSize, qty, fill);
}

const DEFAULT_BED = '152 × 203 cm (Queen 60")';
const DEFAULT_FITTED = '152 × 203 · H30 cm (Queen 60")';
const DEFAULT_DUVET = "240 × 230 cm (Queen)";
const DEFAULT_PILLOW = '50 × 70 cm (20" × 26")';

export function emptyRoom(index: number): RoomOrder {
  return {
    id: newId(),
    name: `Room ${index}`,
    open: true,
    style: "",
    bedSize: DEFAULT_BED,
    customBedSize: "",
    bedQty: 1,
    pillowCases: [emptyLine(DEFAULT_PILLOW, 2)],
    fittedSheets: [emptyLine(DEFAULT_FITTED, 1)],
    duvets: [emptyLine(DEFAULT_DUVET, 1)],
    pillowFills: [],
    duvetFills: [],
    mattressProtector: false,
    mattressProtectorQty: 0,
    pillowProtector: false,
    pillowProtectorQty: 0,
    notes: "",
  };
}

export function emptyProject(): Project {
  return {
    name: "",
    notes: "",
    rooms: [emptyRoom(1)],
  };
}

function parseFillLines(
  raw: unknown,
  fallbackSize: string,
  fallbackQty: number
): FillLine[] {
  if (!Array.isArray(raw) || !raw.length) return [];
  return raw.map((row) => {
    const r = row as Record<string, unknown>;
    return {
      id: typeof r.id === "string" ? r.id : newId(),
      fill: r.fill === "down" ? "down" : "synthetic",
      qty: typeof r.qty === "number" ? r.qty : fallbackQty,
      size: typeof r.size === "string" ? r.size : fallbackSize,
      customSize: typeof r.customSize === "string" ? r.customSize : "",
    };
  });
}

/** Normalize older localStorage shapes into current model. */
export function normalizeRoom(raw: Record<string, unknown>, index: number): RoomOrder {
  const base = emptyRoom(index);
  const asLine = (v: unknown, fallbackSize: string, fallbackQty: number): LineItem[] => {
    if (Array.isArray(v) && v.length) {
      return v.map((row) => {
        const r = row as Record<string, unknown>;
        return {
          id: typeof r.id === "string" ? r.id : newId(),
          qty: typeof r.qty === "number" ? r.qty : fallbackQty,
          size: typeof r.size === "string" ? r.size : fallbackSize,
          customSize: typeof r.customSize === "string" ? r.customSize : "",
        };
      });
    }
    if (v && typeof v === "object") {
      const r = v as Record<string, unknown>;
      return [
        {
          id: newId(),
          qty: typeof r.qty === "number" ? r.qty : fallbackQty,
          size: typeof r.size === "string" ? r.size : fallbackSize,
          customSize: typeof r.customSize === "string" ? r.customSize : "",
        },
      ];
    }
    return [emptyLine(fallbackSize, fallbackQty)];
  };

  const pillowCases = asLine(raw.pillowCases, DEFAULT_PILLOW, 2);
  const duvets = asLine(raw.duvets ?? raw.duvet, DEFAULT_DUVET, 1);
  const defaultPillowSize = pillowCases[0]?.size || DEFAULT_PILLOW;
  const defaultDuvetSize = duvets[0]?.size || DEFAULT_DUVET;

  let pillowFills = parseFillLines(raw.pillowFills, defaultPillowSize, 2);
  if (!pillowFills.length && raw.pillowFill && raw.pillowFill !== "none") {
    pillowFills = [
      {
        id: newId(),
        fill: raw.pillowFill === "down" ? "down" : "synthetic",
        qty: typeof raw.pillowFillQty === "number" ? raw.pillowFillQty : 2,
        size:
          typeof raw.pillowFillSize === "string" && raw.pillowFillSize
            ? raw.pillowFillSize
            : defaultPillowSize,
        customSize:
          typeof raw.pillowFillCustomSize === "string" ? raw.pillowFillCustomSize : "",
      },
    ];
  }

  let duvetFills = parseFillLines(raw.duvetFills, defaultDuvetSize, 1);
  if (!duvetFills.length && raw.duvetFill && raw.duvetFill !== "none") {
    duvetFills = [
      {
        id: newId(),
        fill: raw.duvetFill === "down" ? "down" : "synthetic",
        qty:
          typeof raw.duvetFillQty === "number"
            ? raw.duvetFillQty
            : duvets.reduce((s, l) => s + l.qty, 0) || 1,
        size: defaultDuvetSize,
        customSize: "",
      },
    ];
  }

  return {
    ...base,
    id: typeof raw.id === "string" ? raw.id : base.id,
    name: typeof raw.name === "string" ? raw.name : base.name,
    open: typeof raw.open === "boolean" ? raw.open : true,
    style: typeof raw.style === "string" ? raw.style : "",
    bedSize: typeof raw.bedSize === "string" ? raw.bedSize : base.bedSize,
    customBedSize: typeof raw.customBedSize === "string" ? raw.customBedSize : "",
    bedQty: typeof raw.bedQty === "number" ? raw.bedQty : 1,
    pillowCases,
    fittedSheets: asLine(
      raw.fittedSheets ?? raw.fittedSheet,
      DEFAULT_FITTED,
      1
    ),
    duvets,
    pillowFills,
    duvetFills,
    mattressProtector: Boolean(raw.mattressProtector),
    mattressProtectorQty:
      typeof raw.mattressProtectorQty === "number" ? raw.mattressProtectorQty : 0,
    pillowProtector: Boolean(raw.pillowProtector),
    pillowProtectorQty:
      typeof raw.pillowProtectorQty === "number" ? raw.pillowProtectorQty : 0,
    notes: typeof raw.notes === "string" ? raw.notes : "",
  };
}
