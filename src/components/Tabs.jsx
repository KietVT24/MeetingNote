// Tabs.jsx
import React from "react";

export function Tabs({ items, current, onChange }) {
  return (
    <div role="tablist" aria-label="Result tabs" className="mt-4 flex gap-6 border-b border-cyan-200/60">
      {items.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          role="tab"
          aria-selected={current === id}
          aria-controls={`panel-${id}`}
          onClick={() => onChange(id)}
          className={`relative flex items-center gap-2 py-3 text-sm text-cyan-900/90 transition-colors
            ${current === id ? "font-semibold" : "opacity-80 hover:opacity-100"}`}
        >
          {Icon ? <Icon size={16} className="opacity-90" /> : null}
          <span>{label}</span>
          {current === id && (
            <span className="absolute left-0 right-0 -bottom-[1px] h-[2px] bg-cyan-500 rounded" />
          )}
        </button>
      ))}
    </div>
  );
}

export function TabPanels({ items, current }) {
  const cur = items.find(t => t.id === current);
  if (!cur) return null;
  return (
    <div
      id={`panel-${cur.id}`}
      role="tabpanel"
      aria-labelledby={cur.id}
      className="min-h-[500px] mt-4"
    >
      {cur.render()}
    </div>
  );
}
