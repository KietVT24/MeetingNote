import { Phone, Mail, MapPin } from "lucide-react";

export default function Footer({ t }) {
  const container = "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8";

  return (
    <footer className="bg-gradient-to-br from-slate-900 to-slate-800 text-slate-300">
      <div className={`${container} py-16`}>
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          {/* --- Brand / Company --- */}
          <div className="md:col-span-2">
            {/* Logo sáng hơn nền + đứng trước phần giới thiệu */}
            <div className="flex items-center gap-3 mb-4">
              <span className="font-bold text-white text-xl">XINK MEET</span>
            </div>

            {/* Giới thiệu công ty */}
            <div className="text-slate-300/90 leading-relaxed space-y-2 max-w-xl">
              <p>{t('footer.company')}</p>
              <p>{t('footer.companyInfo')}</p>
              <p>{t('footer.address')}</p>
            </div>

            {/* Quick actions */}
            <div className="mt-6 flex gap-4">
              <div className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer">
                <Phone size={20} className="text-blue-400" />
              </div>
              <div className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer">
                <Mail size={20} className="text-green-400" />
              </div>
              <div className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer">
                <MapPin size={20} className="text-purple-400" />
              </div>
            </div>
          </div>

          {/* --- Products --- */}
          <div>
            <h4 className="font-bold text-white mb-6">{t('footer.products.title')}</h4>
            <ul className="space-y-3 text-slate-400">
              <li><a href="#features" className="hover:text-white transition-colors">{t('footer.products.features')}</a></li>
              <li><a href="#pricing" className="hover:text-white transition-colors">{t('footer.products.pricing')}</a></li>
              <li><a href="#testimonials" className="hover:text-white transition-colors">{t('footer.products.testimonials')}</a></li>
              <li><a href="#contact" className="hover:text-white transition-colors">{t('footer.products.demo')}</a></li>
            </ul>
          </div>

          {/* --- Support --- */}
          <div>
            <h4 className="font-bold text-white mb-6">{t('footer.support.title')}</h4>
            <ul className="space-y-3 text-slate-400">
              <li><a href="#faq" className="hover:text-white transition-colors">{t('footer.support.faq')}</a></li>
              <li><a href="#contact" className="hover:text-white transition-colors">{t('footer.support.contact')}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{t('footer.support.docs')}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{t('footer.support.guide')}</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-700 pt-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                src="xink.png" // Đảm bảo đường dẫn này đúng, có thể bạn cần /xink.png nếu nó trong public
                alt=""
                width={20}
                height={20}
                loading="lazy"
                className="rounded-md brightness-110 opacity-90"
              />
              <div className="text-slate-400 text-sm">{t('footer.legal.copyright')}</div>
            </div>
            <div className="flex gap-6 text-slate-400 text-sm">
              <a className="hover:text-white transition-colors" href="#">{t('footer.legal.terms')}</a>
              <a className="hover:text-white transition-colors" href="#">{t('footer.legal.privacy')}</a>
              <a className="hover:text-white transition-colors" href="#">{t('footer.legal.policy')}</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}