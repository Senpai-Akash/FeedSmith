import React, { useState } from "react";

/**
 * Collapsible panel that reveals an array of explanation strings.
 */
export const WhyThisPanel: React.FC<{ reasons: string[] }> = ({ reasons }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-2.5">
      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-semibold text-violet-300 transition hover:bg-white/10 hover:text-white hover:border-violet-400"
      >
        <span>{open ? "▾" : "▸"}</span>
        <span>{open ? "Hide signal breakdown" : "Why this matched?"}</span>
      </button>
      {open && (
        <div className="mt-2.5 rounded-xl border border-violet-500/20 bg-violet-950/20 p-3.5 backdrop-blur-sm">
          <div className="text-[10px] font-bold uppercase tracking-wider text-violet-400 mb-1.5">
            Signal Resonance Factors
          </div>
          <ul className="space-y-1.5 text-xs text-white/85">
            {reasons.map((r, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-violet-400 font-bold">•</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
