import { Phone, Mail, MapPin, MessageCircle } from "lucide-react";

export default function Contact({ t, formData, handleChange, handleSubmit }) {
  const container = "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8";

  return (
    <section id="contact" className="items-center gap-2 text-white px-3 py-1 text-xs font-medium shadow-sm bg-cyan-500">
      <div className={`${container} py-16 sm:py-20`}>
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-12 items-start">
          {/* LEFT: Copy + Contact cards */}
          <div className="space-y-8 animate-fade-in-up">
            <div>
              <h3 className="text-3xl sm:text-4xl font-bold text-white mb-4 animate-scale-in stagger-1">
                {t('contact.title')}
              </h3>
              <p className="text-lg sm:text-xl text-white/85 leading-relaxed animate-fade-in-up stagger-2">
                {t('contact.subtitle')}
              </p>
            </div>

            {/* Cards */}
            <div className="space-y-5 md:space-y-6 text-base">
              {/* HOTLINE */}
              <div
                className="relative group flex items-center gap-4 p-4 md:p-5 rounded-2xl
                                 bg-white/35 border border-white/50 backdrop-blur
                                 shadow-lg transition-all duration-300 hover-lift
                                 animate-slide-up-stagger stagger-3"
              >
                <div
                  className="relative size-11 grid place-items-center rounded-xl
                                   bg-white/70 text-sky-600 shadow-inner"
                  aria-hidden="true"
                >
                  {/* ping */}
                  <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-emerald-400">
                    <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping" />
                  </span>
                  <Phone size={24} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-white">{t('contact.info.hotline')}</p>
                    <span
                      className="text-[11px] px-2 py-0.5 rounded-full
                                     bg-emerald-400/20 text-emerald-50 border border-emerald-300/40"
                    >
                      {t('contact.info.available24')}
                    </span>
                  </div>
                  <a
                    href="tel:0862706996"
                    className="text-white/85 font-medium hover:text-white transition-colors"
                  >
                    {t('contact.info.phone')}
                  </a>
                </div>

                {/* glow */}
                <span
                  className="pointer-events-none absolute inset-0 rounded-2xl
                                 ring-0 ring-white/0 group-hover:ring-2 group-hover:ring-white/40
                                 transition-all duration-300"
                />
              </div>

              {/* EMAIL */}
              <div
                className="relative group flex items-center gap-4 p-4 md:p-5 rounded-2xl
                                 bg-white/35 border border-white/50 backdrop-blur
                                 shadow-lg transition-all duration-300 hover-lift
                                 animate-slide-up-stagger stagger-4"
              >
                <div
                  className="relative size-11 grid place-items-center rounded-xl
                                   bg-white/70 text-sky-600 shadow-inner"
                  aria-hidden="true"
                >
                  <Mail size={24} />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white">{t('contact.info.email')}</p>
                  <a
                    href="mailto:hi@ixink.com"
                    className="text-white/85 font-medium hover:text-white break-words transition-colors"
                  >
                    {t('contact.info.emailAddress')}
                  </a>
                </div>

                <span
                  className="pointer-events-none absolute inset-0 rounded-2xl
                                 ring-0 ring-white/0 group-hover:ring-2 group-hover:ring-white/40
                                 transition-all duration-300"
                />
              </div>

              {/* ADDRESS */}
              <div
                className="relative group flex items-center gap-4 p-4 md:p-5 rounded-2xl
                                 bg-white/35 border border-white/50 backdrop-blur
                                 shadow-lg transition-all duration-300 hover-lift
                                 animate-slide-up-stagger stagger-5"
              >
                <div
                  className="relative size-11 grid place-items-center rounded-xl
                                   bg-white/70 text-sky-600 shadow-inner"
                  aria-hidden="true"
                >
                  <MapPin size={24} />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white">{t('contact.info.address')}</p>
                  <p className="text-white/85 font-medium leading-relaxed">
                    {t('contact.info.addressText')}
                  </p>
                </div>

                <span
                  className="pointer-events-none absolute inset-0 rounded-2xl
                                 ring-0 ring-white/0 group-hover:ring-2 group-hover:ring-white/40
                                 transition-all duration-300"
                />
              </div>
            </div>
          </div>

          {/* RIGHT: Form */}
          <form
            onSubmit={handleSubmit}
            className="space-y-6 animate-fade-in-up stagger-6"
          >
            <div className="rounded-2xl p-8 shadow-xl shadow-blue-600/10 ring-1 ring-slate-200 bg-white">
              <h4 className="text-2xl font-bold text-slate-900 mb-6">{t('contact.form.title')}</h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Họ và tên */}
                <div className="space-y-2">
                  <label htmlFor="contact-name" className="block text-sm font-semibold text-slate-700">
                    {t('contact.form.name')} <span className="text-rose-500">{t('common.required')}</span>
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    autoComplete="name"
                    required
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white/90 text-slate-900 placeholder:text-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-200/60 outline-none transition-all"
                    placeholder={t('contact.form.placeholders.name')}
                  />
                </div>

                {/* Trung tâm đang hoạt động */}
                <div className="space-y-2">
                  <label htmlFor="contact-center" className="block text-sm font-semibold text-slate-700">
                    {t('contact.form.center')} <span className="text-rose-500">{t('common.required')}</span>
                  </label>
                  <input
                    id="contact-center"
                    type="text"
                    name="center"
                    value={formData.center}
                    onChange={handleChange}
                    required
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white/90 text-slate-900 placeholder:text-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-200/60 outline-none transition-all"
                    placeholder={t('contact.form.placeholders.center')}
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label htmlFor="contact-email" className="block text-sm font-semibold text-slate-700">
                    {t('contact.form.email')} <span className="text-rose-500">{t('common.required')}</span>
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    autoComplete="email"
                    required
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white/90 text-slate-900 placeholder:text-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-200/60 outline-none transition-all"
                    placeholder={t('contact.form.placeholders.email')}
                  />
                </div>

                {/* Số điện thoại (VN) */}
                <div className="space-y-2">
                  <label htmlFor="contact-phone" className="block text-sm font-semibold text-slate-700">
                    {t('contact.form.phone')} <span className="text-rose-500">{t('common.required')}</span>
                  </label>
                  <input
                    id="contact-phone"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    inputMode="tel"
                    required
                    pattern="^(\+84|0)\d{9,10}$"
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white/90 text-slate-900 placeholder:text-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-200/60 outline-none transition-all"
                    placeholder={t('contact.form.placeholders.phone')}
                  />
                  <p className="text-xs text-slate-500">{t('contact.form.phoneFormat')}</p>
                </div>

                {/* Nhu cầu (full width) */}
                <div className="sm:col-span-2 space-y-2">
                  <label htmlFor="contact-message" className="block text-sm font-semibold text-slate-700">
                    {t('contact.form.message')} <span className="text-rose-500">{t('common.required')}</span>
                  </label>
                  <textarea
                    id="contact-message"
                    rows={4}
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/90 text-slate-900 placeholder:text-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-200/60 outline-none transition-all resize-none"
                    placeholder={t('contact.form.placeholders.message')}
                  />
                </div>
              </div>

              <button
                as="button"
                type="submit"
                gradient="secondary"
                className="flex w-full mt-8 h-12 items-center justify-center gap-2 px-4 py-2 rounded-xl font-semibold text-white
                                 bg-cyan-500 hover:bg-cyan-600 active:bg-cyan-700 shadow-md
                                 focus:outline-none focus:ring-2 focus:ring-cyan-300"
              >
                <MessageCircle size={20} className="mr-2" />
                {t('contact.form.submit')}
              </button>

              <p className="text-center text-sm text-slate-500 mt-4">
                {t('contact.form.privacy')}
              </p>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}