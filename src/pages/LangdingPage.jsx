// import { Link } from "react-router-dom";
// import { useState } from "react";
// import { useAuth } from "../contexts/AuthContext";
// import LoginForm from "../components/LoginForm";
// import { Phone, Mail, MapPin, MessageCircle } from "lucide-react";
// import "../styles/langdingpage.css";
// import axios from "axios";
// import { useLanguage } from "../contexts/LanguageContext";
// import { getTranslation } from "../translations";
// import LanguageSwitcher from "../components/LanguageSwitcher";

// export default function LandingPage() {
//   const [showLogin, setShowLogin] = useState(false);
//   const { user } = useAuth();

//   const { language } = useLanguage();
//   const t = (key) => getTranslation(language, key);
  
//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     message: "",
//     center: "",
//     phone: "",
//   });

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const res = await axios.post("https://xink-edu-backend-459095746983.asia-southeast1.run.app/contact", formData);
//     console.log(res);
//     if(res.status === 200){
//     alert("Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi trong vòng 24h.");
//     } else {
//       alert("Lỗi khi gửi liên hệ! Vui lòng thử lại.");
//     }
//   };

//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value,
//     });
//   };

//   // Container class for consistent max-width
//   const container = "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8";
  


//   // Translation object for footer content
//   // const t = {
//   //   'footer.description': 'Transform your meetings into actionable insights with AI-powered transcription and analysis.',
//   //   'footer.company': 'XINKGROUP JOINT STOCK COMPANY',
//   //   'footer.companyInfo': 'Business Registration No.: 0402241823. Initial Business Registration Certificate issued by the Da Nang Department of Planning and Investment on July 12, 2024.',
//   //   'footer.address': 'Address: 4th Floor, ICT1 Building, Software Park No. 2, Nhu Nguyet Street, Hai Chau Ward, Da Nang City, Vietnam',
//   //   'footer.products.title': 'Products',
//   //   'footer.products.features': 'Features',
//   //   'footer.products.pricing': 'Pricing',
//   //   'footer.products.about': 'About',
//   //   'footer.products.demo': 'Demo',
//   //   'footer.support.title': 'Support',
//   //   'footer.support.faq': 'FAQ',
//   //   'footer.support.contact': 'Contact',
//   //   'footer.support.docs': 'Documentation',
//   //   'footer.support.guide': 'Guide',
//   //   'footer.legal.copyright': '© 2024 XinKMeet. All rights reserved.',
//   //   'footer.legal.terms': 'Terms',
//   //   'footer.legal.privacy': 'Privacy',
//   //   'footer.legal.policy': 'Policy'
//   // };
  
   
//   return (
//     <>
//       {showLogin && <LoginForm onClose={() => setShowLogin(false)} />}
      
//       <div className="min-h-screen antialiased text-slate-800 bg-gradient-to-b from-brand-50 via-white to-brand-100">
//         <header className="relative">
//           <div className="glow-wrap -z-10">
//             <div className="blob blob-cyan w-80 h-80 -top-10 -left-10" />
//             <div className="blob blob-blue w-96 h-96 top-10 right-10" />
//             <div className="blob blob-lime w-72 h-72 bottom-20 left-1/3" />
//           </div>

//           <nav className="mt-5 fixed top-0 inset-x-0 z-50 max-w-7xl mx-auto flex items-center justify-between px-4 lg:px-10 py-4 bg-white/95 backdrop-blur-md supports-[backdrop-filter]:bg-white/85 border border-slate-200/70 ring-1 ring-black/5 shadow-md rounded-full overflow-hidden">
//             <div className="flex items-center gap-3">
//               <div className="h-8 w-8 rounded-xl bg-brand-500/20 grid place-items-center text-brand-600 font-bold">T</div>
//               <span className="font-semibold tracking-tight">Transcript AI</span>
//               <span className="badge ml-3">{t('nav.title')}</span>
//             </div>

//             <div className="hidden md:flex items-center gap-8 text-[15px] lg:text-base xl:text-lg text-slate-700">
//               <a className="hover:text-brand-700 transition-colors font-medium" href="#features">{t('nav.features')}</a>
//               <a className="hover:text-brand-700 transition-colors font-medium" href="#pricing">{t('nav.pricing')}</a>
//               <a className="hover:text-brand-700 transition-colors font-medium" href="#testimonials">{t('nav.testimonials')}</a>
//               <a className="hover:text-brand-700 transition-colors font-medium" href="#faq">{t('nav.faq')}</a>
//               <a className="hover:text-brand-700 transition-colors font-medium" href="#contact">{t('nav.contact')}</a>
//             </div>

//             <div className="flex items-center gap-3">
//               <LanguageSwitcher />
//             </div>

//             <div className="flex items-center gap-3">
//               {user ? (
//                 <Link
//                   to="/home"
//                   className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-white bg-cyan-500 hover:bg-cyan-600 active:bg-cyan-700 shadow-md focus:outline-none focus:ring-2 focus:ring-cyan-300"
//                 >
//                   Dashboard
//                 </Link>
//               ) : (
//                 <>
//                   <button
//                     onClick={() => setShowLogin(true)}
//                     className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 active:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-300"
//                   >
//                     {t('nav.login')}
//                   </button>
//                 </>
//               )}
//             </div>
//           </nav>
//         </header>

//   <section className="max-w-5xl pt-36 mx-auto px-6 text-center pb-16">
//           <p className="text-xs md:text-sm text-slate-500">{t('hero.badge')}</p>
//           <h1 className="mt-3 text-[34px] md:text-[44px] font-extrabold leading-tight tracking-tight text-slate-900">
//             Transcript AI
//             <br />
//             <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-brand-700">
//               {t('hero.title1')}
//             </span>
//           </h1>
//           <p className="mt-4 max-w-2xl mx-auto text-[15px] text-slate-600">
//             {t('hero.description')}
//           </p>

//           <div className="mt-6 flex items-center justify-center gap-3">
//             <a className="btn" href="/home">{t('hero.tryItFree') /* Try it free */}</a>
//             <a className="btn" href="#contact">{t('hero.bookDemo') /* Book demo */}</a>
//           </div>

      
//           <div className="mt-8 flex items-center justify-center gap-6 opacity-70 text-xs">
//             <span>COMPASS</span><span>Expedia</span><span>Nike</span><span>DELTA</span>
//           </div>
//         </section>
 
//         <section id="features" className="max-w-6xl mx-auto px-6 py-10">
//           <h2 className="text-center text-2xl font-bold">{t('features.powerfulTitle') /* Powerful Features */}</h2>
//           <p className="text-center text-slate-600 mt-2">{t('features.subtitle') /* Transform your meetings into actionable insights. */}</p>

//           <div className="grid md:grid-cols-3 gap-5 mt-6">
          
//             <div className="card p-6 shadow-soft">
//               <div className="h-10 w-10 rounded-xl bg-brand-500/15 text-brand-600 grid place-items-center font-bold">Σ</div>
//               <h3 className="font-semibold mt-3">{t('features.getSummaries') /* Get meeting summaries */}</h3>
//               <p className="text-sm text-slate-600 mt-1">{t('features.summariesDescription') || 'Accurate key points, action items, owners and deadlines in seconds.' /* description */}</p>
//               <ul className="text-sm mt-3 space-y-1 text-slate-700">
//                 <li>• {t('features.list.autoChapters') /* Auto chapters */}</li>
//                 <li>• {t('features.list.qaExtraction') /* Q&A extraction */}</li>
//                 <li>• {t('features.list.speakerDiarization') /* Speaker diarization */}</li>
//                 <li>• {t('features.list.exportPdfDoc') /* Export to PDF/Doc */}</li>
//               </ul>
//             </div>
//             <div className="card p-6 shadow-soft">
//               <div className="h-10 w-10 rounded-xl bg-brand-500/15 text-brand-600 grid place-items-center font-bold">?</div>
//               <h3 className="font-semibold mt-3">{t('features.getAnswers') /* Get useful answers */}</h3>
//               <p className="text-sm text-slate-600 mt-1">{t('features.answersDescription') || 'Ask natural questions across meetings; get cited, grounded answers.'}</p>
//               <ul className="text-sm mt-3 space-y-1 text-slate-700">
//                 <li>• {t('features.answers.items.crossMeetingSearch') /* Cross-meeting search */}</li>
//                 <li>• {t('features.answers.items.sourcesAttached') /* Sources attached */}</li>
//                 <li>• {t('features.answers.items.safeEnterpriseGuardrails') /* Safe enterprise guardrails */}</li>
//               </ul>
//             </div>
//             <div className="card p-6 shadow-soft">
//               <div className="h-10 w-10 rounded-xl bg-brand-500/15 text-brand-600 grid place-items-center font-bold">⇄</div>
//               <h3 className="font-semibold mt-3">{t('features.worksWith') /* Works with any platform */}</h3>
//               <p className="text-sm text-slate-600 mt-1">{t('features.worksWithDescription') || 'Google Meet, Zoom, Teams or offline recordings—drop in and go.'}</p>
//               <ul className="text-sm mt-3 space-y-1 text-slate-700">
//                 <li>• {t('features.works.items.multiLanguage') /* Multi-language */}</li>
//                 <li>• {t('features.works.items.templatesAutomations') /* Templates & automations */}</li>
//                 <li>• {t('features.works.items.adminControls') /* Admin controls */}</li>
//               </ul>
//             </div>
//           </div>

        
//           <div className="card p-6 mt-8">
//             <div className="grid md:grid-cols-2 gap-6">
//               <div>
//                 <h4 className="font-semibold">{t('features.beforeTitle') /* Before */}</h4>
//                 <ul className="mt-2 text-sm text-slate-700 space-y-2">
//                   <li>✗ {t('features.before.list.spendingTimeManualNotes') /* Spending time on manual notes */}</li>
//                   <li>✗ {t('features.before.list.missingContext') /* Missing context across meetings */}</li>
//                   <li>✗ {t('features.before.list.manualFollowups') /* Manual follow-ups */}</li>
//                 </ul>
//               </div>
//               <div>
//                 <h4 className="font-semibold text-brand-700">{t('features.withTitle') /* With Transcripta */}</h4>
//                 <ul className="mt-2 text-sm text-slate-700 space-y-2">
//                   <li>✓ {t('features.with.list.summariesActionItems') /* Summaries & action items in seconds */}</li>
//                   <li>✓ {t('features.with.list.answersAcross') /* Answers across all meetings with citations */}</li>
//                   <li>✓ {t('features.with.list.accurateFollowups') /* Accurate follow-ups sent automatically */}</li>
//                 </ul>
//               </div>
//             </div>
//           </div>
//         </section>

      
//         <section className="max-w-6xl mx-auto px-6 py-10">
//           <h2 className="text-center text-2xl font-bold">{t('testimonials.title') /* People around the world love Transcripta */}</h2>
//           <div className="grid md:grid-cols-3 gap-5 mt-6">
//             <div className="card p-5">
//               <p className="text-sm text-slate-700">{t('testimonials.items.one.quote') /* “Spending less time writing notes, more time making decisions.” */}</p>
//               <p className="mt-3 text-xs text-slate-500">— {t('testimonials.items.one.author') /* Michelle, Product Manager */}</p>
//             </div>
//             <div className="card p-5">
//               <p className="text-sm text-slate-700">{t('testimonials.items.two.quote') /* “The search across meetings with citations is a game changer.” */}</p>
//               <p className="mt-3 text-xs text-slate-500">— {t('testimonials.items.two.author') /* Tom, Ops Lead */}</p>
//             </div>
//             <div className="card p-5">
//               <p className="text-sm text-slate-700">{t('testimonials.items.three.quote') /* “Onboarded the team in minutes. Loved the admin controls.” */}</p>
//               <p className="mt-3 text-xs text-slate-500">— {t('testimonials.items.three.author') /* Ana, Eng Manager */}</p>
//             </div>
//           </div>
//         </section>

      
//         <section id="pricing" className="relative">
//           <div className="glow-wrap -z-10">
//             <div className="blob blob-cyan w-96 h-96 -top-10 left-1/4" />
//             <div className="blob blob-blue w-80 h-80 bottom-0 right-10" />
//           </div>

//           <div className="max-w-6xl mx-auto px-6 py-10">
//             <h2 className="text-center text-2xl font-bold">{t('pricing.title') /* Pricing */}</h2>
//             <p className="text-center text-slate-600 mt-2">{t('pricing.subtitle') /* Choose the perfect plan for your team. */}</p>

//             <div className="grid md:grid-cols-3 gap-5 mt-6">
//               <div className="card p-6 flex flex-col">
//                 <span className="badge w-max">{t('pricing.plans.starter.badge') /* Free */}</span>
//                 <h3 className="mt-3 text-lg font-semibold">{t('pricing.plans.starter.name') /* Starter */}</h3>
//                 <p className="price mt-2">{t('pricing.plans.starter.price') /* $0 */}</p>
//                 <ul className="mt-4 text-sm text-slate-700 space-y-2">
//                   <li>• {t('pricing.plans.starter.features.personalUse') /* Personal use */}</li>
//                   <li>• {t('pricing.plans.starter.features.uploads') /* 5 uploads/mo */}</li>
//                   <li>• {t('pricing.plans.starter.features.emailSupport') /* Email support */}</li>
//                 </ul>
//                 <a className="btn mt-6">{t('pricing.getStarted') /* Get Started */}</a>
//               </div>

//               <div className="card p-6 border-brand-200 border-2 shadow-soft flex flex-col">
//                 <span className="badge w-max">{t('pricing.plans.pro.badge') /* Most Popular */}</span>
//                 <h3 className="mt-3 text-lg font-semibold">{t('pricing.plans.pro.name') /* Pro */}</h3>
//                 <p className="price mt-2">{t('pricing.plans.pro.price') /* ₫299,000 */}</p>
//                 <ul className="mt-4 text-sm text-slate-700 space-y-2">
//                   <li>• {t('pricing.plans.pro.features.unlimitedSummaries') /* Unlimited summaries */}</li>
//                   <li>• {t('pricing.plans.pro.features.aiSearch') /* AI search & answers */}</li>
//                   <li>• {t('pricing.plans.pro.features.exportIntegrations') /* Export & integrations */}</li>
//                 </ul>
//                 <a className="btn mt-6">{t('pricing.getStarted') /* Get Started */}</a>
//               </div>

//               <div className="card p-6 flex flex-col">
//                 <span className="badge w-max">{t('pricing.plans.enterprise.badge') /* Enterprise */}</span>
//                 <h3 className="mt-3 text-lg font-semibold">{t('pricing.plans.enterprise.name') /* Custom */}</h3>
//                 <p className="price mt-2">{t('pricing.plans.enterprise.price') /* Contact us */}</p>
//                 <ul className="mt-4 text-sm text-slate-700 space-y-2">
//                   <li>• {t('pricing.plans.enterprise.features.sso') /* SSO & governance */}</li>
//                   <li>• {t('pricing.plans.enterprise.features.adminAnalytics') /* Admin & analytics */}</li>
//                   <li>• {t('pricing.plans.enterprise.features.dedicatedSupport') /* Dedicated support */}</li>
//                 </ul>
//                 <a className="btn mt-6">{t('pricing.talkToSales') /* Talk to Sales */}</a>
//               </div>
//             </div>
//           </div>
//         </section>


//         <section id="faq" className="max-w-3xl mx-auto px-6 py-10">
//           <h2 className="text-center text-2xl font-bold">{t('faq.title') /* Frequently Asked Questions */}</h2>
//           <div className="mt-6 space-y-3">
//             <details className="faq-item card p-4">
//               <summary className="cursor-pointer flex items-center gap-3 font-medium">{t('faq.items.how.title') /* How does Transcripta work? */}</summary>
//               <p className="mt-2 text-sm text-slate-700">{t('faq.items.how.answer') /* Record or upload meetings, we transcribe, summarize, and surface insights and action items with citations. */}</p>
//             </details>
//             <details className="faq-item card p-4">
//               <summary className="cursor-pointer flex items-center gap-3 font-medium">{t('faq.items.secure.title') /* Is my data secure? */}</summary>
//               <p className="mt-2 text-sm text-slate-700">{t('faq.items.secure.answer') /* We support SOC-2 practices, encryption at rest/in transit, and enterprise controls on request. */}</p>
//             </details>
//             <details className="faq-item card p-4">
//               <summary className="cursor-pointer flex items-center gap-3 font-medium">{t('faq.items.vietnamese.title') /* Do you support Vietnamese? */}</summary>
//               <p className="mt-2 text-sm text-slate-700">{t('faq.items.vietnamese.answer') /* Yes. Whisper/ASR supports vi + English, and output can be localized. */}</p>
//             </details>
//           </div>
//         </section>

      
//         <section id="about" className="max-w-4xl mx-auto px-6 py-10">
//           <h2 className="text-center text-2xl font-bold">{t('about.title') /* AI Product by XinKGroup */}</h2>
//           <div className="card p-6 mt-6">
//             <p className="text-sm text-slate-700">
//               Built by a team focused on digital transformation and practical AI. We care about accurate transcription,
//               grounded answers, and smooth workflows.
//             </p>
//           </div>
//         </section>


//         <section id="cta" className="relative">
//           <div className="glow-wrap -z-10">
//             <div className="blob blob-cyan w-[28rem] h-[28rem] -top-16 left-20" />
//             <div className="blob blob-blue w-[22rem] h-[22rem] bottom-6 right-32" />
//           </div>

//           <div className="max-w-4xl mx-auto px-6 py-14 text-center">
//             <h2 className="text-xl md:text-2xl font-extrabold">{t('cta.readyTitle') /* Ready to love your workday again? */}</h2>
//             <p className="mt-2 text-slate-600">{t('cta.tryNow') /* Try Transcript AI now. */}</p>
//             <div className="mt-6 flex items-center justify-center gap-3">
//               <a className="btn" href="/home">{t('cta.startFree') /* Start Free */}</a>
//               <a className="btn" href="#contact">{t('cta.bookDemo') /* Book demo */}</a>
//             </div>
//           </div>
//         </section>

//         <section id="contact" className="items-center gap-2 text-white px-3 py-1 text-xs font-medium shadow-sm bg-cyan-500">
//           <div className={`${container} py-16 sm:py-20`}>
//             <div className="grid lg:grid-cols-2 gap-10 lg:gap-12 items-start">
//               {/* LEFT: Copy + Contact cards */}
//               <div className="space-y-8 animate-fade-in-up">
//                 <div>
//                   <h3 className="text-3xl sm:text-4xl font-bold text-white mb-4 animate-scale-in stagger-1">
//                     {t('contact.title')}
//                   </h3>
//                   <p className="text-lg sm:text-xl text-white/85 leading-relaxed animate-fade-in-up stagger-2">
//                     {t('contact.subtitle')}
//                   </p>
//                 </div>

//                 {/* Cards */}
//                 <div className="space-y-5 md:space-y-6 text-base">
//                   {/* HOTLINE */}
//                   <div
//                     className="relative group flex items-center gap-4 p-4 md:p-5 rounded-2xl
//                               bg-white/35 border border-white/50 backdrop-blur
//                               shadow-lg transition-all duration-300 hover-lift
//                               animate-slide-up-stagger stagger-3"
//                   >
//                     <div
//                       className="relative size-11 grid place-items-center rounded-xl
//                                 bg-white/70 text-sky-600 shadow-inner"
//                       aria-hidden="true"
//                     >
//                       {/* ping */}
//                       <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-emerald-400">
//                         <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping" />
//                       </span>
//                       <Phone size={24} />
//                     </div>

//                     <div className="flex-1 min-w-0">
//                       <div className="flex items-center gap-2">
//                         <p className="font-semibold text-white">{t('contact.info.hotline')}</p>
//                         <span
//                           className="text-[11px] px-2 py-0.5 rounded-full
//                                     bg-emerald-400/20 text-emerald-50 border border-emerald-300/40"
//                         >
//                           {t('contact.info.available24')}
//                         </span>
//                       </div>
//                       <a
//                         href="tel:0862706996"
//                         className="text-white/85 font-medium hover:text-white transition-colors"
//                       >
//                         {t('contact.info.phone')}
//                       </a>
//                     </div>

//                     {/* glow */}
//                     <span
//                       className="pointer-events-none absolute inset-0 rounded-2xl
//                                 ring-0 ring-white/0 group-hover:ring-2 group-hover:ring-white/40
//                                 transition-all duration-300"
//                     />
//                   </div>

//                   {/* EMAIL */}
//                   <div
//                     className="relative group flex items-center gap-4 p-4 md:p-5 rounded-2xl
//                               bg-white/35 border border-white/50 backdrop-blur
//                               shadow-lg transition-all duration-300 hover-lift
//                               animate-slide-up-stagger stagger-4"
//                   >
//                     <div
//                       className="relative size-11 grid place-items-center rounded-xl
//                                 bg-white/70 text-sky-600 shadow-inner"
//                       aria-hidden="true"
//                     >
//                       <Mail size={24} />
//                     </div>

//                     <div className="flex-1 min-w-0">
//                       <p className="font-semibold text-white">{t('contact.info.email')}</p>
//                       <a
//                         href="mailto:hi@ixink.com"
//                         className="text-white/85 font-medium hover:text-white break-words transition-colors"
//                       >
//                         {t('contact.info.emailAddress')}
//                       </a>
//                     </div>

//                     <span
//                       className="pointer-events-none absolute inset-0 rounded-2xl
//                                 ring-0 ring-white/0 group-hover:ring-2 group-hover:ring-white/40
//                                 transition-all duration-300"
//                     />
//                   </div>

//                   {/* ADDRESS */}
//                   <div
//                     className="relative group flex items-center gap-4 p-4 md:p-5 rounded-2xl
//                               bg-white/35 border border-white/50 backdrop-blur
//                               shadow-lg transition-all duration-300 hover-lift
//                               animate-slide-up-stagger stagger-5"
//                   >
//                     <div
//                       className="relative size-11 grid place-items-center rounded-xl
//                                 bg-white/70 text-sky-600 shadow-inner"
//                       aria-hidden="true"
//                     >
//                       <MapPin size={24} />
//                     </div>

//                     <div className="flex-1 min-w-0">
//                       <p className="font-semibold text-white">{t('contact.info.address')}</p>
//                       <p className="text-white/85 font-medium leading-relaxed">
//                         {t('contact.info.addressText')}
//                       </p>
//                     </div>

//                     <span
//                       className="pointer-events-none absolute inset-0 rounded-2xl
//                                 ring-0 ring-white/0 group-hover:ring-2 group-hover:ring-white/40
//                                 transition-all duration-300"
//                     />
//                   </div>
//                 </div>
//               </div>

//               {/* RIGHT: Form */}
//               <form
//                 onSubmit={handleSubmit}
//                 className="space-y-6 animate-fade-in-up stagger-6">
//                 <div className="rounded-2xl p-8 shadow-xl shadow-blue-600/10 ring-1 ring-slate-200 bg-white">
//                   <h4 className="text-2xl font-bold text-slate-900 mb-6">{t('contact.form.title')}</h4>

//                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
//                   {/* Họ và tên */}
//                   <div className="space-y-2">
//                     <label htmlFor="contact-name" className="block text-sm font-semibold text-slate-700">
//                       {t('contact.form.name')} <span className="text-rose-500">{t('common.required')}</span>
//                     </label>
//                     <input
//                       id="contact-name"
//                       type="text"
//                       name="name"
//                       value={formData.name}
//                       onChange={handleChange}
//                       autoComplete="name"
//                       required
//                       className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white/90 text-slate-900 placeholder:text-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-200/60 outline-none transition-all"
//                       placeholder={t('contact.form.placeholders.name')}
//                     />
//                   </div>

//                   {/* Trung tâm đang hoạt động */}
//                   <div className="space-y-2">
//                     <label htmlFor="contact-center" className="block text-sm font-semibold text-slate-700">
//                       {t('contact.form.center')} <span className="text-rose-500">{t('common.required')}</span>
//                     </label>
//                     <input
//                       id="contact-center"
//                       type="text"
//                       name="center"
//                       value={formData.center}
//                       onChange={handleChange}
//                       required
//                       className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white/90 text-slate-900 placeholder:text-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-200/60 outline-none transition-all"
//                       placeholder={t('contact.form.placeholders.center')}
//                     />
//                   </div>

//                   {/* Email */}
//                   <div className="space-y-2">
//                     <label htmlFor="contact-email" className="block text-sm font-semibold text-slate-700">
//                       {t('contact.form.email')} <span className="text-rose-500">{t('common.required')}</span>
//                     </label>
//                     <input
//                       id="contact-email"
//                       type="email"
//                       name="email"
//                       value={formData.email}
//                       onChange={handleChange}
//                       autoComplete="email"
//                       required
//                       className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white/90 text-slate-900 placeholder:text-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-200/60 outline-none transition-all"
//                       placeholder={t('contact.form.placeholders.email')}
//                     />
//                   </div>

//                   {/* Số điện thoại (VN) */}
//                   <div className="space-y-2">
//                     <label htmlFor="contact-phone" className="block text-sm font-semibold text-slate-700">
//                       {t('contact.form.phone')} <span className="text-rose-500">{t('common.required')}</span>
//                     </label>
//                     <input
//                       id="contact-phone"
//                       type="tel"
//                       name="phone"
//                       value={formData.phone}
//                       onChange={handleChange}
//                       inputMode="tel"
//                       required
//                       pattern="^(\+84|0)\d{9,10}$"
//                       className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white/90 text-slate-900 placeholder:text-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-200/60 outline-none transition-all"
//                       placeholder={t('contact.form.placeholders.phone')}
//                     />
//                     <p className="text-xs text-slate-500">{t('contact.form.phoneFormat')}</p>
//                   </div>

//                   {/* Nhu cầu (full width) */}
//                   <div className="sm:col-span-2 space-y-2">
//                     <label htmlFor="contact-message" className="block text-sm font-semibold text-slate-700">
//                       {t('contact.form.message')} <span className="text-rose-500">{t('common.required')}</span>
//                     </label>
//                     <textarea
//                       id="contact-message"
//                       rows={4}
//                       name="message"
//                       value={formData.message}
//                       onChange={handleChange}
//                       required
//                       className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/90 text-slate-900 placeholder:text-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-200/60 outline-none transition-all resize-none"
//                       placeholder={t('contact.form.placeholders.message')}
//                     />
//                   </div>
//                 </div>


//                   <button
//                     as="button"
//                     type="submit"
//                     gradient="secondary"
//                     className="flex w-full mt-8 h-12 items-center justify-center gap-2 px-4 py-2 rounded-xl font-semibold text-white
//                               bg-cyan-500 hover:bg-cyan-600 active:bg-cyan-700 shadow-md
//                               focus:outline-none focus:ring-2 focus:ring-cyan-300"
//                   >
//                     <MessageCircle size={20} className="mr-2" />
//                     {t('contact.form.submit')}
//                   </button>

//                   <p className="text-center text-sm text-slate-500 mt-4">
//                     {t('contact.form.privacy')}
//                   </p>
//                 </div>
//               </form>
//             </div>
//           </div>
//         </section>
        
//         <footer className="bg-gradient-to-br from-slate-900 to-slate-800 text-slate-300">
//           <div className={`${container} py-16`}>
//             <div className="grid md:grid-cols-4 gap-8 mb-12">
//               {/* --- Brand / Company --- */}
//               <div className="md:col-span-2">
//                 {/* Logo sáng hơn nền + đứng trước phần giới thiệu */}
//                 <div className="flex items-center gap-3 mb-4">
                  
//                   <span className="font-bold text-white text-xl">XINK MEET</span>
//                   {/* Transform your meetings into actionable insights with AI-powered transcription and analysis. */}
//                   {/* <p className="text-slate-400">{t('footer.companyDescription')}</p> */}
//                 </div>

//                 {/* Giới thiệu công ty */}
//                 <div className="text-slate-300/90 leading-relaxed space-y-2 max-w-xl">
              
//                   <p>{t('footer.company')}</p>
//                   <p>{t('footer.companyInfo')}</p>
//                   <p>{t('footer.address')}</p>
//                 </div>

//                 {/* Quick actions */}
//                 <div className="mt-6 flex gap-4">
//                   <div className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer">
//                     <Phone size={20} className="text-blue-400"/>
//                   </div>
//                   <div className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer">
//                     <Mail size={20} className="text-green-400"/>
//                   </div>
//                   <div className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer">
//                     <MapPin size={20} className="text-purple-400"/>
//                   </div>
//                 </div>
//               </div>

//               {/* --- Products --- */}
//               <div>
//                 <h4 className="font-bold text-white mb-6">{t('footer.products.title')}</h4>
//                 <ul className="space-y-3 text-slate-400">
//                   <li><a href="#features" className="hover:text-white transition-colors">{t('footer.products.features')}</a></li>
//                   <li><a href="#pricing" className="hover:text-white transition-colors">{t('footer.products.pricing')}</a></li>
//                   <li><a href="#testimonials" className="hover:text-white transition-colors">{t('footer.products.testimonials')}</a></li>
//                   <li><a href="#contact" className="hover:text-white transition-colors">{t('footer.products.demo')}</a></li>
//                 </ul>
//               </div>

//               {/* --- Support --- */}
//               <div>
//                 <h4 className="font-bold text-white mb-6">{t('footer.support.title')}</h4>
//                 <ul className="space-y-3 text-slate-400">
//                   <li><a href="#faq" className="hover:text-white transition-colors">{t('footer.support.faq')}</a></li>
//                   <li><a href="#contact" className="hover:text-white transition-colors">{t('footer.support.contact')}</a></li>
//                   <li><a href="#" className="hover:text-white transition-colors">{t('footer.support.docs')}</a></li>
//                   <li><a href="#" className="hover:text-white transition-colors">{t('footer.support.guide')}</a></li>
//                 </ul>
//               </div>
//             </div>

//             {/* Bottom bar */}
//             <div className="border-t border-slate-700 pt-8">
//               <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
//                 <div className="flex items-center gap-3">
//                   <img
//                     src="xink.png"
//                     alt=""
//                     width={20}
//                     height={20}
//                     loading="lazy"
//                     className="rounded-md brightness-110 opacity-90"
//                   />
//                   <div className="text-slate-400 text-sm">{t('footer.legal.copyright')}</div>
//                 </div>
//                 <div className="flex gap-6 text-slate-400 text-sm">
//                   <a className="hover:text-white transition-colors" href="#">{t('footer.legal.terms')}</a>
//                   <a className="hover:text-white transition-colors" href="#">{t('footer.legal.privacy')}</a>
//                   <a className="hover:text-white transition-colors" href="#">{t('footer.legal.policy')}</a>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </footer>
//       </div>
//     </>
//   );
// }

import { Link } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import LoginForm from "../components/LoginForm";
import axios from "axios";
import { useLanguage } from "../contexts/LanguageContext";
import { getTranslation } from "../translations";

// Import các components con mới
import Header from "./landing/Header";
import Hero from "./landing/Hero";
import Features from "./landing/Features";
import Testimonials from "./landing/Testimonials";
import Pricing from "./landing/Pricing";
import FAQ from "./landing/FAQ";
import CTA from "./landing/CTA";
import Contact from "./landing/Contact";
import Footer from "./landing/Footer";

// Import file CSS của bạn
import "../styles/langdingpage.css";

export default function LandingPage() {
  const [showLogin, setShowLogin] = useState(false);
  const { user } = useAuth();
  const { language } = useLanguage();
  const t = (key) => getTranslation(language, key);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
    center: "",
    phone: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("https://xink-edu-backend-459095746983.asia-southeast1.run.app/contact", formData);
      console.log(res);
      if (res.status === 200) {
        alert("Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi trong vòng 24h.");
        setFormData({ name: "", email: "", message: "", center: "", phone: "" }); // Reset form
      } else {
        alert("Lỗi khi gửi liên hệ! Vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Contact form error:", error);
      alert("Lỗi khi gửi liên hệ! Vui lòng thử lại.");
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <>
      {showLogin && <LoginForm onClose={() => setShowLogin(false)} />}

      <div className="min-h-screen antialiased text-slate-800 bg-gradient-to-b from-brand-50 via-white to-brand-100">
        
        {/* Glow blobs nền chung */}
        <div className="glow-wrap fixed -z-10">
          <div className="blob blob-cyan w-80 h-80 -top-10 -left-10" />
          <div className="blob blob-blue w-96 h-96 top-10 right-10" />
          <div className="blob blob-lime w-72 h-72 bottom-20 left-1/3" />
        </div>

        <Header 
          user={user} 
          onLoginClick={() => setShowLogin(true)} 
          t={t} 
        />

        <main>
          <Hero
            t={t}
            onLoginClick={() => setShowLogin(true)} 
          />
          <Features t={t} />
          <Testimonials t={t} />
          <Pricing t={t} />
          <FAQ t={t} />
          <CTA t={t} />
          <Contact
            t={t}
            formData={formData}
            handleChange={handleChange}
            handleSubmit={handleSubmit}
          />
        </main>

        <Footer t={t} />
      </div>
    </>
  );
}