import Section from "./Section";
import { CheckCircle2 } from "lucide-react";
import { useRef, useState } from "react";
import useScrollReveal from "../../hooks/useScrollReveal";

function PlanCard({ id, note, badge, name, price, features, highlight=false, t }) {
  const [showAll, setShowAll] = useState(false);

  const VISIBLE_LIMIT = 8;
  const hasMore = Array.isArray(features) && features.length > VISIBLE_LIMIT;
  const visibleFeatures = showAll ? (features || []) : (features || []).slice(0, VISIBLE_LIMIT);
  const NAVBAR_OFFSET = 72;

  function scrollToContact(e) {
    e?.preventDefault();
    const el = document.getElementById('contact');
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - NAVBAR_OFFSET;
    window.scrollTo({ top: y, behavior: 'smooth' });
  }
  
  
  return (
    <div className={` relative rounded-2xl border ${highlight ? 'border-blue-200' : 'border-slate-200'} bg-white shadow-sm h-full flex flex-col hover:shadow-xl hover:scale-105 transition-all duration-500 group hover-lift`}>
      {/* Shimmer */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-shimmer rounded-2xl" />

      <div className="px-6 py-8 flex flex-col flex-1 relative z-10 gap-5">
        <div className="mb-4">
          <span className="inline-flex px-3 py-1 rounded-md text-xs font-semibold text-white transition-all duration-300 bg-gradient-to-tl from-cyan-500 to-blue-500">
            {badge}
          </span>
          <p className="text-sm text-slate-600 group-hover:text-slate-700 transition-colors duration-300">
            {note || "Gói tính năng phù hợp cho nhu cầu."}
          </p>
        </div>

        <p className="price reveal-up">
          {price}
        </p>

        {/* FEATURES */}
        <div className="mt-5 relative flex-1">
          <ul className="space-y-3">
           
            {visibleFeatures.map((f, i) => (
              <li
                key={i}
                className="reveal-up flex gap-3 items-start text-slate-700 text-sm group-hover:text-slate-800 transition-all duration-300 group-hover:translate-x-1"
                style={{ transitionDelay: `${i * 30}ms` }}
              >
                <span
                  className="w-5 h-5 rounded-full bg-emerald-50 ring-1 ring-emerald-200/60 text-emerald-600 flex items-center justify-center mt-0.5 shrink-0"
                  aria-hidden="true"
                >
                  <CheckCircle2 size={14} className="shrink-0" />
                </span>

                <span className="leading-relaxed break-words">{f}</span>
              </li>
            ))}
          </ul>

          {!showAll && hasMore && (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-cyan-400 to-black" />
          )}
        </div>

        {hasMore && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="mt-4 text-xs font-semibold text-blue-700 hover:text-blue-800 inline-flex items-center"
          >
            {showAll ? t('common.collapse') : t('common.seeMore')}
          </button>
        )}

        <div className="mt-auto pt-6">
          <button
            as="button"
            onClick={scrollToContact}
            className="btn w-full justify-center"
          >
            {t('pricing.contactUs')}
          </button>
        </div>
      </div>

      {/* Floating particles */}
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="w-2 h-2 bg-blue-400 rounded-full animate-float" style={{ animationDelay: '0s' }} />
        <div className="w-1 h-1 bg-cyan-400 rounded-full animate-float mt-2" style={{ animationDelay: '0.5s' }} />
        <div className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-float mt-1" style={{ animationDelay: '1s' }} />
      </div>
    </div>
  );
}

export default function Pricing({ t }) {
  const plans = t('pricing.plans');
  const rootRef = useRef(null);
  useScrollReveal(rootRef, "reveal-up", "is-visible", { threshold: 0.15, once: true });

  
  return (
    <Section id="pricing" maxWidth="7xl" className="relative">
      <div ref={rootRef}>
        <div className="glow-wrap -z-10">
          <div className="blob blob-cyan w-96 h-96 -top-10 left-1/4" />
          <div className="blob blob-blue w-80 h-80 bottom-0 right-10" />
        </div>
        <h2 className="text-center text-4xl font-bold reveal-up">{t('pricing.title') /* Pricing */}</h2>
        <p className="text-center text-slate-600 mt-2 reveal-up">{t('pricing.subtitle') /* Choose the perfect plan for your team. */}</p>
        <div className="mt-8">
          <div
            className="
              grid gap-6
              grid-cols-1
              sm:grid-cols-2
              lg:grid-cols-3
              [grid-auto-rows:1fr]
            "
          >
            {plans.map((p, index) => (
              <div key={p.id} className={`reveal-up h-full animate-bounce-in stagger-${index + 3}`}>
                <PlanCard {...p} t={t} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}

     