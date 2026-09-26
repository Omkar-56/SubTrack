import { useState, useRef, useEffect } from 'react';
import { api } from '../api/client';
import { formatMoney } from '../utils/date';

export default function ReceiptParserModal({ isOpen, onClose, onParsed }) {
  const [tab, setTab] = useState('upload'); // 'upload' | 'text'
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [pastedText, setPastedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressStatus, setProgressStatus] = useState('');
  const [error, setError] = useState('');
  const [successResult, setSuccessResult] = useState(null);

  const fileInputRef = useRef(null);

  // Reset state when opening/closing
  useEffect(() => {
    if (!isOpen) {
      setFile(null);
      setPreviewUrl('');
      setPastedText('');
      setIsProcessing(false);
      setProgress(0);
      setProgressStatus('');
      setError('');
      setSuccessResult(null);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && !isProcessing) {
        onClose();
      }
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, isProcessing, onClose]);

  if (!isOpen) return null;

  function handleFileChange(e) {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (selected.size > 15 * 1024 * 1024) {
      setError('File size too large (maximum 15MB allowed).');
      return;
    }

    setFile(selected);
    setError('');

    if (selected.type.startsWith('image/')) {
      const url = URL.createObjectURL(selected);
      setPreviewUrl(url);
    } else {
      setPreviewUrl('');
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) {
      if (dropped.size > 15 * 1024 * 1024) {
        setError('File size too large (maximum 15MB allowed).');
        return;
      }
      setFile(dropped);
      setError('');
      if (dropped.type.startsWith('image/')) {
        const url = URL.createObjectURL(dropped);
        setPreviewUrl(url);
      } else {
        setPreviewUrl('');
      }
    }
  }

  function readFileAsBase64(f) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        // strip data:...;base64,
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(f);
    });
  }

  async function handleParse() {
    setError('');
    setIsProcessing(true);
    setProgress(15);
    setProgressStatus('Reading document data…');

    try {
      let fileBase64 = null;
      let mimeType = null;
      let textToSend = pastedText;

      if (tab === 'upload') {
        if (!file) {
          throw new Error('Please select a file to upload first.');
        }

        mimeType = file.type || 'application/octet-stream';
        setProgress(30);
        setProgressStatus('Encoding document for Gemini AI analysis…');

        // Check if plain text/docx or binary
        if (
          file.type.startsWith('image/') ||
          file.type === 'application/pdf'
        ) {
          fileBase64 = await readFileAsBase64(file);
        } else {
          // Plain text / markdown / csv / etc.
          const text = await file.text();
          textToSend = text;
        }
      } else {
        if (!pastedText.trim()) {
          throw new Error('Please paste your receipt or invoice text.');
        }
      }

      // Animate progress smoothly while Gemini backend analyzes
      setProgress(50);
      setProgressStatus('Analyzing receipt with Gemini LLM…');

      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 85) {
            clearInterval(progressInterval);
            return 85;
          }
          return prev + 5;
        });
      }, 400);

      const response = await api.parseReceipt({
        text: textToSend,
        fileBase64,
        mimeType,
      });

      clearInterval(progressInterval);
      setProgress(95);
      setProgressStatus('Creating subscriptions in your account…');

      setTimeout(() => {
        setProgress(100);
        setProgressStatus('Successfully parsed & imported!');
        setIsProcessing(false);
        setSuccessResult(response);
        if (onParsed) onParsed(response.subscriptions);
      }, 400);
    } catch (err) {
      setIsProcessing(false);
      setProgress(0);
      setProgressStatus('');
      setError(err.message || 'Failed to parse receipt.');
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-ink/40 backdrop-blur-xs transition-opacity"
        onClick={() => {
          if (!isProcessing) onClose();
        }}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg rounded-md border border-line bg-white shadow-xl flex flex-col max-h-[90vh] z-10 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-stone-100 text-ink border border-line/60">
              <svg className="h-4 w-4 text-ink/75" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </span>
            <div>
              <h2 className="font-display text-base sm:text-lg font-semibold text-ink">
                AI Receipt & Invoice Parser
              </h2>
              <p className="text-xs text-ink/50">
                Auto-extract subscriptions using Gemini LLM
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="text-ink/40 hover:text-ink text-xl font-light p-1 rounded hover:bg-stone-100 disabled:opacity-40 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Success State View */}
          {successResult ? (
            <div className="space-y-4 text-center py-2">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="font-display text-base font-semibold text-ink">
                  Parsing Completed Successfully!
                </h3>
                <p className="text-xs text-ink/60 mt-1">
                  Gemini created{' '}
                  <strong className="text-ink font-semibold">
                    {successResult.subscriptions?.length || 0}
                  </strong>{' '}
                  {successResult.subscriptions?.length === 1 ? 'subscription' : 'subscriptions'}{' '}
                  in your ledger.
                </p>
              </div>

              {/* Parsed subscriptions list summary */}
              {successResult.subscriptions?.length > 0 && (
                <div className="mt-3 divide-y divide-line/60 rounded border border-line bg-paper/40 text-left">
                  {successResult.subscriptions.map((s) => (
                    <div key={s.id} className="p-3 flex items-center justify-between gap-3 text-xs">
                      <div>
                        <p className="font-semibold text-ink">{s.name}</p>
                        <p className="text-[11px] text-ink/50">
                          {s.category} · Next: {s.nextRenewalDate} · {s.billingCycle}
                          {s.isFreeTrial && ' · Free Trial'}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-display font-bold text-ink">
                          {formatMoney(s.amount, s.currency)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={onClose}
                className="w-full mt-4 rounded bg-ledger py-2 text-xs font-semibold text-white hover:bg-ledger-dark transition-colors cursor-pointer"
              >
                Done & View Subscriptions
              </button>
            </div>
          ) : (
            <>
              {/* Tab Selector */}
              <div className="flex border-b border-line text-xs font-medium">
                <button
                  type="button"
                  onClick={() => {
                    setTab('upload');
                    setError('');
                  }}
                  disabled={isProcessing}
                  className={`pb-2.5 px-3 border-b-2 transition-colors cursor-pointer ${
                    tab === 'upload'
                      ? 'border-ledger text-ink font-semibold'
                      : 'border-transparent text-ink/50 hover:text-ink'
                  }`}
                >
                  Upload File (PDF / Image / Doc)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTab('text');
                    setError('');
                  }}
                  disabled={isProcessing}
                  className={`pb-2.5 px-3 border-b-2 transition-colors cursor-pointer ${
                    tab === 'text'
                      ? 'border-ledger text-ink font-semibold'
                      : 'border-transparent text-ink/50 hover:text-ink'
                  }`}
                >
                  Paste Receipt Text
                </button>
              </div>

              {/* Tab 1: Upload File */}
              {tab === 'upload' && (
                <div className="space-y-3">
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center border-2 border-dashed border-line rounded-md p-6 text-center hover:border-ledger/50 bg-stone-50/50 hover:bg-stone-50 transition-colors cursor-pointer"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,application/pdf,.doc,.docx,.txt"
                      className="hidden"
                      onChange={handleFileChange}
                      disabled={isProcessing}
                    />

                    {previewUrl ? (
                      <div className="relative group max-h-40 overflow-hidden rounded border border-line">
                        <img
                          src={previewUrl}
                          alt="Receipt Preview"
                          className="max-h-40 object-contain mx-auto"
                        />
                      </div>
                    ) : (
                      <>
                        <svg className="h-9 w-9 mb-2 text-ink/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="text-xs font-medium text-ink">
                          {file ? file.name : 'Click to select or drag and drop a receipt'}
                        </p>
                        <p className="text-[11px] text-ink/40 mt-1">
                          Screenshots, PNG, JPG, PDF, Word documents (up to 15MB)
                        </p>
                      </>
                    )}

                    {file && (
                      <span className="mt-2 text-[11px] font-semibold text-ledger">
                        Selected: {file.name} ({(file.size / 1024).toFixed(0)} KB)
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Tab 2: Paste Raw Text */}
              {tab === 'text' && (
                <div>
                  <label className="text-xs font-medium text-ink/70">
                    Paste email confirmation, invoice lines, or SMS alert:
                  </label>
                  <textarea
                    rows={6}
                    value={pastedText}
                    onChange={(e) => setPastedText(e.target.value)}
                    disabled={isProcessing}
                    placeholder="e.g. Thanks for your Netflix subscription payment of $15.99 on Oct 25, 2026. Next billing date: Nov 25, 2026..."
                    className="mt-1.5 w-full rounded border border-line bg-paper/30 p-2.5 text-xs text-ink outline-none focus:border-ledger font-mono"
                  />
                </div>
              )}

              {/* Progress Bar & Status (Live during backend execution) */}
              {isProcessing && (
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-ink flex items-center gap-1.5">
                      <span className="inline-block h-2 w-2 rounded-full bg-amber animate-ping" />
                      {progressStatus}
                    </span>
                    <span className="tabular font-semibold text-ink/60">{progress}%</span>
                  </div>
                  {/* Progress Bar Container */}
                  <div className="h-2 w-full overflow-hidden rounded-full bg-stone-100 border border-line/40">
                    <div
                      className="h-full bg-gradient-to-r from-amber to-ledger transition-all duration-300 rounded-full"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              {error && (
                <div className="rounded bg-rust/10 border border-rust/30 p-2.5 text-xs text-rust">
                  {error}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Actions */}
        {!successResult && (
          <div className="border-t border-line px-5 py-3 flex items-center justify-end gap-2 bg-stone-50/50">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="rounded px-3 py-1.5 text-xs font-medium text-ink/70 hover:bg-stone-200/50 transition-colors disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleParse}
              disabled={isProcessing || (tab === 'upload' && !file) || (tab === 'text' && !pastedText.trim())}
              className="flex items-center gap-1.5 rounded bg-ledger px-4 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-ledger-dark transition-colors disabled:opacity-50 cursor-pointer"
            >
              <span>{isProcessing ? 'Parsing…' : 'Parse & Add with Gemini'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
