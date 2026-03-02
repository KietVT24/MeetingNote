import { ChevronDown, HelpCircle, Shield, Globe } from "lucide-react";
import { useRef } from "react";
import Section from "./Section";
import useScrollReveal from "../../hooks/useScrollReveal";

export default function FAQ({ t }) {
  const containerRef = useRef(null);
  useScrollReveal(containerRef, "reveal-up", "is-visible", { threshold: 0.1, once: true });

  const faqs = [
    {
      icon: <HelpCircle className="w-5 h-5 text-cyan-500" />,
      question: t('faq.items.how.title'),
      answer: t('faq.items.how.answer'),
    },
    {
      icon: <Shield className="w-5 h-5 text-emerald-500" />,
      question: t('faq.items.secure.title'),
      answer: t('faq.items.secure.answer'),
    },
    {
      icon: <Globe className="w-5 h-5 text-blue-500" />,
      question: t('faq.items.vietnamese.title'),
      answer: t('faq.items.vietnamese.answer'),
    },
  ];

  return (
    <Section id="faq" maxWidth="4xl">
      <div ref={containerRef} className="space-y-8">
        {/* Header */}
        <div className="text-center reveal-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-100 mb-4">
            <HelpCircle className="w-4 h-4 text-cyan-600" />
            <span className="text-sm font-semibold text-cyan-700">FAQ</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent">
            {t('faq.title')}
          </h2>
          <p className="mt-3 text-slate-600 max-w-2xl mx-auto">
            {t('faq.subtitle')}
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <details
              key={index}
              className="faq-accordion group reveal-up"
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <summary className="faq-summary">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-50 to-blue-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    {faq.icon}
                  </div>
                  <span className="font-semibold text-slate-900 text-left flex-1">
                    {faq.question}
                  </span>
                </div>
                <ChevronDown className="faq-chevron w-5 h-5 text-slate-400 flex-shrink-0 transition-transform duration-300 group-open:rotate-180" />
              </summary>
              <div className="faq-content">
                <p className="text-slate-600 leading-relaxed pl-[52px]">
                  {faq.answer}
                </p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </Section>
  );
}