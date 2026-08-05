/**
 * Client-side image prep before upload.
 * Large phone photos (~8MB+) often fail platform body limits (e.g. Vercel ~4.5MB),
 * so we resize/compress in the browser first.
 */

export const MAX_IMAGE_INPUT_BYTES = 15 * 1024 * 1024;
/** Keep uploads safely under typical serverless body limits */
export const MAX_IMAGE_UPLOAD_BYTES = 2.5 * 1024 * 1024;
const MAX_DIMENSION = 2000;

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Неуспешно зареждане на изображението"));
    };
    img.src = url;
  });
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Неуспешна компресия на изображението"));
          return;
        }
        resolve(blob);
      },
      type,
      quality,
    );
  });
}

function supportsWebpEncoding(): boolean {
  try {
    const probe = document.createElement("canvas");
    probe.width = 1;
    probe.height = 1;
    return probe.toDataURL("image/webp").startsWith("data:image/webp");
  } catch {
    return false;
  }
}

/**
 * Resize and compress an image file for upload.
 * Prefers WebP, falls back to JPEG. Preserves PNG only when already small.
 */
export async function compressImageFile(file: File): Promise<File> {
  const img = await loadImage(file);
  const scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height));
  const width = Math.max(1, Math.round(img.width * scale));
  const height = Math.max(1, Math.round(img.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Неуспешна компресия на изображението");
  }
  ctx.drawImage(img, 0, 0, width, height);

  const preferWebp = supportsWebpEncoding();
  const outputType = preferWebp ? "image/webp" : "image/jpeg";
  const extension = preferWebp ? "webp" : "jpg";
  const baseName = file.name.replace(/\.[^.]+$/, "") || "image";

  let quality = 0.85;
  let blob = await canvasToBlob(canvas, outputType, quality);

  while (blob.size > MAX_IMAGE_UPLOAD_BYTES && quality > 0.45) {
    quality -= 0.1;
    blob = await canvasToBlob(canvas, outputType, quality);
  }

  // Still too large — shrink dimensions once more and re-encode
  if (blob.size > MAX_IMAGE_UPLOAD_BYTES) {
    const shrink = Math.sqrt(MAX_IMAGE_UPLOAD_BYTES / blob.size) * 0.9;
    canvas.width = Math.max(1, Math.round(width * shrink));
    canvas.height = Math.max(1, Math.round(height * shrink));
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    blob = await canvasToBlob(canvas, outputType, 0.75);
  }

  return new File([blob], `${baseName}.${extension}`, {
    type: outputType,
    lastModified: Date.now(),
  });
}

/**
 * Validate and compress an image so it can be uploaded reliably.
 */
export async function prepareImageForUpload(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Моля, избери валиден файл със снимка");
  }

  if (file.size > MAX_IMAGE_INPUT_BYTES) {
    throw new Error("Файлът е твърде голям. Максималният размер е 15MB");
  }

  // Already small enough — skip work (keeps SVG/GIF/small PNG intact when possible)
  if (
    file.size <= MAX_IMAGE_UPLOAD_BYTES &&
    (file.type === "image/gif" ||
      file.type === "image/svg+xml" ||
      file.type === "image/webp" ||
      file.type === "image/png" ||
      file.type === "image/jpeg" ||
      file.type === "image/jpg")
  ) {
    // Still compress huge-dimension JPEGs that happen to be under the byte cap
    try {
      const img = await loadImage(file);
      if (Math.max(img.width, img.height) <= MAX_DIMENSION) {
        return file;
      }
    } catch {
      return file;
    }
  }

  return compressImageFile(file);
}
