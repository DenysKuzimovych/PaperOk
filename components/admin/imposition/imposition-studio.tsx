"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  SHEETS,
  type SheetId,
  type Cell,
  type CardOrientation,
  computeLayout,
  mirrorCells,
  MM_TO_PT,
} from "lib/imposition";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

type FitMode = "cover" | "contain";

type Item = {
  id: string;
  name: string;
  img: HTMLImageElement;
  back: HTMLImageElement | null;
  count: number;
  fit: FitMode;
};

const PRESETS: Array<{ label: string; w: number; h: number }> = [
  { label: "50 × 70 мм", w: 50, h: 70 },
  { label: "56 × 50 мм", w: 56, h: 50 },
  { label: "70 × 65 мм", w: 70, h: 65 },
  { label: "90 × 50 мм (визитка)", w: 90, h: 50 },
  { label: "65 × 95 мм", w: 65, h: 95 },
  { label: "100 × 95 мм", w: 100, h: 95 },
  { label: "143 × 65 мм", w: 143, h: 65 },
  { label: "100 × 143 мм (А6)", w: 100, h: 143 },
  { label: "120 × 120 мм", w: 120, h: 120 },
  { label: "140 × 200 мм", w: 140, h: 200 },
];

const RENDER_DPI = 300;
const PX_PER_MM = RENDER_DPI / 25.4;

/* ------------------------------------------------------------------ */
/* Image helpers                                                       */
/* ------------------------------------------------------------------ */

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`Не мога да прочета ${file.name}`));
    };
    img.src = url;
  });
}

function imageFromDataUrl(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Не мога да рендерирам PDF страницата"));
    img.src = src;
  });
}

/** Rasterise the first page of a PDF at ~600 dpi and return it as an image. */
async function loadPdfFirstPage(file: File): Promise<HTMLImageElement> {
  const pdfjs: any = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url,
  ).toString();
  const data = await file.arrayBuffer();
  const doc = await pdfjs.getDocument({ data }).promise;
  const page = await doc.getPage(1);
  const base = page.getViewport({ scale: 1 });
  // base is in CSS points (72 dpi) — scale up to 600 dpi, capped for memory
  const target = Math.min(600 / 72, 4000 / Math.max(base.width, base.height));
  const viewport = page.getViewport({ scale: Math.max(1, target) });
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(viewport.width);
  canvas.height = Math.round(viewport.height);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas недоступен");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  await page.render({ canvasContext: ctx, viewport, canvas }).promise;
  return imageFromDataUrl(canvas.toDataURL("image/png"));
}

async function loadAny(file: File): Promise<HTMLImageElement> {
  if (file.type === "application/pdf" || /\.pdf$/i.test(file.name)) {
    return loadPdfFirstPage(file);
  }
  return loadImage(file);
}

/** Source rectangle for drawing `img` into target w×h with the given fit. */
function fitRect(
  imgW: number,
  imgH: number,
  targetW: number,
  targetH: number,
  fit: FitMode,
): { sx: number; sy: number; sw: number; sh: number; dx: number; dy: number; dw: number; dh: number } {
  if (fit === "cover") {
    const scale = Math.max(targetW / imgW, targetH / imgH);
    const sw = targetW / scale;
    const sh = targetH / scale;
    return {
      sx: (imgW - sw) / 2,
      sy: (imgH - sh) / 2,
      sw,
      sh,
      dx: 0,
      dy: 0,
      dw: targetW,
      dh: targetH,
    };
  }
  const scale = Math.min(targetW / imgW, targetH / imgH);
  const dw = imgW * scale;
  const dh = imgH * scale;
  return {
    sx: 0,
    sy: 0,
    sw: imgW,
    sh: imgH,
    dx: (targetW - dw) / 2,
    dy: (targetH - dh) / 2,
    dw,
    dh,
  };
}

/**
 * Render an image into an upright cell canvas (wPx × hPx), then rotate the
 * whole canvas by `angle` (0 / 90 / 180 / 270 clockwise).
 */
function renderCellCanvas(
  img: HTMLImageElement,
  wPx: number,
  hPx: number,
  fit: FitMode,
  angle: number,
): HTMLCanvasElement {
  const base = document.createElement("canvas");
  base.width = Math.max(1, Math.round(wPx));
  base.height = Math.max(1, Math.round(hPx));
  const ctx = base.getContext("2d");
  if (!ctx) throw new Error("Canvas недоступен");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, base.width, base.height);
  ctx.imageSmoothingQuality = "high";
  const r = fitRect(img.naturalWidth, img.naturalHeight, base.width, base.height, fit);
  ctx.drawImage(img, r.sx, r.sy, r.sw, r.sh, r.dx, r.dy, r.dw, r.dh);

  const a = ((angle % 360) + 360) % 360;
  if (a === 0) return base;

  const out = document.createElement("canvas");
  if (a === 180) {
    out.width = base.width;
    out.height = base.height;
  } else {
    out.width = base.height;
    out.height = base.width;
  }
  const octx = out.getContext("2d");
  if (!octx) throw new Error("Canvas недоступен");
  octx.translate(out.width / 2, out.height / 2);
  octx.rotate((a * Math.PI) / 180);
  octx.drawImage(base, -base.width / 2, -base.height / 2);
  return out;
}

function canvasToJpeg(canvas: HTMLCanvasElement): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Не успях да създам JPEG"));
          return;
        }
        blob.arrayBuffer().then(resolve).catch(reject);
      },
      "image/jpeg",
      0.95,
    );
  });
}

function approxDpi(img: HTMLImageElement, trimW: number, trimH: number): number {
  const dpiW = img.naturalWidth / (trimW / 25.4);
  const dpiH = img.naturalHeight / (trimH / 25.4);
  return Math.round(Math.min(dpiW, dpiH));
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export function ImpositionStudio() {
  const [trimW, setTrimW] = useState(100);
  const [trimH, setTrimH] = useState(143);
  const [bleed, setBleed] = useState(2);
  const [sheetId, setSheetId] = useState<SheetId>("A3");
  const [portrait, setPortrait] = useState(false);
  const [cardOrientation, setCardOrientation] =
    useState<CardOrientation>("auto");
  const [marginX, setMarginX] = useState(2);
  const [marginY, setMarginY] = useState(1.5);
  const [allowMixed, setAllowMixed] = useState(false);
  const [dashedGrid, setDashedGrid] = useState(false);
  const [cropMarks, setCropMarks] = useState(true);
  const [duplex, setDuplex] = useState(false);
  const [mirrorAxis, setMirrorAxis] = useState<"x" | "y">("x");
  const [rotateBack, setRotateBack] = useState(false);
  const [fillLastSheet, setFillLastSheet] = useState(false);
  const [separateFiles, setSeparateFiles] = useState(false);
  const [singleSheet, setSingleSheet] = useState(true);
  const [items, setItems] = useState<Item[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewSheet, setPreviewSheet] = useState(0);
  const [previewSide, setPreviewSide] = useState<"front" | "back">("front");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const backInputFor = useRef<string | null>(null);
  const backFileRef = useRef<HTMLInputElement | null>(null);

  const sheet = SHEETS[sheetId];
  const sheetW = portrait ? sheet.h : sheet.w;
  const sheetH = portrait ? sheet.w : sheet.h;
  const cellW = trimW + 2 * bleed;
  const cellH = trimH + 2 * bleed;

  const layout = useMemo(
    () =>
      computeLayout({
        sheetW,
        sheetH,
        cellW,
        cellH,
        marginX,
        marginY,
        allowMixed,
        orientation: cardOrientation,
      }),
    [
      sheetW,
      sheetH,
      cellW,
      cellH,
      marginX,
      marginY,
      allowMixed,
      cardOrientation,
    ],
  );

  /** How many fit if the sheet were turned the other way — shown as a hint. */
  const altCount = useMemo(
    () =>
      computeLayout({
        sheetW: sheetH,
        sheetH: sheetW,
        cellW,
        cellH,
        marginX,
        marginY,
        allowMixed,
        orientation: cardOrientation,
      }).count,
    [
      sheetW,
      sheetH,
      cellW,
      cellH,
      marginX,
      marginY,
      allowMixed,
      cardOrientation,
    ],
  );

  /** Counts per card orientation, to label the buttons. */
  const orientationCounts = useMemo(() => {
    const base = {
      sheetW,
      sheetH,
      cellW,
      cellH,
      marginX,
      marginY,
      allowMixed: false,
    };
    return {
      upright: computeLayout({ ...base, orientation: "upright" }).count,
      rotated: computeLayout({ ...base, orientation: "rotated" }).count,
    };
  }, [sheetW, sheetH, cellW, cellH, marginX, marginY]);

  const perSheet = layout.count;

  /** Item index for every physical card, in printing order. */
  const sequence = useMemo(() => {
    const seq: number[] = [];
    if (items.length === 0) return seq;
    if (singleSheet) {
      // exactly one sheet, cycling through the designs
      for (let i = 0; i < perSheet; i++) {
        seq.push(i % items.length);
      }
      return seq;
    }
    items.forEach((item, idx) => {
      const n = Math.max(0, Math.floor(item.count));
      for (let i = 0; i < n; i++) seq.push(idx);
    });
    return seq;
  }, [items, singleSheet, perSheet]);
  const sheetCount = perSheet > 0 ? Math.ceil(sequence.length / perSheet) : 0;
  const emptyCells =
    perSheet > 0 && sequence.length > 0
      ? sheetCount * perSheet - sequence.length
      : 0;

  const filledSequence = useMemo(() => {
    if (!fillLastSheet || sequence.length === 0 || emptyCells === 0) return sequence;
    const seq = sequence.slice();
    for (let i = 0; i < emptyCells; i++) {
      const next = seq[i % sequence.length];
      if (next !== undefined) seq.push(next);
    }
    return seq;
  }, [sequence, emptyCells, fillLastSheet]);

  /* ----------------------------- files ----------------------------- */

  const addFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setError(null);
    try {
      const loaded: Item[] = [];
      for (const file of Array.from(files)) {
        const isPdf =
          file.type === "application/pdf" || /\.pdf$/i.test(file.name);
        if (!file.type.startsWith("image/") && !isPdf) {
          setError(
            `„${file.name}“ не се поддържа (приемаме JPG, PNG и PDF).`,
          );
          continue;
        }
        const img = await loadAny(file);
        loaded.push({
          id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          name: file.name,
          img,
          back: null,
          count: 1,
          fit: "cover",
        });
      }
      if (loaded.length > 0) setItems((prev) => [...prev, ...loaded]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Грешка при четене на файл");
    }
  }, []);

  const addBackFile = useCallback(async (files: FileList | null) => {
    const id = backInputFor.current;
    if (!files || files.length === 0 || !id) return;
    const file = files[0];
    if (!file) return;
    try {
      const img = await loadAny(file);
      setItems((prev) =>
        prev.map((it) => (it.id === id ? { ...it, back: img } : it)),
      );
    } catch {
      setError(`Не мога да прочета гърба: ${file.name}`);
    }
  }, []);

  const updateItem = (id: string, patch: Partial<Item>) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  /* ---------------------------- preview ---------------------------- */

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const scale = 2.2; // px per mm on screen
    canvas.width = Math.round(sheetW * scale);
    canvas.height = Math.round(sheetH * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const isBack = previewSide === "back";
    const cells =
      isBack && duplex
        ? mirrorCells(layout.cells, sheetW, sheetH, mirrorAxis)
        : layout.cells;
    const seq = filledSequence;
    const maxSheet = Math.max(0, sheetCount - 1);
    const sheetIdx = Math.min(previewSheet, maxSheet);

    cells.forEach((cell, i) => {
      const seqIdx = sheetIdx * perSheet + i;
      const itemIdx = seq[seqIdx];
      const item = itemIdx !== undefined ? items[itemIdx] : undefined;
      const x = cell.x * scale;
      const y = cell.y * scale;
      const w = cell.w * scale;
      const h = cell.h * scale;

      if (item) {
        const src = isBack ? item.back : item.img;
        if (src) {
          const angle = (cell.rotated ? 90 : 0) + (isBack && rotateBack ? 180 : 0);
          try {
            const cellCanvas = renderCellCanvas(
              src,
              (cell.rotated ? cell.h : cell.w) * scale,
              (cell.rotated ? cell.w : cell.h) * scale,
              item.fit,
              angle,
            );
            ctx.drawImage(cellCanvas, x, y, w, h);
          } catch {
            /* preview only */
          }
        } else if (isBack) {
          ctx.fillStyle = "#f3f4f6";
          ctx.fillRect(x, y, w, h);
        }
      }

      // cell boundary
      ctx.strokeStyle = "#d1d5db";
      ctx.setLineDash([4, 3]);
      ctx.strokeRect(x, y, w, h);
      ctx.setLineDash([]);
      // trim box
      ctx.strokeStyle = "#9ca3af";
      ctx.strokeRect(
        x + bleed * scale,
        y + bleed * scale,
        w - 2 * bleed * scale,
        h - 2 * bleed * scale,
      );
    });

    ctx.strokeStyle = "#111827";
    ctx.strokeRect(0, 0, canvas.width, canvas.height);
  }, [
    layout,
    items,
    filledSequence,
    sheetW,
    sheetH,
    bleed,
    perSheet,
    sheetCount,
    previewSheet,
    previewSide,
    duplex,
    mirrorAxis,
    rotateBack,
  ]);

  /* ------------------------------ PDF ------------------------------ */

  const generatePdf = async () => {
    if (perSheet === 0 || filledSequence.length === 0) return;
    setBusy(true);
    setError(null);
    try {
      const { PDFDocument, rgb } = await import("pdf-lib");
      type Doc = Awaited<ReturnType<typeof PDFDocument.create>>;
      type Embedded = Awaited<ReturnType<Doc["embedJpg"]>>;
      const black = rgb(0, 0, 0);
      const wPt = sheetW * MM_TO_PT;
      const hPt = sheetH * MM_TO_PT;
      const markLen = 1.8 * MM_TO_PT;
      const markOffset = bleed * MM_TO_PT;

      const getEmbedded = async (
        doc: Doc,
        imageCache: Map<string, Embedded>,
        item: Item,
        side: "front" | "back",
        rotated: boolean,
      ) => {
        const src = side === "back" ? item.back : item.img;
        if (!src) return null;
        const angle = (rotated ? 90 : 0) + (side === "back" && rotateBack ? 180 : 0);
        const key = `${item.id}|${side}|${angle}|${item.fit}|${cellW}x${cellH}`;
        const cached = imageCache.get(key);
        if (cached) return cached;
        const canvas = renderCellCanvas(
          src,
          cellW * PX_PER_MM,
          cellH * PX_PER_MM,
          item.fit,
          angle,
        );
        const bytes = await canvasToJpeg(canvas);
        const embedded = await doc.embedJpg(bytes);
        imageCache.set(key, embedded);
        return embedded;
      };

      const drawSheet = async (
        doc: Doc,
        imageCache: Map<string, Embedded>,
        cells: Cell[],
        sheetItems: number[],
        side: "front" | "back",
      ) => {
        const page = doc.addPage([wPt, hPt]);
        for (let i = 0; i < cells.length; i++) {
          const cell = cells[i];
          if (!cell) continue;
          const itemIdx = sheetItems[i];
          const item = itemIdx !== undefined ? items[itemIdx] : undefined;
          const x = cell.x * MM_TO_PT;
          const yTop = cell.y * MM_TO_PT;
          const w = cell.w * MM_TO_PT;
          const h = cell.h * MM_TO_PT;
          const y = hPt - yTop - h;

          if (item) {
            const embedded = await getEmbedded(
              doc,
              imageCache,
              item,
              side,
              cell.rotated,
            );
            if (embedded) {
              page.drawImage(embedded, { x, y, width: w, height: h });
            }
          }

          if (cropMarks) {
            const tx0 = x + bleed * MM_TO_PT;
            const ty0 = y + bleed * MM_TO_PT;
            const tx1 = x + w - bleed * MM_TO_PT;
            const ty1 = y + h - bleed * MM_TO_PT;
            const t = 0.6;
            const lines: Array<[number, number, number, number]> = [
              // left edge: top + bottom corners (vertical ticks)
              [tx0, ty1 + markOffset, tx0, ty1 + markOffset + markLen],
              [tx0, ty0 - markOffset, tx0, ty0 - markOffset - markLen],
              [tx1, ty1 + markOffset, tx1, ty1 + markOffset + markLen],
              [tx1, ty0 - markOffset, tx1, ty0 - markOffset - markLen],
              // horizontal ticks
              [tx0 - markOffset, ty1, tx0 - markOffset - markLen, ty1],
              [tx0 - markOffset, ty0, tx0 - markOffset - markLen, ty0],
              [tx1 + markOffset, ty1, tx1 + markOffset + markLen, ty1],
              [tx1 + markOffset, ty0, tx1 + markOffset + markLen, ty0],
            ];
            for (const [x1, y1, x2, y2] of lines) {
              page.drawLine({
                start: { x: x1, y: y1 },
                end: { x: x2, y: y2 },
                thickness: t,
                color: black,
              });
            }
          }

          if (dashedGrid) {
            page.drawRectangle({
              x,
              y,
              width: w,
              height: h,
              borderWidth: 0.5,
              borderColor: black,
              borderDashArray: [4.23 * MM_TO_PT, 4.23 * MM_TO_PT],
            });
          }
        }
      };

      const backCells = mirrorCells(layout.cells, sheetW, sheetH, mirrorAxis);

      /** Groups of sheets; each group becomes one downloaded file. */
      type Group = { suffix: string; sheets: number[][] };
      const chunk = (seq: number[]): number[][] => {
        const out: number[][] = [];
        for (let i = 0; i < seq.length; i += perSheet) {
          out.push(seq.slice(i, i + perSheet));
        }
        return out;
      };

      let groups: Group[];
      if (separateFiles && duplex) {
        const sheets = chunk(filledSequence);
        groups = [
          { suffix: "_LICE", sheets },
          { suffix: "_GRAB", sheets },
        ];
      } else if (separateFiles) {
        groups = items.map((item, idx) => {
          const n = singleSheet
            ? perSheet
            : Math.max(0, Math.floor(item.count));
          const seq = Array.from({ length: n }, () => idx);
          const safe =
            item.name.replace(/\.[^.]+$/, "").replace(/[^\w\-]+/g, "_") ||
            `dizain_${idx + 1}`;
          return { suffix: `_${safe}`, sheets: chunk(seq) };
        });
      } else {
        groups = [{ suffix: "", sheets: chunk(filledSequence) }];
      }

      const baseName = `raskladka_${trimW}x${trimH}_${sheetId}_${
        portrait ? "vert" : "hor"
      }`;

      for (let g = 0; g < groups.length; g++) {
        const group = groups[g];
        if (!group || group.sheets.length === 0) continue;
        const isBackFile = separateFiles && duplex && group.suffix === "_GRAB";
        const doc = await PDFDocument.create();
        const imageCache = new Map<
          string,
          Awaited<ReturnType<typeof doc.embedJpg>>
        >();

        for (const sheetItems of group.sheets) {
          if (separateFiles && duplex) {
            await drawSheet(
              doc,
              imageCache,
              isBackFile ? backCells : layout.cells,
              sheetItems,
              isBackFile ? "back" : "front",
            );
          } else {
            await drawSheet(doc, imageCache, layout.cells, sheetItems, "front");
            if (duplex) {
              await drawSheet(doc, imageCache, backCells, sheetItems, "back");
            }
          }
        }

        const bytes = await doc.save();
        const buffer = bytes.buffer.slice(
          bytes.byteOffset,
          bytes.byteOffset + bytes.byteLength,
        ) as ArrayBuffer;
        const blob = new Blob([buffer], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${baseName}${group.suffix}${
          duplex && !separateFiles ? "_duplex" : ""
        }.pdf`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 15000);
        // browsers drop rapid-fire downloads; give each one a moment
        if (g < groups.length - 1) {
          await new Promise((r) => setTimeout(r, 700));
        }
      }
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : "Грешка при генериране на PDF");
    } finally {
      setBusy(false);
    }
  };

  /* ------------------------------ UI -------------------------------- */

  const inputCls =
    "w-24 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-2 py-1.5 text-sm text-gray-900 dark:text-white";
  const labelCls = "text-xs font-medium text-gray-500 dark:text-gray-400";

  return (
    <div className="space-y-6">
      {/* Settings */}
      <div className="rounded-lg bg-white dark:bg-gray-800 shadow p-4 space-y-4">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <div className={labelCls}>Готов размер</div>
            <select
              className="mt-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-2 py-1.5 text-sm text-gray-900 dark:text-white"
              value={`${trimW}x${trimH}`}
              onChange={(e) => {
                const preset = PRESETS.find(
                  (p) => `${p.w}x${p.h}` === e.target.value,
                );
                if (preset) {
                  setTrimW(preset.w);
                  setTrimH(preset.h);
                }
              }}
            >
              {!PRESETS.some((p) => p.w === trimW && p.h === trimH) && (
                <option value={`${trimW}x${trimH}`}>
                  {trimW} × {trimH} мм (ръчно)
                </option>
              )}
              {PRESETS.map((p) => (
                <option key={p.label} value={`${p.w}x${p.h}`}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <div className={labelCls}>Ширина, мм</div>
            <input
              type="number"
              className={`${inputCls} mt-1`}
              value={trimW}
              min={10}
              onChange={(e) => setTrimW(Number(e.target.value) || 0)}
            />
          </div>
          <div>
            <div className={labelCls}>Височина, мм</div>
            <input
              type="number"
              className={`${inputCls} mt-1`}
              value={trimH}
              min={10}
              onChange={(e) => setTrimH(Number(e.target.value) || 0)}
            />
          </div>
          <div>
            <div className={labelCls}>Вылет (bleed), мм</div>
            <input
              type="number"
              step={0.5}
              min={0}
              className={`${inputCls} mt-1`}
              value={bleed}
              onChange={(e) => setBleed(Number(e.target.value) || 0)}
            />
          </div>
          <div>
            <div className={labelCls}>Лист</div>
            <select
              className="mt-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-2 py-1.5 text-sm text-gray-900 dark:text-white"
              value={sheetId}
              onChange={(e) => setSheetId(e.target.value as SheetId)}
            >
              {(Object.keys(SHEETS) as SheetId[]).map((id) => (
                <option key={id} value={id}>
                  {id}
                </option>
              ))}
            </select>
          </div>
          <div>
            <div className={labelCls}>Ориентация</div>
            <div className="mt-1 inline-flex rounded-md border border-gray-300 dark:border-gray-600 overflow-hidden">
              <button
                type="button"
                onClick={() => setPortrait(false)}
                className={`px-3 py-1.5 text-sm ${
                  !portrait
                    ? "bg-indigo-600 text-white"
                    : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200"
                }`}
              >
                Хоризонтален
              </button>
              <button
                type="button"
                onClick={() => setPortrait(true)}
                className={`px-3 py-1.5 text-sm ${
                  portrait
                    ? "bg-indigo-600 text-white"
                    : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200"
                }`}
              >
                Вертикален
              </button>
            </div>
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {sheetW} × {sheetH} мм
            </div>
          </div>
          <div>
            <div className={labelCls}>Как да стоят картичките</div>
            <select
              className="mt-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-2 py-1.5 text-sm text-gray-900 dark:text-white"
              value={cardOrientation}
              onChange={(e) =>
                setCardOrientation(e.target.value as CardOrientation)
              }
            >
              <option value="auto">Автоматично (максимум бройки)</option>
              <option value="upright">
                Както са зададени ({trimW} × {trimH}) — {orientationCounts.upright} бр.
              </option>
              <option value="rotated">
                Завъртени на 90° ({trimH} × {trimW}) — {orientationCounts.rotated} бр.
              </option>
            </select>
          </div>
          <div>
            <div className={labelCls}>Поле X / Y, мм</div>
            <div className="mt-1 flex gap-2">
              <input
                type="number"
                step={0.5}
                min={0}
                className="w-16 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-2 py-1.5 text-sm text-gray-900 dark:text-white"
                value={marginX}
                onChange={(e) => setMarginX(Number(e.target.value) || 0)}
              />
              <input
                type="number"
                step={0.5}
                min={0}
                className="w-16 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-2 py-1.5 text-sm text-gray-900 dark:text-white"
                value={marginY}
                onChange={(e) => setMarginY(Number(e.target.value) || 0)}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-700 dark:text-gray-300">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={allowMixed}
              onChange={(e) => setAllowMixed(e.target.checked)}
            />
            Максимум бройки (смесена подредба, по-трудно рязане)
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={cropMarks}
              onChange={(e) => setCropMarks(e.target.checked)}
            />
            Класически метки за рязане
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={dashedGrid}
              onChange={(e) => setDashedGrid(e.target.checked)}
            />
            Пунктир по клетките (стар стил)
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={duplex}
              onChange={(e) => setDuplex(e.target.checked)}
            />
            Двустранен печат
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={singleSheet}
              onChange={(e) => setSingleSheet(e.target.checked)}
            />
            Само един лист (тиражът се задава на принтера)
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={separateFiles}
              onChange={(e) => setSeparateFiles(e.target.checked)}
            />
            {duplex
              ? "Отделни файлове за лице и гръб"
              : "Отделен файл за всеки дизайн"}
          </label>
          {duplex && (
            <>
              <label className="flex items-center gap-2">
                Огледало на гърба:
                <select
                  className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-2 py-1 text-sm text-gray-900 dark:text-white"
                  value={mirrorAxis}
                  onChange={(e) => setMirrorAxis(e.target.value as "x" | "y")}
                >
                  <option value="x">по ширина (ляво ↔ дясно)</option>
                  <option value="y">по височина (горе ↕ долу)</option>
                </select>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={rotateBack}
                  onChange={(e) => setRotateBack(e.target.checked)}
                />
                Завърти гърба на 180°
              </label>
            </>
          )}
        </div>
      </div>

      {/* Items */}
      <div className="rounded-lg bg-white dark:bg-gray-800 shadow p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
            Дизайни / снимки
          </h2>
          <label className="cursor-pointer rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700">
            + Добави файлове
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf,.pdf"
              multiple
              className="hidden"
              onChange={(e) => {
                void addFiles(e.target.files);
                e.target.value = "";
              }}
            />
          </label>
        </div>

        {items.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Добавете JPG, PNG или PDF — всеки файл е отделен дизайн. При PDF се
            взема първата страница. После задайте
            брой копия за всеки.
          </p>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {items.map((item) => {
              const dpi = approxDpi(item.img, trimW, trimH);
              const dpiColor =
                dpi < 150
                  ? "bg-red-100 text-red-700"
                  : dpi < 250
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-green-100 text-green-700";
              return (
                <li key={item.id} className="flex flex-wrap items-center gap-3 py-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.img.src}
                    alt=""
                    className="h-14 w-14 rounded object-cover border border-gray-200 dark:border-gray-600"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm text-gray-900 dark:text-white">
                      {item.name}
                    </div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs">
                      <span className={`rounded-full px-2 py-0.5 ${dpiColor}`}>
                        ≈ {dpi} dpi
                      </span>
                      {dpi < 150 && (
                        <span className="text-red-600">
                          много ниска резолюция за този размер
                        </span>
                      )}
                      {duplex && (
                        <span className="text-gray-500 dark:text-gray-400">
                          {item.back ? "гръб: ✓" : "гръб: няма (ще е празен)"}
                        </span>
                      )}
                    </div>
                  </div>
                  {!singleSheet && (
                    <label className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                      Брой
                      <input
                        type="number"
                        min={1}
                        className="w-20 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-2 py-1 text-sm text-gray-900 dark:text-white"
                        value={item.count}
                        onChange={(e) =>
                          updateItem(item.id, {
                            count: Math.max(1, Number(e.target.value) || 1),
                          })
                        }
                      />
                    </label>
                  )}
                  <select
                    className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-2 py-1 text-sm text-gray-900 dark:text-white"
                    value={item.fit}
                    onChange={(e) =>
                      updateItem(item.id, { fit: e.target.value as FitMode })
                    }
                  >
                    <option value="cover">запълни (изрязва)</option>
                    <option value="contain">побери (с полета)</option>
                  </select>
                  {duplex && (
                    <button
                      type="button"
                      className="rounded-md border border-gray-300 dark:border-gray-600 px-2 py-1 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                      onClick={() => {
                        backInputFor.current = item.id;
                        backFileRef.current?.click();
                      }}
                    >
                      {item.back ? "Смени гърба" : "Качи гръб"}
                    </button>
                  )}
                  <button
                    type="button"
                    className="rounded-md px-2 py-1 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
                    onClick={() => removeItem(item.id)}
                  >
                    Премахни
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        <input
          ref={backFileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf,.pdf"
          className="hidden"
          onChange={(e) => {
            void addBackFile(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {/* Layout summary + preview */}
      <div className="rounded-lg bg-white dark:bg-gray-800 shadow p-4 space-y-4">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-700 dark:text-gray-300">
          <span>
            Клетка: <b>{cellW.toFixed(1)} × {cellH.toFixed(1)} мм</b>
          </span>
          <span>
            На лист: <b>{layout.count} бр.</b> ({layout.description})
          </span>
          {altCount !== layout.count && (
            <button
              type="button"
              onClick={() => setPortrait((v) => !v)}
              className={
                altCount > layout.count
                  ? "underline text-green-700 dark:text-green-400"
                  : "underline text-gray-500 dark:text-gray-400"
              }
              title="Превключи ориентацията на листа"
            >
              {portrait ? "хоризонтално" : "вертикално"}: {altCount} бр.
              {altCount > layout.count ? " — по-изгодно" : ""}
            </button>
          )}
          <span>
            Общо карти: <b>{sequence.length}</b>
          </span>
          <span>
            Листове: <b>{sheetCount}</b>
            {duplex ? " × 2 страници" : ""}
            {singleSheet && sheetCount > 0 ? " — тиражът на принтера" : ""}
          </span>
          {!singleSheet && emptyCells > 0 && (
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={fillLastSheet}
                onChange={(e) => setFillLastSheet(e.target.checked)}
              />
              Запълни {emptyCells} празни клетки с повторения
            </label>
          )}
        </div>

        {layout.count === 0 && (
          <p className="text-sm text-red-600">
            Картичка с този размер не се побира на избрания лист.
          </p>
        )}

        {sheetCount > 0 && (
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="text-gray-500 dark:text-gray-400">Преглед:</span>
            <select
              className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-2 py-1 text-sm text-gray-900 dark:text-white"
              value={previewSheet}
              onChange={(e) => setPreviewSheet(Number(e.target.value) || 0)}
            >
              {Array.from({ length: sheetCount }, (_, i) => (
                <option key={i} value={i}>
                  Лист {i + 1}
                </option>
              ))}
            </select>
            {duplex && (
              <select
                className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-2 py-1 text-sm text-gray-900 dark:text-white"
                value={previewSide}
                onChange={(e) =>
                  setPreviewSide(e.target.value as "front" | "back")
                }
              >
                <option value="front">Лице</option>
                <option value="back">Гръб</option>
              </select>
            )}
          </div>
        )}

        <div className="overflow-auto">
          <canvas
            ref={canvasRef}
            className="max-w-full rounded border border-gray-300 dark:border-gray-600"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={busy || sheetCount === 0}
            onClick={() => void generatePdf()}
            className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? "Генерирам…" : "Генерирай PDF"}
          </button>
          {separateFiles && sheetCount > 0 && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {duplex
                ? "Ще се свалят 2 файла: _LICE и _GRAB"
                : `Ще се свалят ${items.length} файла — по един за всеки дизайн`}
              {singleSheet ? ", по 1 страница" : ""}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
