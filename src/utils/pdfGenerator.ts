import { PDFDocument } from 'pdf-lib';
import QRCode from 'qrcode';
import { ReportData } from '../types';
import { getBodyFatStatus, getVisceralFatStatus, getBmiStatus } from './calculations';
import { getRecommendations, ProductItem } from './recommendations';
import { getReportShareUrl } from './qrPayload';
import { resolveAssetUrl } from './assetPath';

// A4 dimensions in points
const PDF_WIDTH_PT = 595.5;
const PDF_HEIGHT_PT = 842.25;

// Render scale for crystal clear typography on A4
const DPI_SCALE = 2.5;
const CANVAS_WIDTH = Math.round(PDF_WIDTH_PT * DPI_SCALE);
const CANVAS_HEIGHT = Math.round(PDF_HEIGHT_PT * DPI_SCALE);

// In-memory cache for original PDF template ArrayBuffer to avoid repeated network/disk reads
let cachedTemplateBuffer: ArrayBuffer | null = null;

async function getTemplateArrayBuffer(): Promise<ArrayBuffer> {
  if (cachedTemplateBuffer) {
    return cachedTemplateBuffer.slice(0);
  }
  const templateUrl = resolveAssetUrl('/BAR.pdf');
  const templateResponse = await fetch(templateUrl);
  if (!templateResponse.ok) {
    throw new Error(`Failed to load BAR.pdf template from ${templateUrl}`);
  }
  cachedTemplateBuffer = await templateResponse.arrayBuffer();
  return cachedTemplateBuffer.slice(0);
}

// Image cache for fast repeated generation
const imageCache = new Map<string, HTMLImageElement>();

function loadImage(src: string): Promise<HTMLImageElement> {
  const resolvedSrc = resolveAssetUrl(src);
  if (imageCache.has(resolvedSrc)) {
    return Promise.resolve(imageCache.get(resolvedSrc)!);
  }
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imageCache.set(resolvedSrc, img);
      if ('decode' in img) {
        img.decode().catch(() => {}).finally(() => resolve(img));
      } else {
        resolve(img);
      }
    };
    img.onerror = () => {
      console.warn(`[pdfGenerator] Warning: Could not load image from ${resolvedSrc}`);
      reject(new Error(`Failed to load image at ${resolvedSrc}`));
    };
    img.src = resolvedSrc;
  });
}

/**
 * Fast direct canvas to PNG Uint8Array conversion without expensive base64 DataURL roundtrip
 */
function canvasToPngBytes(canvas: HTMLCanvasElement): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        return reject(new Error('Canvas toBlob returned null'));
      }
      blob.arrayBuffer()
        .then((buf) => resolve(new Uint8Array(buf)))
        .catch(reject);
    }, 'image/png');
  });
}

async function ensureFontLoaded(): Promise<void> {
  if (typeof document !== 'undefined' && 'fonts' in document && typeof FontFace !== 'undefined') {
    try {
      const fontUrl = resolveAssetUrl('/NotoSansDevanagari-Bold.ttf');
      const notoFont = new FontFace('Noto Sans Devanagari', `url("${fontUrl}")`, {
        weight: '700',
        style: 'normal',
      });
      const loaded = await notoFont.load();
      document.fonts.add(loaded);
    } catch (e) {
      // Silently fallback to system fonts
    }
  }
}

/**
 * Warm up and preload all PDF assets (Template BAR.pdf, all product images, and fonts)
 * Runs asynchronously on app launch to make subsequent PDF generation instantaneous.
 */
export async function preloadPdfAssets(): Promise<void> {
  try {
    const promises: Promise<any>[] = [
      getTemplateArrayBuffer().catch((e) => console.warn('[preloadPdfAssets] Template preload notice:', e)),
      ensureFontLoaded(),
    ];

    if (typeof document !== 'undefined' && document.fonts) {
      promises.push(document.fonts.ready.catch(() => {}));
    }

    const productPaths = [
      '/products/Formula 1.png',
      '/products/ShakeMate.png',
      '/products/Personalised Protein Powder.png',
      '/products/24 Hydrate.png',
      '/products/Liftoff.png',
      '/products/Afresh.png',
      '/products/Multivitamin Mineral & Herbal Tablets Plus.png',
      '/products/Cell-U-Loss.png',
      '/products/Cell Activator.png',
      '/products/Dinoshake.png',
      '/products/Omega 3 (EPA & DHA) Capsules.png',
      '/products/Active Fiber Complex.png',
      '/products/Niteworks.png',
      '/products/Herbal Control.png',
      '/footer_exact.png',
    ];

    for (const p of productPaths) {
      promises.push(loadImage(p).catch((e) => console.warn(`[preloadPdfAssets] Failed to preload ${p}:`, e)));
    }

    await Promise.all(promises);
  } catch (err) {
    console.warn('[preloadPdfAssets] Notice during asset preloading:', err);
  }
}

export interface BoxRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DrawTextInBoxOptions {
  ctx: CanvasRenderingContext2D;
  text: string;
  box: BoxRect;
  initialFontSize?: number;
  minFontSize?: number;
  color?: string;
  fontFamily?: string;
  isBold?: boolean;
  padding?: { horizontal?: number };
  align?: CanvasTextAlign;
}

/**
 * Reusable helper: Draws text centered inside a comparison box using proven typographical centering.
 * Baseline Y = (box.y + box.height / 2) + fontSize * 0.35
 * This matches standard typographic visual centering (cap-height midpoint) and avoids platform font metric discrepancies.
 */
export function drawTextCenteredInBox(options: DrawTextInBoxOptions): void {
  const {
    ctx,
    text,
    box,
    initialFontSize = 12.0,
    minFontSize = 7.0,
    color = '#001a70',
    fontFamily = "'Arial', sans-serif",
    isBold = true,
    padding = { horizontal: 3 },
    align = 'center',
  } = options;

  if (!text || text.trim() === '') return;

  const hPad = padding.horizontal ?? 3;
  const availableWidth = Math.max(8, box.width - 2 * hPad);

  let fontSize = initialFontSize;
  const fontWeight = isBold ? 'bold' : '500';
  ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;

  while (ctx.measureText(text).width > availableWidth && fontSize > minFontSize) {
    fontSize -= 0.5;
    ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
  }

  // Calculate horizontal X
  let drawX: number;
  if (align === 'center') {
    drawX = box.x + box.width / 2;
    ctx.textAlign = 'center';
  } else if (align === 'left') {
    drawX = box.x + hPad;
    ctx.textAlign = 'left';
  } else {
    drawX = box.x + box.width - hPad;
    ctx.textAlign = 'right';
  }

  // Exact vertical baseline calculation matching test_render_v2.py
  const boxCenterY = box.y + box.height / 2;
  const baselineY = boxCenterY + fontSize * 0.35;
  ctx.fillStyle = color;
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(text, drawX, baselineY);
}

export interface DrawTextAtBaselineOptions {
  ctx: CanvasRenderingContext2D;
  text: string;
  x: number;
  baselineY: number;
  initialFontSize?: number;
  minFontSize?: number;
  maxWidth?: number;
  color?: string;
  fontFamily?: string;
  isBold?: boolean;
  align?: CanvasTextAlign;
}

/**
 * Reusable helper: Draws text at calibrated baseline coordinates with width auto-fit.
 */
export function drawTextAtBaseline(options: DrawTextAtBaselineOptions): void {
  const {
    ctx,
    text,
    x,
    baselineY,
    initialFontSize = 12.0,
    minFontSize = 7.0,
    maxWidth,
    color = '#001a70',
    fontFamily = "'Noto Sans Devanagari', 'Mukta', 'Arial', sans-serif",
    isBold = true,
    align = 'left',
  } = options;

  if (!text || text.trim() === '') return;

  let fontSize = initialFontSize;
  const fontWeight = isBold ? 'bold' : '500';
  ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;

  if (maxWidth) {
    while (ctx.measureText(text).width > maxWidth && fontSize > minFontSize) {
      fontSize -= 0.5;
      ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    }
  }

  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(text, x, baselineY);
}

// 17 Template Comparison Box Rectangles (Calibrated with exact geometry from BAR.pdf)
export const BOX_BODY_FAT_NORMAL: BoxRect = { x: 164.2, y: 238.1, width: 46.9, height: 17.9 };
export const BOX_BODY_FAT_HIGH: BoxRect = { x: 250.6, y: 229.1, width: 46.9, height: 17.9 };
export const BOX_BODY_FAT_RISK: BoxRect = { x: 341.2, y: 229.1, width: 46.9, height: 17.9 };

export const BOX_VISCERAL_NORMAL: BoxRect = { x: 164.2, y: 313.3, width: 46.9, height: 17.9 };
export const BOX_VISCERAL_HIGH: BoxRect = { x: 250.6, y: 304.3, width: 46.9, height: 17.9 };
export const BOX_VISCERAL_RISK: BoxRect = { x: 341.0, y: 304.3, width: 46.9, height: 17.9 };

export const BOX_BMI_NORMAL: BoxRect = { x: 164.2, y: 421.1, width: 46.9, height: 17.9 };
export const BOX_BMI_HIGH: BoxRect = { x: 250.8, y: 411.7, width: 46.9, height: 17.9 };
export const BOX_BMI_RISK: BoxRect = { x: 339.2, y: 411.7, width: 46.9, height: 17.9 };

export const BOX_SUB_WHOLE: BoxRect = { x: 66.1, y: 563.7, width: 46.9, height: 17.9 };
export const BOX_SUB_ARMS: BoxRect = { x: 164.2, y: 555.3, width: 46.9, height: 17.9 };
export const BOX_SUB_TRUNK: BoxRect = { x: 253.5, y: 555.0, width: 46.9, height: 17.9 };
export const BOX_SUB_LEGS: BoxRect = { x: 339.2, y: 554.8, width: 46.9, height: 17.9 };

export const BOX_SKEL_WHOLE: BoxRect = { x: 64.4, y: 635.4, width: 46.9, height: 17.9 };
export const BOX_SKEL_ARMS: BoxRect = { x: 164.2, y: 629.7, width: 46.9, height: 17.9 };
export const BOX_SKEL_TRUNK: BoxRect = { x: 253.5, y: 629.1, width: 46.9, height: 17.9 };
export const BOX_SKEL_LEGS: BoxRect = { x: 339.2, y: 629.7, width: 46.9, height: 17.9 };

/**
 * Generate full 2-page PDF with high performance:
 * Page 1: Original BAR.pdf template with calibrated values & QR code
 * Page 2: Suggestions & Recommended Nutrition with transparent product cutouts & subtle reflections
 */
export async function generateReportPdf(
  data: ReportData,
  shareUrl?: string
): Promise<{ pdfBytes: Uint8Array; blobUrl: string; qrDataUrl?: string; pdfBlob: Blob }> {
  // Ensure custom offline fonts are loaded before canvas measurements
  await ensureFontLoaded();
  if (typeof document !== 'undefined' && document.fonts) {
    try {
      await document.fonts.ready;
    } catch (e) {
      console.warn('[pdfGenerator] fonts.ready check error:', e);
    }
  }

  // 1. Fetch template & generate QR in parallel
  const templatePromise = getTemplateArrayBuffer();
  const urlToEncode = shareUrl || getReportShareUrl(data);
  const qrPromise = urlToEncode
    ? QRCode.toDataURL(urlToEncode, {
        width: 180,
        margin: 1,
        color: {
          dark: '#001a70',
          light: '#ffffff',
        },
      })
    : Promise.resolve(undefined);

  const [templateBytes, qrDataUrl] = await Promise.all([templatePromise, qrPromise]);

  // 2. PAGE 1: Canvas for calibrated text overlays + QR code
  const canvas1 = document.createElement('canvas');
  canvas1.width = CANVAS_WIDTH;
  canvas1.height = CANVAS_HEIGHT;
  const ctx1 = canvas1.getContext('2d');
  if (!ctx1) {
    throw new Error('Could not get 2D canvas context for page 1');
  }
  ctx1.scale(DPI_SCALE, DPI_SCALE);

  // Header Fields (Personal Details - Exact baseline positioning above printed lines)
  drawTextAtBaseline({
    ctx: ctx1,
    text: data.name,
    x: 80,
    baselineY: 78.5,
    initialFontSize: 12.5,
    maxWidth: 225,
    color: '#001a70',
  });

  drawTextAtBaseline({
    ctx: ctx1,
    text: data.mobile,
    x: 395,
    baselineY: 89.0,
    initialFontSize: 12.5,
    maxWidth: 114,
    color: '#001a70',
  });

  drawTextAtBaseline({
    ctx: ctx1,
    text: data.village,
    x: 80,
    baselineY: 102.0,
    initialFontSize: 12.0,
    maxWidth: 150,
    color: '#001a70',
  });

  const ageGenderText = data.age
    ? `${data.age} (${data.gender === 'Male' ? 'M' : 'F'})`
    : '';
  drawTextAtBaseline({
    ctx: ctx1,
    text: ageGenderText,
    x: 272,
    baselineY: 112.5,
    initialFontSize: 11.5,
    maxWidth: 52,
    color: '#001a70',
  });

  const heightText = data.height ? `${data.height} cm` : '';
  drawTextAtBaseline({
    ctx: ctx1,
    text: heightText,
    x: 354,
    baselineY: 112.0,
    initialFontSize: 11.5,
    maxWidth: 50,
    color: '#001a70',
  });

  drawTextAtBaseline({
    ctx: ctx1,
    text: data.date,
    x: 452,
    baselineY: 111.5,
    initialFontSize: 11.5,
    maxWidth: 74,
    color: '#001a70',
  });

  // Weight Row (Exact calibrated baseline Y = 163.0 inside weight boxes)
  const weightVal = data.weight ? `${data.weight} kg` : '';
  const idealVal = data.idealWeight ? `${data.idealWeight} kg` : '';
  const extraVal = data.extraWeight || '-';
  const lessVal = data.lessWeight || '-';

  drawTextAtBaseline({
    ctx: ctx1,
    text: weightVal,
    x: 92,
    baselineY: 163.0,
    initialFontSize: 13.0,
    fontFamily: "'Arial', sans-serif",
    color: '#001a70',
  });

  drawTextAtBaseline({
    ctx: ctx1,
    text: idealVal,
    x: 262,
    baselineY: 163.0,
    initialFontSize: 13.0,
    fontFamily: "'Arial', sans-serif",
    color: '#001a70',
  });

  drawTextAtBaseline({
    ctx: ctx1,
    text: extraVal,
    x: 376,
    baselineY: 163.0,
    initialFontSize: 13.0,
    fontFamily: "'Arial', sans-serif",
    color: extraVal !== '-' ? '#b91c1c' : '#001a70',
  });

  drawTextAtBaseline({
    ctx: ctx1,
    text: lessVal,
    x: 486,
    baselineY: 163.0,
    initialFontSize: 13.0,
    fontFamily: "'Arial', sans-serif",
    color: lessVal !== '-' ? '#047857' : '#001a70',
  });

  // Core Comparison Categories (17 Rectangular Boxes with exact visual centering)
  const numBodyFat = parseFloat(data.bodyFat);
  const numVisceral = parseFloat(data.visceralFat);
  const numBmi = parseFloat(data.bmi);

  if (!isNaN(numBodyFat)) {
    const bfText = `${data.bodyFat}%`;
    const bfStatus = getBodyFatStatus(numBodyFat, data.gender);
    if (bfStatus === 'Normal') {
      drawTextCenteredInBox({ ctx: ctx1, text: bfText, box: BOX_BODY_FAT_NORMAL, initialFontSize: 12.0, color: '#047857' });
    } else if (bfStatus === 'High') {
      drawTextCenteredInBox({ ctx: ctx1, text: bfText, box: BOX_BODY_FAT_HIGH, initialFontSize: 12.0, color: '#b45309' });
    } else if (bfStatus === 'Risk') {
      drawTextCenteredInBox({ ctx: ctx1, text: bfText, box: BOX_BODY_FAT_RISK, initialFontSize: 12.0, color: '#b91c1c' });
    }
  }

  if (!isNaN(numVisceral)) {
    const vfText = `${data.visceralFat}%`;
    const vfStatus = getVisceralFatStatus(numVisceral, data.gender);
    if (vfStatus === 'Normal') {
      drawTextCenteredInBox({ ctx: ctx1, text: vfText, box: BOX_VISCERAL_NORMAL, initialFontSize: 12.0, color: '#047857' });
    } else if (vfStatus === 'High') {
      drawTextCenteredInBox({ ctx: ctx1, text: vfText, box: BOX_VISCERAL_HIGH, initialFontSize: 12.0, color: '#b45309' });
    } else if (vfStatus === 'Risk') {
      drawTextCenteredInBox({ ctx: ctx1, text: vfText, box: BOX_VISCERAL_RISK, initialFontSize: 12.0, color: '#b91c1c' });
    }
  }

  if (data.restingMetabolism) {
    drawTextAtBaseline({
      ctx: ctx1,
      text: `${data.restingMetabolism} kcal`,
      x: 255,
      baselineY: 374.0,
      initialFontSize: 12.5,
      fontFamily: "'Arial', sans-serif",
      color: '#001a70',
    });
  }

  if (!isNaN(numBmi)) {
    const bmiText = `${data.bmi}`;
    const bmiStatus = getBmiStatus(numBmi, data.gender);
    if (bmiStatus === 'Normal') {
      drawTextCenteredInBox({ ctx: ctx1, text: bmiText, box: BOX_BMI_NORMAL, initialFontSize: 12.0, color: '#047857' });
    } else if (bmiStatus === 'High') {
      drawTextCenteredInBox({ ctx: ctx1, text: bmiText, box: BOX_BMI_HIGH, initialFontSize: 12.0, color: '#b45309' });
    } else if (bmiStatus === 'Risk') {
      drawTextCenteredInBox({ ctx: ctx1, text: bmiText, box: BOX_BMI_RISK, initialFontSize: 12.0, color: '#b91c1c' });
    }
  }

  if (data.bodyAge) {
    drawTextAtBaseline({
      ctx: ctx1,
      text: `${data.bodyAge} वर्षे`,
      x: 318,
      baselineY: 474.0,
      initialFontSize: 12.0,
      color: '#001a70',
    });
  }

  // Regional Subcutaneous Fat
  if (data.subWhole) drawTextCenteredInBox({ ctx: ctx1, text: `${data.subWhole}%`, box: BOX_SUB_WHOLE, initialFontSize: 12.0, color: '#001a70' });
  if (data.subArms) drawTextCenteredInBox({ ctx: ctx1, text: `${data.subArms}%`, box: BOX_SUB_ARMS, initialFontSize: 12.0, color: '#001a70' });
  if (data.subTrunk) drawTextCenteredInBox({ ctx: ctx1, text: `${data.subTrunk}%`, box: BOX_SUB_TRUNK, initialFontSize: 12.0, color: '#001a70' });
  if (data.subLegs) drawTextCenteredInBox({ ctx: ctx1, text: `${data.subLegs}%`, box: BOX_SUB_LEGS, initialFontSize: 12.0, color: '#001a70' });

  // Regional Skeletal Muscle
  if (data.skelWhole) drawTextCenteredInBox({ ctx: ctx1, text: `${data.skelWhole}%`, box: BOX_SKEL_WHOLE, initialFontSize: 12.0, color: '#001a70' });
  if (data.skelArms) drawTextCenteredInBox({ ctx: ctx1, text: `${data.skelArms}%`, box: BOX_SKEL_ARMS, initialFontSize: 12.0, color: '#001a70' });
  if (data.skelTrunk) drawTextCenteredInBox({ ctx: ctx1, text: `${data.skelTrunk}%`, box: BOX_SKEL_TRUNK, initialFontSize: 12.0, color: '#001a70' });
  if (data.skelLegs) drawTextCenteredInBox({ ctx: ctx1, text: `${data.skelLegs}%`, box: BOX_SKEL_LEGS, initialFontSize: 12.0, color: '#001a70' });

  // Body Measurements (Exact calibrated baseline in measurement table)
  if (data.measArms) drawTextAtBaseline({ ctx: ctx1, text: `${data.measArms}"`, x: 445, baselineY: 613.0, initialFontSize: 11.5, color: '#001a70' });
  if (data.measWaist) drawTextAtBaseline({ ctx: ctx1, text: `${data.measWaist}"`, x: 445, baselineY: 626.5, initialFontSize: 11.5, color: '#001a70' });
  if (data.measThigh) drawTextAtBaseline({ ctx: ctx1, text: `${data.measThigh}"`, x: 445, baselineY: 640.0, initialFontSize: 11.5, color: '#001a70' });

  // QR Code on Page 1
  if (qrDataUrl) {
    const qrImg = new Image();
    await new Promise((resolve) => {
      qrImg.onload = resolve;
      qrImg.src = qrDataUrl;
    });

    ctx1.save();
    ctx1.fillStyle = '#ffffff';
    ctx1.fillRect(504, 32, 62, 62);
    ctx1.strokeStyle = '#e2e8f0';
    ctx1.lineWidth = 1;
    ctx1.strokeRect(504, 32, 62, 62);
    ctx1.drawImage(qrImg, 506, 34, 58, 58);
    ctx1.restore();
  }

  // =============================================================
  // 3. PAGE 2: Canvas for Suggestions Section
  // =============================================================
  const recommendations = getRecommendations(data);
  const canvas2 = document.createElement('canvas');
  canvas2.width = CANVAS_WIDTH;
  canvas2.height = CANVAS_HEIGHT;
  const ctx2 = canvas2.getContext('2d');
  if (!ctx2) {
    throw new Error('Could not get 2D canvas context for page 2');
  }
  ctx2.scale(DPI_SCALE, DPI_SCALE);

  // Background
  ctx2.fillStyle = '#ffffff';
  ctx2.fillRect(0, 0, PDF_WIDTH_PT, PDF_HEIGHT_PT);

  // Outer Page Border (3pt solid black matching Page 1)
  ctx2.strokeStyle = '#000000';
  ctx2.lineWidth = 2.5;
  ctx2.strokeRect(26.6, 27.3, 543.1, 784.6);

  // A. Page 2 Top Header Banner
  ctx2.save();
  const headerX = 140;
  const headerY = 38;
  const headerW = 315;
  const headerH = 34;
  const headerR = 17;

  ctx2.fillStyle = '#c5221f'; // Crimson matching BAR.pdf header pill
  ctx2.beginPath();
  ctx2.roundRect(headerX, headerY, headerW, headerH, headerR);
  ctx2.fill();

  ctx2.fillStyle = '#ffffff';
  ctx2.textAlign = 'center';
  ctx2.textBaseline = 'middle';
  ctx2.font = 'bold 15px "Noto Sans Devanagari", "Mukta", "Arial", sans-serif';
  ctx2.fillText('सल्ले व पोषण मार्गदर्शन (SUGGESTIONS)', headerX + headerW / 2, headerY + headerH / 2);
  ctx2.restore();

  // Client Summary Sub-bar
  ctx2.fillStyle = '#f8fafc';
  ctx2.fillRect(35, 82, 525, 26);
  ctx2.strokeStyle = '#cbd5e1';
  ctx2.lineWidth = 0.8;
  ctx2.strokeRect(35, 82, 525, 26);

  ctx2.fillStyle = '#0f172a';
  ctx2.font = 'bold 9.5px "Noto Sans Devanagari", "Mukta", "Arial", sans-serif';
  ctx2.textAlign = 'left';
  ctx2.textBaseline = 'middle';

  const clientInfoText = `नाव: ${data.name || '-'}  |  वय: ${data.age || '-'} (${data.gender === 'Male' ? 'पुरुष' : 'स्त्री'})  |  वजन: ${data.weight ? data.weight + ' kg' : '-'}  |  BMI: ${data.bmi || '-'}  |  दिनांक: ${data.date || '-'}`;
  ctx2.fillText(clientInfoText, 44, 95);

  // B. Render Sections
  interface RenderSection {
    titleMarathi: string;
    titleEnglish: string;
    badgeColor: string;
    products: ProductItem[];
  }

  const sectionsToRender: RenderSection[] = [];

  if (recommendations.conditionalProducts.length > 0) {
    sectionsToRender.push({
      titleMarathi: '१. तपासणीनुसार विशेष शिफारसी',
      titleEnglish: 'Condition-based Recommendations',
      badgeColor: '#b45309', // Amber
      products: recommendations.conditionalProducts,
    });
  }

  sectionsToRender.push({
    titleMarathi: sectionsToRender.length === 0 ? '१. आवश्यक पोषण' : '२. आवश्यक पोषण',
    titleEnglish: 'Compulsory Nutrition',
    badgeColor: '#047857', // Emerald
    products: recommendations.compulsoryProducts,
  });

  sectionsToRender.push({
    titleMarathi: sectionsToRender.length === 1 ? '२. ऊर्जा व तंदुरुस्ती' : '३. ऊर्जा व तंदुरुस्ती',
    titleEnglish: 'Energy & Fitness',
    badgeColor: '#0f766e', // Teal
    products: recommendations.energyFitnessProducts,
  });

  // Calculate dynamic vertical layout based on total product rows
  let totalRows = 0;
  for (const sec of sectionsToRender) {
    totalRows += Math.ceil(sec.products.length / 3);
  }

  let imgMaxHeight = 65;
  let rowHeight = 112;
  let sectionGap = 16;

  if (totalRows <= 3) {
    imgMaxHeight = 75;
    rowHeight = 132;
    sectionGap = 22;
  } else if (totalRows === 4) {
    imgMaxHeight = 62;
    rowHeight = 110;
    sectionGap = 14;
  } else if (totalRows >= 5) {
    imgMaxHeight = 52;
    rowHeight = 96;
    sectionGap = 10;
  }

  let currentY = 118;
  const colWidth = 175; // 3 columns across 525 pt width
  const startX = 35;

  const wrapText = (text: string, maxWidth: number, fontSize: number): string[] => {
    ctx2.font = `bold ${fontSize}px "Noto Sans Devanagari", "Mukta", "Arial", sans-serif`;
    const words = text.split(' ');
    const lines: string[] = [];
    let curLine = '';

    for (const w of words) {
      const testLine = curLine ? `${curLine} ${w}` : w;
      if (ctx2.measureText(testLine).width > maxWidth && curLine) {
        lines.push(curLine);
        curLine = w;
      } else {
        curLine = testLine;
      }
    }
    if (curLine) lines.push(curLine);
    return lines;
  };

  for (const sec of sectionsToRender) {
    // Section Header Bar
    ctx2.save();
    ctx2.fillStyle = '#f1f5f9';
    ctx2.beginPath();
    ctx2.roundRect(35, currentY, 525, 20, 4);
    ctx2.fill();

    // Accent line on left of section header
    ctx2.fillStyle = sec.badgeColor;
    ctx2.fillRect(35, currentY, 4, 20);

    ctx2.fillStyle = '#0f172a';
    ctx2.font = 'bold 10px "Noto Sans Devanagari", "Mukta", "Arial", sans-serif';
    ctx2.textAlign = 'left';
    ctx2.textBaseline = 'middle';
    ctx2.fillText(`${sec.titleMarathi} (${sec.titleEnglish})`, 46, currentY + 10);
    ctx2.restore();

    currentY += 25;

    // Render Products in 3-column rows
    const prods = sec.products;
    for (let i = 0; i < prods.length; i += 3) {
      const rowProds = prods.slice(i, i + 3);

      for (let c = 0; c < rowProds.length; c++) {
        const prod = rowProds[c];
        const colCenterX = startX + c * colWidth + colWidth / 2;

        try {
          const img = await loadImage(prod.imagePath);

          // Calculate aspect-ratio preserved dimensions
          const aspect = img.width / img.height;
          let drawW = imgMaxHeight * aspect;
          let drawH = imgMaxHeight;

          if (drawW > colWidth - 24) {
            drawW = colWidth - 24;
            drawH = drawW / aspect;
          }

          const imgX = colCenterX - drawW / 2;
          const imgY = currentY + 4;

          // 1. Draw Transparent Cutout Image
          ctx2.drawImage(img, imgX, imgY, drawW, drawH);

          // 2. Draw Subtle Realistic Grounding Shadow at bottom
          const shadowY = imgY + drawH + 2;
          ctx2.save();
          const shadowGrad = ctx2.createRadialGradient(
            colCenterX,
            shadowY,
            1,
            colCenterX,
            shadowY,
            Math.min(drawW * 0.45, 36)
          );
          shadowGrad.addColorStop(0, 'rgba(15, 23, 42, 0.22)');
          shadowGrad.addColorStop(0.5, 'rgba(15, 23, 42, 0.07)');
          shadowGrad.addColorStop(1, 'rgba(15, 23, 42, 0)');
          ctx2.fillStyle = shadowGrad;
          ctx2.beginPath();
          ctx2.ellipse(colCenterX, shadowY, Math.min(drawW * 0.45, 36), 3.5, 0, 0, Math.PI * 2);
          ctx2.fill();

          // 3. Draw Subtle Mirror Reflection
          const reflH = Math.min(drawH * 0.22, 16);
          ctx2.beginPath();
          ctx2.rect(imgX, shadowY, drawW, reflH);
          ctx2.clip();
          ctx2.translate(0, shadowY * 2);
          ctx2.scale(1, -1);
          ctx2.globalAlpha = 0.1;
          ctx2.drawImage(img, imgX, shadowY, drawW, drawH);
          ctx2.restore();

          // 4. Product Name Typography
          const textStartY = shadowY + 8;
          const nameLines = wrapText(prod.name, colWidth - 14, 8.5);

          ctx2.fillStyle = '#0f172a';
          ctx2.textAlign = 'center';
          ctx2.textBaseline = 'top';
          ctx2.font = 'bold 8.5px "Noto Sans Devanagari", "Mukta", "Arial", sans-serif';

          for (let l = 0; l < Math.min(nameLines.length, 2); l++) {
            ctx2.fillText(nameLines[l], colCenterX, textStartY + l * 10.5);
          }

          if (prod.marathiName && nameLines.length < 2) {
            ctx2.fillStyle = '#047857';
            ctx2.font = '500 7.5px "Noto Sans Devanagari", "Mukta", "Arial", sans-serif';
            ctx2.fillText(prod.marathiName, colCenterX, textStartY + 11.5);
          }
        } catch (err) {
          console.warn(`[pdfGenerator] Could not render product image for ${prod.name}:`, err);
          ctx2.fillStyle = '#001a70';
          ctx2.font = 'bold 10px "Noto Sans Devanagari", "Mukta", "Arial", sans-serif';
          ctx2.textAlign = 'center';
          ctx2.fillText(prod.name, colCenterX, currentY + 30);
        }
      }

      currentY += rowHeight;
    }

    currentY += sectionGap;
  }

  // C. Page 2 Footer: EXACT SAME FOOTER AS PAGE 1 (source/reference: public/footer_exact.png from BAR.pdf)
  try {
    const footerImg = await loadImage('/footer_exact.png');
    ctx2.drawImage(footerImg, 26.6, 657.0, 543.1, 154.9);
  } catch (err) {
    console.warn('[pdfGenerator] Could not load footer_exact.png:', err);
  }

  // Convert both canvases directly to PNG buffers in parallel
  const [overlay1Bytes, overlay2Bytes] = await Promise.all([
    canvasToPngBytes(canvas1),
    canvasToPngBytes(canvas2),
  ]);

  // =============================================================
  // 4. Assemble Multi-Page PDF with pdf-lib
  // =============================================================
  const pdfDoc = await PDFDocument.load(templateBytes);

  // Embed both overlays in parallel
  const [overlayPng1, overlayPng2] = await Promise.all([
    pdfDoc.embedPng(overlay1Bytes),
    pdfDoc.embedPng(overlay2Bytes),
  ]);

  // Page 1
  const pages = pdfDoc.getPages();
  const page1 = pages[0];
  const { width: p1W, height: p1H } = page1.getSize();
  const mediaBox = page1.node.MediaBox();
  const originX = mediaBox ? (mediaBox.asArray()[0] as any)?.numberValue ?? 0 : 0;
  const originY = mediaBox ? (mediaBox.asArray()[1] as any)?.numberValue ?? 0 : 0;
  page1.drawImage(overlayPng1, {
    x: originX,
    y: originY,
    width: p1W,
    height: p1H,
  });

  // Page 2 (Suggestions)
  const page2 = pdfDoc.addPage([PDF_WIDTH_PT, PDF_HEIGHT_PT]);
  page2.drawImage(overlayPng2, {
    x: 0,
    y: 0,
    width: PDF_WIDTH_PT,
    height: PDF_HEIGHT_PT,
  });

  // 5. Serialize PDF
  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
  const blobUrl = URL.createObjectURL(blob);

  return { pdfBytes, blobUrl, qrDataUrl, pdfBlob: blob };
}
