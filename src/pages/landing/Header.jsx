import { Link } from "react-router-dom";
import LanguageSwitcher from "../../components/LanguageSwitcher";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Header({ user, onLoginClick, t }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
 
  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <nav className="mt-5 max-w-7xl mx-auto flex items-center justify-between lg:px-10 py-4 bg-white/95 backdrop-blur-md supports-[backdrop-filter]:bg-white/85 border border-slate-200/70 ring-1 ring-black/5 shadow-md rounded-full">
        <div className="flex items-center gap-3">
          <div className="size-12 rounded-full overflow-hidden bg-brand-500/20 grid place-items-center text-brand-600 font-bold">
          <img src="/icon_xinkmeet.png" alt="logo" className="w-full h-full object-cover" />
          </div>
          <span className="font-semibold tracking-tight">XinK Meet</span>
          <span className="badge ml-3 hidden lg:block">{t('nav.title')}</span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-[15px] lg:text-base xl:text-lg text-slate-700">
          <a className="hover:text-brand-700 transition-colors font-medium" href="#features">{t('nav.features')}</a>
          <a className="hover:text-brand-700 transition-colors font-medium" href="#pricing">{t('nav.pricing')}</a>
          <a className="hover:text-brand-700 transition-colors font-medium" href="#testimonials">{t('nav.testimonials')}</a>
          <a className="hover:text-brand-700 transition-colors font-medium" href="#faq">{t('nav.faq')}</a>
          <a className="hover:text-brand-700 transition-colors font-medium" href="#contact">{t('nav.contact')}</a>
        </div>

        <div className="flex items-center gap-3">
          <LanguageSwitcher />

          {user ? (
            <Link
              to="/home"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-white bg-cyan-500 hover:bg-cyan-600 active:bg-cyan-700 shadow-md focus:outline-none focus:ring-2 focus:ring-cyan-300"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <button
                onClick={onLoginClick} 
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-white
                         bg-cyan-500 hover:bg-cyan-600 active:bg-cyan-700 shadow-md
                         focus:outline-none focus:ring-2 focus:ring-cyan-300"
              >
                {t('nav.login')}
              </button>
            </>
          )}
          <button
              className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
       
      </nav>
       {mobileMenuOpen && (
          <div className="mt-38 md:hidden bg-white border-x border-b border-slate-200 shadow-lg rounded-b-2xl overflow-hidden">
            <div className="px-4 py-4 space-y-3">
              <a className="block py-2 text-base text-slate-700 hover:text-blue-700 hover:bg-blue-50 rounded-md px-4 font-medium transition-colors" href="#features" onClick={() => setMobileMenuOpen(false)}>{t('nav.features')}</a>
              <a className="block py-2 text-base text-slate-700 hover:text-blue-700 hover:bg-blue-50 rounded-md px-4 font-medium transition-colors" href="#pricing" onClick={() => setMobileMenuOpen(false)}>{t('nav.pricing')}</a>
              <a className="block py-2 text-base text-slate-700 hover:text-blue-700 hover:bg-blue-50 rounded-md px-4 font-medium transition-colors" href="#testimonials" onClick={() => setMobileMenuOpen(false)}>{t('nav.testimonials')}</a>
              <a className="block py-2 text-base text-slate-700 hover:text-blue-700 hover:bg-blue-50 rounded-md px-4 font-medium transition-colors" href="#faq" onClick={() => setMobileMenuOpen(false)}>{t('nav.faq')}</a>
              <a className="block py-2 text-base text-slate-700 hover:text-blue-700 hover:bg-blue-50 rounded-md px-4 font-medium transition-colors" href="#contact" onClick={() => setMobileMenuOpen(false)}>{t('nav.contact')}</a>
              <div className="pt-3 border-t border-slate-200">
              <button
                onClick={() => {
                  onLoginClick();
                  setMobileMenuOpen(false);
                }} 
                className="w-full justify-center inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-white
                         bg-cyan-500 hover:bg-cyan-600 active:bg-cyan-700 shadow-md
                         focus:outline-none focus:ring-2 focus:ring-cyan-300">
                  {t('nav.tryFree')}
                </button>
              </div>
            </div>
          </div>
        )}
    </header>
  );
}