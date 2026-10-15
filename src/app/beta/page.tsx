"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  BETA_CHECKLIST_DEFINITIONS,
  BetaChecklistState,
  BetaChecklistStatus,
  calculateBetaChecklistMetrics,
  loadBetaChecklist,
  resetBetaChecklist,
  updateBetaChecklistItem,
} from "@/lib/feed/betaChecklist";
import { generateBetaReport, BetaReportPayload } from "@/lib/feed/betaReport";
import { ProductFeedbackModal } from "@/components/feedback/ProductFeedbackModal";

export default function BetaTestingPage() {
  const [checklist, setChecklist] = useState<BetaChecklistState | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [includeDiagnostics, setIncludeDiagnostics] = useState(false);
  const [reportPayload, setReportPayload] = useState<BetaReportPayload | null>(null);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);

  // Load checklist on mount
  useEffect(() => {
    const loaded = loadBetaChecklist();
    setChecklist(loaded);
  }, []);

  // Update report payload when options or checklist changes
  useEffect(() => {
    if (showReportModal && checklist) {
      const generated = generateBetaReport({
        includeDiagnostics,
        checklistState: checklist,
      });
      setReportPayload(generated);
    }
  }, [showReportModal, includeDiagnostics, checklist]);

  const handleStatusChange = (id: string, status: BetaChecklistStatus) => {
    const existing = checklist?.items[id];
    const updated = updateBetaChecklistItem(id, {
      status,
      note: existing?.note,
    });
    setChecklist({ ...updated });
  };

  const handleNoteChange = (id: string, note: string) => {
    const existing = checklist?.items[id];
    if (!existing) return;
    const updated = updateBetaChecklistItem(id, {
      status: existing.status,
      note,
    });
    setChecklist({ ...updated });
  };

  const handleExecuteReset = () => {
    const blank = resetBetaChecklist();
    setChecklist(blank);
    setShowResetConfirm(false);
  };

  const handleCopyReport = async () => {
    if (!reportPayload) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(reportPayload, null, 2));
      setCopyStatus("✓ Copied JSON to clipboard!");
      setTimeout(() => setCopyStatus(null), 3000);
    } catch {
      setCopyStatus("Failed to copy");
      setTimeout(() => setCopyStatus(null), 3000);
    }
  };

  const handleDownloadReport = () => {
    if (!reportPayload) return;
    const blob = new Blob([JSON.stringify(reportPayload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `feedsmith-beta-report-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!checklist) {
    return (
      <main className="min-h-screen bg-[#070709] px-4 py-12 text-white flex items-center justify-center">
        <div className="text-xs text-white/50">Loading beta testing checklist...</div>
      </main>
    );
  }

  const metrics = calculateBetaChecklistMetrics(checklist);

  return (
    <main className="min-h-screen bg-[#070709] px-4 py-10 text-white sm:px-6 lg:px-8">
      {/* Product Feedback Modal */}
      <ProductFeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
      />

      {/* Export Report Modal */}
      <AnimatePresence>
        {showReportModal && reportPayload && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
            onClick={() => setShowReportModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/15 bg-[#0e0a1f] p-6 shadow-2xl ring-1 ring-violet-500/20 backdrop-blur-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-white">Local Beta Testing Report</span>
                  <span className="rounded-full bg-violet-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-violet-300">
                    Versioned JSON
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 text-sm text-white/50 hover:bg-white/15 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="mt-4 space-y-4">
                <p className="text-xs text-white/70 leading-relaxed">
                  This report summarizes your testing findings, passed/failed checklist items, failure notes, and submitted product feedback. It contains <strong className="text-white">no personal data</strong> and is ready to share directly with the developer.
                </p>

                {/* Diagnostics Toggle */}
                <div className="rounded-xl border border-white/10 bg-black/30 p-3.5 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-white">
                      Include Diagnostic Profile Summary
                    </div>
                    <div className="text-[11px] text-white/50">
                      Includes platform, total interests count, and action count (no personal history).
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeDiagnostics}
                      onChange={e => setIncludeDiagnostics(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-violet-600"></div>
                  </label>
                </div>

                {/* Summary Badges */}
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="rounded-lg border border-white/10 bg-black/20 p-2">
                    <div className="text-xs text-white/50 font-mono">Passed</div>
                    <div className="text-sm font-bold text-emerald-400 font-mono">
                      {reportPayload.summary.passedCount}
                    </div>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-black/20 p-2">
                    <div className="text-xs text-white/50 font-mono">Failed</div>
                    <div className="text-sm font-bold text-rose-400 font-mono">
                      {reportPayload.summary.failedCount}
                    </div>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-black/20 p-2">
                    <div className="text-xs text-white/50 font-mono">Unfinished</div>
                    <div className="text-sm font-bold text-white/60 font-mono">
                      {reportPayload.summary.unfinishedCount}
                    </div>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-black/20 p-2">
                    <div className="text-xs text-white/50 font-mono">Feedback</div>
                    <div className="text-sm font-bold text-violet-300 font-mono">
                      {reportPayload.productFeedback.length}
                    </div>
                  </div>
                </div>

                {/* JSON Preview */}
                <div>
                  <div className="text-xs font-semibold text-white/70 mb-1">
                    Report Preview (JSON)
                  </div>
                  <pre className="max-h-56 overflow-auto rounded-xl border border-white/10 bg-black/50 p-3 font-mono text-[11px] text-violet-200">
                    {JSON.stringify(reportPayload, null, 2)}
                  </pre>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
                  {copyStatus ? (
                    <span className="text-xs font-bold text-emerald-400 animate-fade-in">
                      {copyStatus}
                    </span>
                  ) : <div />}

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleCopyReport}
                      className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/10"
                    >
                      📋 Copy JSON
                    </button>
                    <button
                      type="button"
                      onClick={handleDownloadReport}
                      className="rounded-xl bg-violet-600 px-5 py-2 text-xs font-bold text-white transition hover:bg-violet-500 shadow-md shadow-violet-600/30"
                    >
                      Download Report (.json)
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mx-auto max-w-5xl space-y-8">
        {/* Navigation & Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#0c0817]/75 p-5 shadow-2xl backdrop-blur-xl">
          <div>
            <div className="flex items-center gap-3">
              <Link
                href="/build/profile"
                className="text-xs font-semibold uppercase tracking-wider text-violet-400 hover:text-white transition flex items-center gap-1.5"
              >
                ← Back to Daily Mission
              </Link>
              <span className="text-white/20">|</span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-violet-300 font-mono">
                🧪 Quality Lab
              </span>
            </div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Beta Testing & Product Evaluation
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setShowFeedbackModal(true)}
              className="rounded-xl border border-violet-500/30 bg-violet-600/20 px-4 py-2 text-xs font-semibold text-violet-200 transition hover:bg-violet-600/30 hover:border-violet-400"
            >
              💬 Submit Product Feedback
            </button>
            <button
              type="button"
              onClick={() => setShowReportModal(true)}
              className="rounded-xl bg-violet-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-violet-600/30 transition hover:bg-violet-500"
            >
              Export Beta Report ↗
            </button>
          </div>
        </div>

        {/* Progress & Overview Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-[#0c0817]/60 p-5 shadow-xl backdrop-blur-md">
            <span className="text-xs font-medium text-white/50">Completion</span>
            <div className="mt-2 text-3xl font-extrabold text-white font-mono">
              {metrics.completionPercent}%
            </div>
            <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full bg-gradient-to-r from-violet-600 to-emerald-400 transition-all duration-300"
                style={{ width: `${metrics.completionPercent}%` }}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#0c0817]/60 p-5 shadow-xl backdrop-blur-md">
            <span className="text-xs font-medium text-emerald-400">Passed Checks</span>
            <div className="mt-2 text-3xl font-extrabold text-white font-mono">
              {metrics.passed} / {metrics.total}
            </div>
            <p className="mt-1 text-[11px] text-white/50">Explicitly confirmed</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#0c0817]/60 p-5 shadow-xl backdrop-blur-md">
            <span className="text-xs font-medium text-rose-400">Failed Checks</span>
            <div className="mt-2 text-3xl font-extrabold text-white font-mono">
              {metrics.failed} / {metrics.total}
            </div>
            <p className="mt-1 text-[11px] text-white/50">Requiring attention</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#0c0817]/60 p-5 shadow-xl backdrop-blur-md">
            <span className="text-xs font-medium text-white/50">Pending / Untested</span>
            <div className="mt-2 text-3xl font-extrabold text-white font-mono">
              {metrics.notTested}
            </div>
            <p className="mt-1 text-[11px] text-white/50">To be validated</p>
          </div>
        </div>

        {/* Beta Checklist Section */}
        <div className="rounded-2xl border border-white/10 bg-[#0c0817]/60 p-6 shadow-xl backdrop-blur-md space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-violet-400 font-mono">
                12-Point Verification Protocol
              </span>
              <h2 className="mt-1 text-lg font-bold text-white">
                Beta Evaluation Checklist
              </h2>
            </div>
            {showResetConfirm ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-amber-300">Reset checklist only?</span>
                <button
                  type="button"
                  onClick={handleExecuteReset}
                  className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-amber-500 transition"
                >
                  Confirm Reset
                </button>
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(false)}
                  className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white hover:bg-white/10"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowResetConfirm(true)}
                className="rounded-xl border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-white/60 hover:text-white hover:bg-white/10 transition"
              >
                Reset Checklist ↺
              </button>
            )}
          </div>

          <div className="space-y-4">
            {BETA_CHECKLIST_DEFINITIONS.map(def => {
              const itemState = checklist.items[def.id] || { id: def.id, status: "not_tested" };
              const isPassed = itemState.status === "passed";
              const isFailed = itemState.status === "failed";

              return (
                <div
                  key={def.id}
                  className={`rounded-xl border p-4 transition-all duration-200 ${
                    isPassed
                      ? "border-emerald-500/30 bg-emerald-950/10"
                      : isFailed
                      ? "border-rose-500/30 bg-rose-950/10"
                      : "border-white/10 bg-[#0d091e]/50 hover:border-white/20"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-white">
                          {def.title}
                        </span>
                        <Link
                          href={def.suggestedRoute}
                          className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-mono text-violet-300 hover:text-white hover:bg-white/10 transition"
                        >
                          Test Route: {def.suggestedRoute} →
                        </Link>
                      </div>
                      <p className="text-xs text-white/60 leading-relaxed">
                        {def.description}
                      </p>
                    </div>

                    {/* Status Selectors */}
                    <div className="flex items-center gap-1.5 shrink-0 rounded-xl border border-white/10 bg-black/40 p-1">
                      <button
                        type="button"
                        onClick={() => handleStatusChange(def.id, "not_tested")}
                        className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                          itemState.status === "not_tested"
                            ? "bg-white/15 text-white shadow-sm"
                            : "text-white/40 hover:text-white"
                        }`}
                      >
                        Not Tested
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStatusChange(def.id, "passed")}
                        className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                          isPassed
                            ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                            : "text-emerald-400/60 hover:text-emerald-300 hover:bg-emerald-500/10"
                        }`}
                      >
                        Passed ✓
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStatusChange(def.id, "failed")}
                        className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                          isFailed
                            ? "bg-rose-600 text-white shadow-md shadow-rose-600/30"
                            : "text-rose-400/60 hover:text-rose-300 hover:bg-rose-500/10"
                        }`}
                      >
                        Failed ✕
                      </button>
                    </div>
                  </div>

                  {/* Failure Note input if marked failed */}
                  {isFailed && (
                    <div className="mt-3.5 border-t border-rose-500/20 pt-3">
                      <label
                        htmlFor={`note-${def.id}`}
                        className="block text-[11px] font-bold uppercase tracking-wider text-rose-300 mb-1"
                      >
                        Failure Notes & Reproduction Context:
                      </label>
                      <textarea
                        id={`note-${def.id}`}
                        value={itemState.note || ""}
                        onChange={e => handleNoteChange(def.id, e.target.value)}
                        placeholder="Explain what went wrong, unexpected behavior, or usability gap..."
                        rows={2}
                        className="w-full rounded-lg border border-rose-500/30 bg-black/40 p-2.5 text-xs text-white placeholder-rose-200/30 focus:border-rose-400 focus:outline-none"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}

