import React from "react";

/** Small badge that shows the match percentage. */
export const ScoreBadge: React.FC<{ score: number }> = ({ score }) => {
  const hue = Math.round((score / 100) * 120); // green (120) to red (0)
  const bg = `hsl(${hue}, 70%, 30%)`;
  const text = `hsl(${hue}, 100%, 90%)`;
  return (
    <span
      className="inline-block rounded-full px-2 py-0.5 text-xs font-medium"
      style={{ backgroundColor: bg, color: text }}
    >
      {score}% match
    </span>
  );
};
