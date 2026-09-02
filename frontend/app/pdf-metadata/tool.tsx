"use client";

import { useState } from "react";
import { Download, FileText, Info } from "lucide-react";
import { updatePdfMetadata, readPdfMetadata, createPdfBlob } from "@/lib/pdf-tools";
import { formatBytes } from "@/lib/config";

export function PdfMetadataTool() {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [subject, setSubject] = useState("");
  const [keywords, setKeywords] = useState("");
  const [processing, setProcessing] = useState(false);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      setFile(f);
      setResultBlob(null);
      try {
        const meta = await readPdfMetadata(f);
        setTitle(meta.title);
        setAuthor(meta.author);
        setSubject(meta.subject);
        setKeywords(meta.keywords);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleSave = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const updatedBytes = await updatePdfMetadata(file, { title, author, subject, keywords });
      setResultBlob(createPdfBlob(updatedBytes));
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Failed to update PDF metadata.");
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!resultBlob || !file) return;
    const url = URL.createObjectURL(resultBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `metadata-updated-${file.name}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <div className="flex flex-col gap-4 lg:col-span-8">
        {!file ? (
          <div className="rounded-md border-[3px] border-dashed border-[#9da0d9] bg-white p-8 text-center hover:border-[#4449A6]">
            <input
              type="file"
              accept=".pdf,application/pdf"
              id="pdf-meta-upload"
              className="hidden"
              onChange={handleFile}
            />
            <p className="mb-3 text-base font-medium text-[#6e6e6e]">
              Select a PDF file to edit metadata properties
            </p>
            <label
              htmlFor="pdf-meta-upload"
              className="btnsel inline-flex cursor-pointer items-center justify-center gap-2"
            >
              <span>Select PDF File</span>
            </label>
          </div>
        ) : (
          <div className="rounded-md border border-[#d9dcea] bg-white p-6">
            <div className="flex items-center gap-3">
              <FileText className="size-8 text-red-500" />
              <div>
                <h4 className="text-sm font-bold text-[#2b2f52]">{file.name}</h4>
                <span className="text-xs text-gray-500">{formatBytes(file.size)}</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-bold uppercase text-gray-600">
                  Document Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Annual Report 2026"
                  className="w-full rounded border border-gray-300 p-2 text-sm font-medium outline-none focus:border-[#4449A6]"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase text-gray-600">
                  Author
                </label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full rounded border border-gray-300 p-2 text-sm font-medium outline-none focus:border-[#4449A6]"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase text-gray-600">
                  Subject
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Financial Statements"
                  className="w-full rounded border border-gray-300 p-2 text-sm font-medium outline-none focus:border-[#4449A6]"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase text-gray-600">
                  Keywords (comma-separated)
                </label>
                <input
                  type="text"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="e.g. report, audit, 2026"
                  className="w-full rounded border border-gray-300 p-2 text-sm font-medium outline-none focus:border-[#4449A6]"
                />
              </div>
            </div>

            {resultBlob ? (
              <div className="mt-6 rounded-md border border-[#e3e4ef] bg-[#fafbfe] p-6 text-center">
                <span className="inline-block rounded-full bg-[#e6f5ec] px-3 py-1 text-xs font-bold text-[#1d7a44]">
                  ✓ Metadata Successfully Updated
                </span>
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="inline-flex items-center gap-2 rounded bg-[#047e73] px-6 py-2.5 text-sm font-bold text-white shadow hover:bg-[#036960]"
                  >
                    <Download className="size-4" />
                    Download Updated PDF
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>

      <div className="sticky top-20 flex h-fit flex-col gap-4 rounded-md border border-[#d9dcea] bg-white p-5 lg:col-span-4">
        <h3 className="border-b border-[#e3e4ef] pb-3 text-base font-bold text-[#2b2f52]">
          PDF Metadata
        </h3>
        <p className="text-xs leading-relaxed text-[#6e7288]">
          View and modify internal metadata tags of PDF documents (Title, Author, Subject, and Keywords) for better indexing and SEO.
        </p>

        <button
          type="button"
          disabled={!file || processing}
          onClick={handleSave}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded bg-[#4956a5] py-2.5 font-bold text-white shadow hover:bg-[#3d4890] disabled:opacity-50"
        >
          <Info className="size-4" />
          {processing ? "Saving..." : "Save Metadata"}
        </button>
      </div>
    </div>
  );
}
