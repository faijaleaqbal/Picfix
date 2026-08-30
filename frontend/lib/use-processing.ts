"use client";

/**
 * Shared processing hook used by every tool page.
 *
 * Owns the full upload→process→preview→download lifecycle:
 *  - selected file + client-side validation (size/type, 15MB cap)
 *  - loading state + error string (friendly copy, never a stack trace)
 *  - result blob / objectURL for the before/after preview
 *  - downloadFile() that saves the blob via <a download>
 *  - optional AI-stub awareness: 501 AI_NOT_IMPLEMENTED is surfaced as
 *    a distinct `aiPending` state so pages can show "coming soon" UI.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ApiError,
  downloadBlob,
  processAiJob,
  processImage,
  ProcessImageResult,
  TimeoutError,
} from "@/lib/api";
import { formatBytes, validateUpload } from "@/lib/config";

export interface ProcessingState {
  /** the selected input file (null until the user picks one) */
  file: File | null;
  /** user-facing validation error for the picked file */
  fileError: string | null;
  /** true while the request is in flight */
  processing: boolean;
  /** request failure message (friendly copy + backend text) */
  error: string | null;
  /** backend error code for special-casing (e.g. AI_NOT_IMPLEMENTED) */
  errorCode: string | null;
  /** AI stubs return 501 — present, but not a hard failure */
  aiPending: boolean;
  /** processing result */
  result: ProcessImageResult | null;
  /** object URL for <img src> preview of the result */
  resultUrl: string | null;
  /** original file object URL for the before/after preview */
  originalUrl: string | null;
  /** validated file-size formatted, e.g. "2.4 MB" */
  fileSizeLabel: string | null;
  /** attach a file (runs client-side validation) */
  selectFile: (file: File | null) => void;
  /** clear everything back to the idle state */
  reset: () => void;
  /** run the request */
  run: (endpoint: string, formData: FormData, timeoutMs?: number) => Promise<boolean>;
  /** run an async AI job (submit → poll status → fetch result) */
  runAi: (endpoint: string, formData: FormData, timeoutMs?: number) => Promise<boolean>;
  /** save the result to disk */
  download: () => void;
}

export function useProcessing(): ProcessingState {
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [aiPending, setAiPending] = useState(false);
  const [result, setResult] = useState<ProcessImageResult | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const resultBlobRef = useRef<Blob | null>(null);

  // Revoke object URLs on unmount / re-run.
  useEffect(() => {
    return () => {
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      if (originalUrl) URL.revokeObjectURL(originalUrl);
    };
  }, [resultUrl, originalUrl]);

  const selectFile = useCallback(
    (next: File | null) => {
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      if (originalUrl) URL.revokeObjectURL(originalUrl);
      setResult(null);
      setResultUrl(null);
      setOriginalUrl(null);
      setError(null);
      setErrorCode(null);
      setAiPending(false);
      if (!next) {
        setFile(null);
        setFileError(null);
        return;
      }
      const err = validateUpload(next);
      setFileError(err);
      if (!err) {
        setFile(next);
        setOriginalUrl(URL.createObjectURL(next));
      } else {
        setFile(null);
      }
    },
    [originalUrl, resultUrl]
  );

  const run = useCallback(
    async (endpoint: string, formData: FormData, timeoutMs?: number) => {
      if (!file) {
        setError("Select an image first.");
        return false;
      }
      setProcessing(true);
      setError(null);
      setErrorCode(null);
      setAiPending(false);
      try {
        const out = await processImage(endpoint, formData, { timeoutMs });
        if (resultUrl) URL.revokeObjectURL(resultUrl);
        resultBlobRef.current = out.blob;
        setResult(out);
        setResultUrl(URL.createObjectURL(out.blob));
        return true;
      } catch (err) {
        if (err instanceof ApiError) {
          setErrorCode(err.code);
          setError(err.message);
          if (err.code === "AI_NOT_IMPLEMENTED") setAiPending(true);
        } else if (err instanceof TimeoutError) {
          setErrorCode("TIMEOUT");
          setError(err.message);
        } else if (err instanceof Error) {
          setErrorCode("NETWORK");
          setError(err.message);
        } else {
          setErrorCode("UNKNOWN");
          setError("Unexpected error. Please try again.");
        }
        return false;
      } finally {
        setProcessing(false);
      }
    },
    [file, resultUrl]
  );

  const runAi = useCallback(
    async (endpoint: string, formData: FormData, timeoutMs?: number) => {
      if (!file) {
        setError("Select an image first.");
        return false;
      }
      setProcessing(true);
      setError(null);
      setErrorCode(null);
      setAiPending(false);
      try {
        const out = await processAiJob(endpoint, formData, { timeoutMs });
        if (resultUrl) URL.revokeObjectURL(resultUrl);
        resultBlobRef.current = out.blob;
        setResult(out as ProcessImageResult);
        if (out.blob.size > 0) setResultUrl(URL.createObjectURL(out.blob));
        return true;
      } catch (err) {
        if (err instanceof ApiError) {
          setErrorCode(err.code);
          setError(err.message);
          if (err.code === "AI_NOT_IMPLEMENTED" || err.code === "AI_UNAVAILABLE") setAiPending(true);
        } else if (err instanceof TimeoutError) {
          setErrorCode("TIMEOUT");
          setError(err.message);
        } else if (err instanceof Error) {
          setErrorCode("NETWORK");
          setError(err.message);
        } else {
          setErrorCode("UNKNOWN");
          setError("Unexpected error. Please try again.");
        }
        return false;
      } finally {
        setProcessing(false);
      }
    },
    [file, resultUrl]
  );

  const download = useCallback(() => {
    const out = result;
    if (!out) return;
    downloadBlob(out.blob, out.filename);
  }, [result]);

  const reset = useCallback(() => {
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    setFile(null);
    setFileError(null);
    setProcessing(false);
    setError(null);
    setErrorCode(null);
    setAiPending(false);
    setResult(null);
    setResultUrl(null);
    setOriginalUrl(null);
  }, [originalUrl, resultUrl]);

  return {
    file,
    fileError,
    processing,
    error,
    errorCode,
    aiPending,
    result,
    resultUrl,
    originalUrl,
    fileSizeLabel: file ? formatBytes(file.size) : null,
    selectFile,
    reset,
    run,
    runAi,
    download,
  };
}
