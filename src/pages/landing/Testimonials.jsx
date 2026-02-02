import { useRef } from "react";
import Section from "./Section";
import { Star } from "lucide-react";
import useScrollReveal from "../../hooks/useScrollReveal";

function TestimonialCard({author, title, quote, className = "", style = {}}){
 
  return (
    <div className={`group relative ${className}`} style={style}>
      <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-blue-600/20 to-indigo-600/20 blur opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className="h-full relative rounded-3xl bg-white p-8 shadow-lg ring-1 ring-slate-200 group-hover:shadow-xl group-hover:ring-blue-200 transition-all duration-500 hover-lift">
        {/* Shimmer effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-shimmer rounded-3xl" />
        
        <div className="flex items-start gap-4 mb-6 relative z-10">
          <div className="flex-shrink-0">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-cyan-600 to-blue-200 flex items-center justify-center text-white font-bold text-lg shadow-lg transition-all duration-300">
              {author.charAt(0)}
            </div>
          </div>
          <div className="flex-1">
            <p className="font-bold text-slate-900 text-lg group-hover:text-blue-700 transition-colors duration-300">{author}</p>
            <p className="text-slate-600 font-medium group-hover:text-slate-700 transition-colors duration-300">{title}</p>
            <div className="flex items-center gap-2 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} className="text-yellow-400 fill-current"/>
              ))}
            </div>
          </div>
        </div>
        <blockquote className="text-slate-700 leading-relaxed text-lg italic group-hover:text-slate-800 transition-colors duration-300 relative z-10">
          "{quote}"
        </blockquote>
        
        {/* Floating particles */}
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-float" style={{animationDelay: '0s'}} />
          <div className="w-1 h-1 bg-cyan-400 rounded-full animate-float mt-2" style={{animationDelay: '0.5s'}} />
          <div className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-float mt-1" style={{animationDelay: '1s'}} />
        </div>
      </div>
    </div>
  );
}

export default function Testimonials({ t }) {
  const rootRef = useRef(null);
  useScrollReveal(rootRef, "reveal-up", "is-visible", { threshold: 0.15, once: true });
  
  const items = t('testimonials.items');

  return (
    <Section maxWidth="7xl" className="bg-cyan-500">
      <div ref={rootRef} className="space-y-12">
        <h2 className="text-white text-center text-2xl font-bold reveal-up">{t('testimonials.title') /* People around the world love Transcripta */}</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((t, index) => <TestimonialCard key={t.id} {...t} className={`reveal-up animate-bounce-in stagger-${index + 3}`} />)}
        </div>
      </div>
    </Section>
  );
}