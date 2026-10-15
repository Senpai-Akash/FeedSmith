"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  PRODUCT_FEEDBACK_CATEGORIES,
  CATEGORY_LABELS,
  ProductFeedbackCategory,
  ProductFeedbackItem,
  submitProductFeedback,
  loadProductFeedback,
  deleteProductFeedback,
} from "@/lib/feed/productFeedback";

interface ProductFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCategory?: ProductFeedbackCategory;
}

export function ProductFeedbackModal({
  isOpen,
  onClose,
  defaultCategory = "confusing_instructions",
}: ProductFeedbackModalProps) {
  const pathname = usePathname();
  const [tab, setTab] = useState<"submit" | "history">("submit");
  const [category, setCategory] = useState<ProductFeedbackCategory>(defaultCategory);
  const [description, setDescription] = useState("");
  const [rating, setRating] = useState<number | undefined>(undefined);
  const [submittedMessage, setSubmittedMessage] = useState<string | null>(null);
  const [historyItems, setHistoryItems] = useState<ProductFeedbackItem[]>([]);

  // Refresh history items whenever modal opens or tab changes
  useEffect(() => {
    if (isOpen) {
      const store = loadProductFeedback();
      setHistoryItems(store.items);
      setSubmittedMessage(null);
    }
  }, [isOpen, tab]);

  // Close modal on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = submitProductFeedback({
      category,
      description: description.trim() || undefined,
      rating,
      route: pathname || "/",
    });

    if (result) {
      setSubmittedMessage("✓ Feedback saved locally on your device! FeedSmith never transmits your feedback to external servers.");
      setDescription("");
      setRating(undefined);
      const store = loadProductFeedback();
      setHistoryItems(store.items);
    }
  };

  const handleDelete = (id: string) => {
    deleteProductFeedback(id);
    const store = loadProductFeedback();
    setHistoryItems(store.items);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/15 bg-[#0e0a1f] p-6 shadow-2xl ring-1 ring-violet-500/20 backdrop-blur-2xl text-white"
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="feedback-modal-title"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-white" id="feedback-modal-title">
                  Product Feedback & Usability
                </span>
                <span className="rounded-full bg-violet-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-violet-300">
                  Local-Only
                </span>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close feedback modal"
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 text-sm text-white/50 transition hover:bg-white/15 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="mt-4 flex gap-1 rounded-xl border border-white/10 bg-black/30 p-1">
              <button
                type="button"
                onClick={() => setTab("submit")}
                className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition ${
                  tab === "submit" ? "bg-violet-600 text-white shadow-sm" : "text-white/60 hover:text-white"
                }`}
              >
                Submit Feedback
              </button>
              <button
                type="button"
                onClick={() => setTab("history")}
                className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition ${
                  tab === "history" ? "bg-violet-600 text-white shadow-sm" : "text-white/60 hover:text-white"
                }`}
              >
                Your Feedback ({historyItems.length})
              </button>
            </div>

            {/* Tab: Submit */}
            {tab === "submit" && (
              <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                {submittedMessage && (
                  <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs leading-relaxed text-emerald-300 font-medium">
                    {submittedMessage}
                  </div>
                )}

                {/* Category Selection */}
                <div>
                  <label htmlFor="feedback-category" className="block text-xs font-semibold text-white/70 mb-1.5">
                    What best describes your experience?
                  </label>
                  <select
                    id="feedback-category"
                    value={category}
                    onChange={e => setCategory(e.target.value as ProductFeedbackCategory)}
                    className="w-full rounded-xl border border-white/15 bg-[#140e2d] px-3.5 py-2.5 text-xs text-white focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  >
                    {PRODUCT_FEEDBACK_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>
                        {CATEGORY_LABELS[cat]}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Star / Numeric Experience Rating */}
                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1.5">
                    Experience Rating (Optional)
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(rating === star ? undefined : star)}
                        className={`flex h-9 w-9 items-center justify-center rounded-xl border text-xs font-bold transition ${
                          rating !== undefined && star <= rating
                            ? "border-amber-400 bg-amber-400/20 text-amber-300 shadow-sm"
                            : "border-white/10 bg-white/5 text-white/40 hover:border-white/20 hover:text-white"
                        }`}
                        title={`${star} star${star > 1 ? "s" : ""}`}
                      >
                        ★ {star}
                      </button>
                    ))}
                    {rating && (
                      <button
                        type="button"
                        onClick={() => setRating(undefined)}
                        className="text-[11px] text-white/40 hover:text-white ml-2"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                {/* Written Description */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="feedback-desc" className="text-xs font-semibold text-white/70">
                      Description or Suggestions (Optional)
                    </label>
                    <span className="text-[10px] text-white/40 font-mono">
                      {description.length} / 2000
                    </span>
                  </div>
                  <textarea
                    id="feedback-desc"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    rows={4}
                    maxLength={2000}
                    placeholder="Describe what was confusing, what broke, or what could be improved..."
                    className="w-full rounded-xl border border-white/15 bg-black/40 p-3 text-xs text-white placeholder-white/30 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>

                {/* Workflow context tag */}
                <div className="flex items-center justify-between text-[11px] text-white/50 border-t border-white/5 pt-3">
                  <span>Current Workflow:</span>
                  <span className="font-mono text-violet-300 bg-violet-500/10 px-2 py-0.5 rounded border border-violet-500/20">
                    {pathname || "/"}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/10"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-violet-600 px-5 py-2 text-xs font-bold text-white transition hover:bg-violet-500 shadow-md shadow-violet-600/30"
                  >
                    Save Local Feedback
                  </button>
                </div>
              </form>
            )}

            {/* Tab: History */}
            {tab === "history" && (
              <div className="mt-5 space-y-3">
                <p className="text-xs text-white/60 leading-relaxed">
                  Below is the product feedback stored privately in your browser. You can inspect or delete individual records at any time.
                </p>

                {historyItems.length === 0 ? (
                  <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6 text-center text-xs text-white/40">
                    No product feedback recorded yet.
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1">
                    {historyItems.map(item => (
                      <div
                        key={item.id}
                        className="rounded-xl border border-white/10 bg-black/30 p-3.5 space-y-1.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="rounded-md border border-violet-500/30 bg-violet-500/10 px-2 py-0.5 text-[10px] font-bold text-violet-300">
                              {CATEGORY_LABELS[item.category] || item.category}
                            </span>
                            {item.rating && (
                              <span className="text-[11px] font-bold text-amber-300 font-mono">
                                {"★".repeat(item.rating)}
                              </span>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDelete(item.id)}
                            className="text-[11px] text-rose-400 hover:text-rose-300"
                            title="Delete this feedback"
                          >
                            Delete ✕
                          </button>
                        </div>

                        {item.description && (
                          <p className="text-xs text-white/80 leading-relaxed">
                            {item.description}
                          </p>
                        )}

                        <div className="flex items-center justify-between text-[10px] text-white/40 border-t border-white/5 pt-1.5 font-mono">
                          <span>Route: {item.route || "general"}</span>
                          <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

