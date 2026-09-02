import { PDFDocument, rgb, degrees, StandardFonts } from "pdf-lib";

/**
 * Creates a standard PDF Blob from a Uint8Array
 */
export function createPdfBlob(bytes: Uint8Array): Blob {
  return new Blob([bytes as unknown as BlobPart], { type: "application/pdf" });
}

/**
 * Merge multiple PDF files into a single PDF document
 */
export async function mergePdfs(files: File[]): Promise<Uint8Array> {
  const mergedPdf = await PDFDocument.create();

  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer);
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }

  return await mergedPdf.save();
}

/**
 * Split or extract specific page ranges from a PDF
 * ranges: e.g. "1-3, 5, 8-10" or "1,2,3"
 */
export async function splitPdf(file: File, pageRangesStr: string): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const srcPdf = await PDFDocument.load(arrayBuffer);
  const totalPages = srcPdf.getPageCount();

  const pagesToInclude = new Set<number>();
  const parts = pageRangesStr.split(",").map((s) => s.trim()).filter(Boolean);

  for (const part of parts) {
    if (part.includes("-")) {
      const [startStr, endStr] = part.split("-").map((s) => s.trim());
      const start = Math.max(1, parseInt(startStr, 10));
      const end = Math.min(totalPages, parseInt(endStr, 10));
      for (let i = start; i <= end; i++) {
        pagesToInclude.add(i - 1); // 0-indexed
      }
    } else {
      const pageNum = parseInt(part, 10);
      if (pageNum >= 1 && pageNum <= totalPages) {
        pagesToInclude.add(pageNum - 1);
      }
    }
  }

  if (pagesToInclude.size === 0) {
    throw new Error("No valid pages specified in page range");
  }

  const newPdf = await PDFDocument.create();
  const sortedIndices = Array.from(pagesToInclude).sort((a, b) => a - b);
  const copiedPages = await newPdf.copyPages(srcPdf, sortedIndices);
  copiedPages.forEach((page) => newPdf.addPage(page));

  return await newPdf.save();
}

/**
 * Rotate all or selected pages of a PDF by 90, 180, or 270 degrees
 */
export async function rotatePdf(file: File, rotationAngle: number): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer);
  const pages = pdf.getPages();

  for (const page of pages) {
    const currentRotation = page.getRotation().angle;
    page.setRotation(degrees((currentRotation + rotationAngle) % 360));
  }

  return await pdf.save();
}

/**
 * Remove specific pages from a PDF
 */
export async function removePdfPages(file: File, pagesToRemove1Indexed: number[]): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const srcPdf = await PDFDocument.load(arrayBuffer);
  const totalPages = srcPdf.getPageCount();

  const removeSet = new Set(pagesToRemove1Indexed);
  const keepIndices: number[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (!removeSet.has(i)) {
      keepIndices.push(i - 1);
    }
  }

  if (keepIndices.length === 0) {
    throw new Error("Cannot remove all pages from PDF");
  }

  const newPdf = await PDFDocument.create();
  const copiedPages = await newPdf.copyPages(srcPdf, keepIndices);
  copiedPages.forEach((page) => newPdf.addPage(page));

  return await newPdf.save();
}

/**
 * Add Page Numbers to PDF footer
 */
export async function addPageNumbersToPdf(
  file: File,
  position: "bottom-center" | "bottom-right" | "top-right" = "bottom-center"
): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const pages = pdf.getPages();
  const total = pages.length;

  pages.forEach((page, idx) => {
    const { width, height } = page.getSize();
    const text = `Page ${idx + 1} of ${total}`;
    const textSize = 10;
    const textWidth = font.widthOfTextAtSize(text, textSize);

    let x = (width - textWidth) / 2;
    let y = 20;

    if (position === "bottom-right") {
      x = width - textWidth - 30;
      y = 20;
    } else if (position === "top-right") {
      x = width - textWidth - 30;
      y = height - 25;
    }

    page.drawText(text, {
      x,
      y,
      size: textSize,
      font,
      color: rgb(0.3, 0.3, 0.3),
    });
  });

  return await pdf.save();
}

/**
 * Watermark PDF pages with diagonal text
 */
export async function watermarkPdfDoc(
  file: File,
  text: string,
  opacity: number = 0.3
): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer);
  const font = await pdf.embedFont(StandardFonts.HelveticaBold);
  const pages = pdf.getPages();

  pages.forEach((page) => {
    const { width, height } = page.getSize();
    const textSize = Math.min(width, height) / 8;
    const textWidth = font.widthOfTextAtSize(text, textSize);

    page.drawText(text, {
      x: width / 2 - textWidth / 2,
      y: height / 2,
      size: textSize,
      font,
      color: rgb(0.7, 0.7, 0.7),
      opacity,
      rotate: degrees(45),
    });
  });

  return await pdf.save();
}

/**
 * Compress PDF by recreating streams and optimizing object graphs
 */
export async function compressPdfDoc(file: File): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer);
  // pdf-lib optimizes unused objects and compresses streams on save
  return await pdf.save({ useObjectStreams: true });
}

/**
 * Sign PDF by stamping a signature image
 */
export async function signPdfDoc(
  pdfFile: File,
  signatureImageFile: File,
  pageNumber1Indexed: number = 1
): Promise<Uint8Array> {
  const pdfBuffer = await pdfFile.arrayBuffer();
  const pdf = await PDFDocument.load(pdfBuffer);

  const sigBuffer = await signatureImageFile.arrayBuffer();
  let sigImage;
  if (signatureImageFile.type.includes("png")) {
    sigImage = await pdf.embedPng(sigBuffer);
  } else {
    sigImage = await pdf.embedJpg(sigBuffer);
  }

  const pages = pdf.getPages();
  const pageIndex = Math.max(0, Math.min(pages.length - 1, pageNumber1Indexed - 1));
  const targetPage = pages[pageIndex];

  const sigDims = sigImage.scale(0.3);
  targetPage.drawImage(sigImage, {
    x: targetPage.getWidth() - sigDims.width - 40,
    y: 40,
    width: sigDims.width,
    height: sigDims.height,
  });

  return await pdf.save();
}

/**
 * Crop PDF margins
 */
export async function cropPdfDoc(file: File, marginPoints: number = 36): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer);
  const pages = pdf.getPages();

  for (const page of pages) {
    const { width, height } = page.getSize();
    const newWidth = Math.max(50, width - marginPoints * 2);
    const newHeight = Math.max(50, height - marginPoints * 2);
    page.setCropBox(marginPoints, marginPoints, newWidth, newHeight);
  }

  return await pdf.save();
}

/**
 * Reorder and organize PDF pages
 */
export async function reorderPdfPages(file: File, newOrder1Indexed: number[]): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const srcPdf = await PDFDocument.load(arrayBuffer);
  const totalPages = srcPdf.getPageCount();

  const validIndices = newOrder1Indexed
    .filter((n) => n >= 1 && n <= totalPages)
    .map((n) => n - 1);

  if (validIndices.length === 0) {
    throw new Error("Invalid page sequence specified.");
  }

  const newPdf = await PDFDocument.create();
  const copiedPages = await newPdf.copyPages(srcPdf, validIndices);
  copiedPages.forEach((p) => newPdf.addPage(p));

  return await newPdf.save();
}

/**
 * Read PDF Metadata
 */
export async function readPdfMetadata(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer);
  return {
    title: pdf.getTitle() || "",
    author: pdf.getAuthor() || "",
    subject: pdf.getSubject() || "",
    keywords: pdf.getKeywords() || "",
    pageCount: pdf.getPageCount(),
  };
}

/**
 * Update PDF Metadata
 */
export async function updatePdfMetadata(
  file: File,
  meta: { title?: string; author?: string; subject?: string; keywords?: string }
): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer);

  if (meta.title !== undefined) pdf.setTitle(meta.title);
  if (meta.author !== undefined) pdf.setAuthor(meta.author);
  if (meta.subject !== undefined) pdf.setSubject(meta.subject);
  if (meta.keywords !== undefined) {
    pdf.setKeywords(meta.keywords.split(",").map((s) => s.trim()).filter(Boolean));
  }

  return await pdf.save();
}
