import React from "react";

/** Small badge that shows the match percentage. */
export const ScoreBadge: React.FC<{ score: number }> = ({ score }) => {
  const hue = Math.round((score / 100) * 120); // green (120) to red (0)
  const bg = `hsla(${hue}, 70%, 25%, 0.4)`;
  const border = `hsla(${hue}, 80%, 45%, 0.5)`;
  const text = `hsl(${hue}, 100%, 85%)`;
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold font-mono border shadow-sm"
      style={{ backgroundColor: bg, borderColor: border, color: text }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: text }} />
      <span>{score}% match</span>
    </span>
  );
};
