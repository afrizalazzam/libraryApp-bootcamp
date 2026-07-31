export const MAX_FILE_SIZE = 5 * 1024 * 1024;
export const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpeg"];

export type BookFormErrors = {
  title?: string;
  author?: string;
  categoryId?: string;
  description?: string;
  coverImage?: string;
};

// The backend only ever returns a flat, comma-separated message string
// (e.g. "Title is required, Author is required") rather than structured
// per-field errors, so we best-effort match segments back to a field.
const FIELD_KEYWORDS: [keyof BookFormErrors, string[]][] = [
  ["title", ["title"]],
  ["author", ["author"]],
  ["categoryId", ["category"]],
  ["description", ["description"]],
  ["coverImage", ["cover", "image"]],
];

export function mapServerError(message: string): {
  fieldErrors: BookFormErrors;
  generic: string[];
} {
  const parts = message
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  const fieldErrors: BookFormErrors = {};
  const generic: string[] = [];

  for (const part of parts) {
    const lower = part.toLowerCase();
    const match = FIELD_KEYWORDS.find(([, keywords]) =>
      keywords.some((keyword) => lower.includes(keyword))
    );
    if (match) {
      fieldErrors[match[0]] = part;
    } else {
      generic.push(part);
    }
  }

  return { fieldErrors, generic };
}

const START_DIMENSION = 800;
const MIN_DIMENSION = 300;
const START_QUALITY = 0.8;
const MIN_QUALITY = 0.35;

// Multipart uploads (create) send the file as raw binary, so they can
// afford a bigger budget than JSON bodies (update), where the image travels
// as a base64 string — roughly 33% larger than the binary it's built from.
export const CREATE_TARGET_MAX_BYTES = 300 * 1024;
export const UPDATE_TARGET_MAX_BYTES = 90 * 1024;

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to read image."));
    };
    img.src = url;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Failed to encode image."))),
      "image/jpeg",
      quality
    );
  });
}

// The API (or a proxy in front of it) rejects large bodies with a 413, and
// the exact ceiling isn't documented, so downscale + re-encode as JPEG and
// keep shrinking quality/dimensions until comfortably under a conservative
// target instead of guessing a single fixed size.
export async function compressCoverImage(
  file: File,
  targetMaxBytes: number = CREATE_TARGET_MAX_BYTES
): Promise<Blob> {
  const image = await loadImageFromFile(file);

  let dimension = START_DIMENSION;
  let quality = START_QUALITY;
  let blob: Blob | null = null;

  for (let attempt = 0; attempt < 8; attempt++) {
    const scale = Math.min(1, dimension / Math.max(image.width, image.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(image.width * scale);
    canvas.height = Math.round(image.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas is not supported in this browser.");
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    blob = await canvasToBlob(canvas, quality);
    if (blob.size <= targetMaxBytes) break;

    if (quality > MIN_QUALITY) {
      quality = Math.max(MIN_QUALITY, quality - 0.15);
    } else if (dimension > MIN_DIMENSION) {
      dimension = Math.max(MIN_DIMENSION, Math.round(dimension * 0.75));
    } else {
      break;
    }
  }

  return blob as Blob;
}

export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}
