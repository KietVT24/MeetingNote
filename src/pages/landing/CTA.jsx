import Section from "./Section";

export default function CTA({ t }) {
  return (
    <Section id="cta" className="relative text-center" maxWidth="4xl">
      <div className="glow-wrap -z-10">
        <div className="blob blob-cyan w-[28rem] h-[28rem] -top-16 left-20" />
        <div className="blob blob-blue w-[22rem] h-[22rem] bottom-6 right-32" />
      </div>

      <h2 className="text-xl md:text-2xl font-extrabold">{t('cta.readyTitle') /* Ready to love your workday again? */}</h2>
      <p className="mt-2 text-slate-600">{t('cta.tryNow') /* Try Transcript AI now. */}</p>
      <div className="mt-6 flex items-center justify-center gap-3">
        <a className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-cyan-500/25 hover:shadow-xl hover:shadow-cyan-500/40 hover:-translate-y-0.5 transition-all duration-200" href="#contact">{t('cta.bookDemo') /* Book demo */}</a>
      </div>
    </Section>
  );
}