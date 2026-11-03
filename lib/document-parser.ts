"use client";

export const MAX_FILE_BYTES = 10 * 1024 * 1024;
export const MAX_EXTRACTED_CHARS = 60000;

export interface ExtractedDocument {
  text: string;
  fileName: string;
  pages?: number;
  truncated: boolean;
}

export async function extractDocumentText(file: File): Promise<ExtractedDocument> {
  if (file.size > MAX_FILE_BYTES) {
    throw new Error("File is larger than 10 MB. Upload a smaller document.");
  }

  const extension = file.name.split(".").pop()?.toLowerCase();
  let raw = "";

  if (extension === "txt" || file.type === "text/plain") {
    raw = await file.text();
  } else if (extension === "docx") {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
    raw = result.value;
  } else if (extension === "pdf" || file.type === "application/pdf") {
    const pdfjs = await import("pdfjs-dist");
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/build/pdf.worker.min.mjs",
      import.meta.url,
    ).toString();
    const document = await pdfjs.getDocument({
      data: new Uint8Array(await file.arrayBuffer()),
    }).promise;
    const pageCount = Math.min(document.numPages, 80);
    const pages: string[] = [];
    for (let page = 1; page <= pageCount; page++) {
      const pageProxy = await document.getPage(page);
      const content = await pageProxy.getTextContent();
      const text = content.items
        .map((item) => ("str" in item ? item.str : ""))
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();
      if (text) pages.push(text);
    }
    raw = pages.join("\n\n");
    const truncated = raw.length > MAX_EXTRACTED_CHARS;
    return {
      text: raw.slice(0, MAX_EXTRACTED_CHARS).trim(),
      fileName: file.name,
      pages: document.numPages,
      truncated,
    };
  } else {
    throw new Error("Unsupported file. Upload a PDF, DOCX or TXT document.");
  }

  const cleaned = raw.replace(/\u0000/g, "").replace(/[ \t]+\n/g, "\n").trim();
  if (!cleaned) {
    throw new Error("No readable text was found in this document.");
  }
  const truncated = cleaned.length > MAX_EXTRACTED_CHARS;
  return {
    text: cleaned.slice(0, MAX_EXTRACTED_CHARS),
    fileName: file.name,
    truncated,
  };
}
