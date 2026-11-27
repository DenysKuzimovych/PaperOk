/**
 * Imposition (раскладка) math for gang-printing cards on a sheet.
 * All dimensions in millimetres; cell coordinates from the TOP-LEFT of the sheet.
 */

export type SheetId = "A3" | "A4";

export const SHEETS: Record<SheetId, { w: number; h: number; label: string }> = {
  A3: { w: 420, h: 297, label: "A3 — 420 × 297 мм" },
  A4: { w: 297, h: 210, label: "A4 — 297 × 210 мм" },
};

export type Cell = {
  /** mm from the left edge of the sheet */
  x: number;
  /** mm from the top edge of the sheet */
  y: number;
  /** placed width in mm (cellH when rotated) */
  w: number;
  /** placed height in mm */
  h: number;
  /** true when the card is rotated 90° */
  rotated: boolean;
};

export type Layout = {
  cells: Cell[];
  count: number;
  /** human description, e.g. "4 × 2" or "смес." */
  description: string;
};

/** How the card may sit on the sheet. */
export type CardOrientation = "auto" | "upright" | "rotated";

type LayoutInput = {
  sheetW: number;
  sheetH: number;
  /** trim + 2 × bleed */
  cellW: number;
  cellH: number;
  marginX: number;
  marginY: number;
  allowMixed: boolean;
  /** default "auto" — pick whichever fits most */
  orientation?: CardOrientation;
};

function buildGrid(
  originX: number,
  originY: number,
  cols: number,
  rows: number,
  w: number,
  h: number,
  rotated: boolean,
): Cell[] {
  const cells: Cell[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      cells.push({ x: originX + c * w, y: originY + r * h, w, h, rotated });
    }
  }
  return cells;
}

function boundsOf(cells: Cell[]): { w: number; h: number } {
  let maxX = 0;
  let maxY = 0;
  for (const cell of cells) {
    if (cell.x + cell.w > maxX) maxX = cell.x + cell.w;
    if (cell.y + cell.h > maxY) maxY = cell.y + cell.h;
  }
  return { w: maxX, h: maxY };
}

export function computeLayout(input: LayoutInput): Layout {
  const { sheetW, sheetH, cellW, cellH, marginX, marginY, allowMixed } = input;
  const orientation: CardOrientation = input.orientation ?? "auto";
  const uw = sheetW - 2 * marginX;
  const uh = sheetH - 2 * marginY;

  type Candidate = { cells: Cell[]; description: string };
  const candidates: Candidate[] = [];

  // Plain grids (origin 0,0 inside usable area; centred later)
  const colsA = Math.floor(uw / cellW);
  const rowsA = Math.floor(uh / cellH);
  if (orientation !== "rotated" && colsA > 0 && rowsA > 0) {
    candidates.push({
      cells: buildGrid(0, 0, colsA, rowsA, cellW, cellH, false),
      description: `${colsA} × ${rowsA}`,
    });
  }
  const colsB = Math.floor(uw / cellH);
  const rowsB = Math.floor(uh / cellW);
  if (orientation !== "upright" && colsB > 0 && rowsB > 0) {
    candidates.push({
      cells: buildGrid(0, 0, colsB, rowsB, cellH, cellW, true),
      description: `${colsB} × ${rowsB} (завъртяно)`,
    });
  }

  if (allowMixed && orientation === "auto") {
    // k rows of upright cells on top, leftover strip filled with rotated cells
    for (let k = 1; k <= rowsA; k++) {
      const used = k * cellH;
      const c2 = Math.floor(uw / cellH);
      const r2 = Math.floor((uh - used) / cellW);
      if (c2 > 0 && r2 > 0) {
        const cells = buildGrid(0, 0, colsA, k, cellW, cellH, false).concat(
          buildGrid(0, used, c2, r2, cellH, cellW, true),
        );
        candidates.push({ cells, description: "смесена" });
      }
    }
    // k columns of upright cells on the left, leftover filled with rotated
    for (let k = 1; k <= colsA; k++) {
      const used = k * cellW;
      const c2 = Math.floor((uw - used) / cellH);
      const r2 = Math.floor(uh / cellW);
      if (c2 > 0 && r2 > 0) {
        const cells = buildGrid(0, 0, k, rowsA, cellW, cellH, false).concat(
          buildGrid(used, 0, c2, r2, cellH, cellW, true),
        );
        candidates.push({ cells, description: "смесена" });
      }
    }
    // the same two splits with the rotated orientation as the base
    for (let k = 1; k <= rowsB; k++) {
      const used = k * cellW;
      const c2 = Math.floor(uw / cellW);
      const r2 = Math.floor((uh - used) / cellH);
      if (c2 > 0 && r2 > 0) {
        const cells = buildGrid(0, 0, colsB, k, cellH, cellW, true).concat(
          buildGrid(0, used, c2, r2, cellW, cellH, false),
        );
        candidates.push({ cells, description: "смесена" });
      }
    }
    for (let k = 1; k <= colsB; k++) {
      const used = k * cellH;
      const c2 = Math.floor((uw - used) / cellW);
      const r2 = Math.floor(uh / cellH);
      if (c2 > 0 && r2 > 0) {
        const cells = buildGrid(0, 0, k, rowsB, cellH, cellW, true).concat(
          buildGrid(used, 0, c2, r2, cellW, cellH, false),
        );
        candidates.push({ cells, description: "смесена" });
      }
    }
  }

  let best: Candidate | null = null;
  for (const cand of candidates) {
    if (!best || cand.cells.length > best.cells.length) best = cand;
  }
  if (!best) {
    return { cells: [], count: 0, description: "не се побира" };
  }

  // Centre the used block inside the sheet
  const bb = boundsOf(best.cells);
  const dx = marginX + (uw - bb.w) / 2;
  const dy = marginY + (uh - bb.h) / 2;
  const cells = best.cells
    .map((c) => ({ ...c, x: c.x + dx, y: c.y + dy }))
    .sort((a, b) => (Math.abs(a.y - b.y) > 0.01 ? a.y - b.y : a.x - b.x));

  return { cells, count: cells.length, description: best.description };
}

/** Mirror the cells for the back side of a duplex sheet. */
export function mirrorCells(
  cells: Cell[],
  sheetW: number,
  sheetH: number,
  axis: "x" | "y",
): Cell[] {
  return cells.map((c) =>
    axis === "x"
      ? { ...c, x: sheetW - c.x - c.w }
      : { ...c, y: sheetH - c.y - c.h },
  );
}

export const MM_TO_PT = 72 / 25.4;
