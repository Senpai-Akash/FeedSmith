import React, { useState } from "react";

/**
 * Collapsible panel that reveals an array of explanation strings.
 */
export const WhyThisPanel: React.FC<{ reasons: string[] }> = ({ reasons }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
        className="text-sm underline text-gray-300 hover:text-white"
      >
        {open ? "Hide why this" : "Why this?"}
      </button>
      {open && (
        <ul className="mt-1 list-disc list-inside text-gray-200 text-sm">
          {reasons.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
      )}
    </div>
  );
};
