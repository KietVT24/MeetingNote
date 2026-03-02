export default function Hero({ t, onLoginClick }) {
  const container = "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8";

  return (
    <section className={`${container} pt-36 lg:h-screen pb-16 grid lg:grid-cols-2 gap-16 items-center min-h-fit `}>
      <div className="flex flex-col items-start w-full animate-slide-in-left">
        <p className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs text-white font-medium shadow-sm bg-gradient-to-r from-brand-500 to-brand-700">{t('hero.badge')}</p>
        <h1 className="mt-3 text-[34px] md:text-[44px] font-extrabold leading-tight tracking-tight text-slate-900">
          Transcript
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-brand-700">
            {t('hero.title1')}
          </span>
        </h1>
        <p className="mt-4 max-w-2xl text-[15px] text-slate-600">
          {t('hero.description')}
        </p>

        <div className="mt-6 flex items-center justify-center gap-3">
          <button onClick={onLoginClick}  className="btn" href="/home">{t('hero.tryItFree') /* Try it free */}</button>
          <a className="btn" href="#contact">{t('hero.bookDemo') /* Book demo */}</a>
        </div>

        
      </div>

       <div className="relative lg:ml-8 animate-slide-in-right">
          <div className="absolute -inset-6 rounded-3xl bg-white/20 blur-xl animate-pulse"/>
          <div className="relative rounded-3xl overflow-hidden ring-1 ring-white/30 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105">
            <video src="video.mp4" autoPlay muted loop playsInline className="w-full h-96 object-cover"></video>
          </div>
        </div>

    </section>
  );
}