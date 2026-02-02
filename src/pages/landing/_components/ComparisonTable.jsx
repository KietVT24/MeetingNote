import { useRef } from "react";
import useScrollReveal from "../../../hooks/useScrollReveal";

export default function ComparisonTable({
  beforeTitle,
  afterTitle,
  items,
  afterTitleClassName = "text-brand-700",
}) {
  const rootRef = useRef(null);
  useScrollReveal(rootRef, "reveal-up", "is-visible", { threshold: 0.15, once: true });
  
  return (
    <div ref={rootRef}>
      <div className="grid md:grid-cols-2 gap-6 card p-6 mt-8 reveal-up">
        {/* Before Column */}
        <div>
          <h4 className="font-semibold text-lg">{beforeTitle}</h4>
          <ul className="mt-4 space-y-3">
            {items.before.map((item, index) => (
              <li key={index} className="flex items-start gap-3 text-sm text-slate-700 reveal-up">
                <span className="text-red-500 font-bold flex-shrink-0">✗</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* After Column */}
        <div>
          <h4 className={`font-semibold text-lg ${afterTitleClassName}`}>{afterTitle}</h4>
          <ul className="mt-4 space-y-3">
            {items.after.map((item, index) => (
              <li key={index} className="flex items-start gap-3 text-sm text-slate-700 reveal-up">
                <span className="text-green-500 font-bold flex-shrink-0">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
