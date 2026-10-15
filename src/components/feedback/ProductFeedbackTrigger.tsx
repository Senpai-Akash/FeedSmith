"use client";

import React, { useState } from "react";
import { ProductFeedbackModal } from "./ProductFeedbackModal";

export function ProductFeedbackTrigger() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating unobtrusive entry point in bottom-right corner */}
      <div className="fixed bottom-5 right-5 z-40">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 rounded-full border border-violet-500/30 bg-[#0c0817]/80 px-3.5 py-2 text-xs font-semibold text-white shadow-xl backdrop-blur-xl transition hover:border-violet-400 hover:bg-violet-950/60 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
          title="Share Product Feedback / Report Usability Issue"
        >
          <span className="text-violet-400">💬</span>
          <span>Feedback</span>
        </button>
      </div>

      <ProductFeedbackModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}

