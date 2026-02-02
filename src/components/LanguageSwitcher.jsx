import { useState, useEffect, useRef } from 'react';
import { Globe, X, Check } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { getTranslation } from '../translations';

const languages = [
  { code: 'vi', name: 'Tiếng Việt', flag: 'vi', short: 'VI' },
  { code: 'en', name: 'English', flag: 'en', short: 'EN' },
  { code: 'ko', name: '한국어', flag: 'kr', short: 'KR' },
  { code: 'zh', name: '中文', flag: 'zh', short: 'ZH' },
  { code: 'ja', name: '日本語', flag: 'jp', short: 'JP' }
];

export default function LanguageSwitcher() {
  const { language, changeLanguage } = useLanguage();
  const [isMobile, setIsMobile] = useState(false);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [isDesktopOpen, setIsDesktopOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const containerRef = useRef(null);
  const t = (key) => getTranslation(language, key);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleLanguageChange = (langCode) => {
    changeLanguage(langCode);
    setIsBottomSheetOpen(false);
  };

  const openBottomSheet = () => {
    setIsBottomSheetOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeBottomSheet = () => {
    setIsBottomSheetOpen(false);
    document.body.style.overflow = 'unset';
  };

  // Click outside to close the desktop dropdown
  useEffect(() => {
    const handler = (e) => {
      if (!isDesktopOpen) return;
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsDesktopOpen(false);
        setHighlightIndex(-1);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isDesktopOpen]);

  // Desktop: custom dropdown selector with pretty opened list
  if (!isMobile) {
    const current = languages.find((l) => l.code === language) || languages[0];
    return (
      <div ref={containerRef} className="relative inline-flex items-stretch bg-slate-50/80 backdrop-blur-sm rounded-2xl p-1 border border-slate-200/60 shadow-sm">
        {/* Combobox button */}
        <button
          type="button"
          className={`relative inline-flex items-center gap-2 pl-3 pr-8 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200 ${isDesktopOpen ? 'ring-2 ring-blue-200' : ''}`}
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={isDesktopOpen}
          aria-label={t('language.changeLanguage')}
          onClick={() => setIsDesktopOpen((v) => !v)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              setIsDesktopOpen(true);
              setHighlightIndex((i) => (i + 1) % languages.length);
            } else if (e.key === 'ArrowUp') {
              e.preventDefault();
              setIsDesktopOpen(true);
              setHighlightIndex((i) => (i - 1 + languages.length) % languages.length);
            } else if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              if (!isDesktopOpen) {
                setIsDesktopOpen(true);
              } else if (highlightIndex >= 0) {
                handleLanguageChange(languages[highlightIndex].code);
                setIsDesktopOpen(false);
              }
            } else if (e.key === 'Escape') {
              setIsDesktopOpen(false);
              setHighlightIndex(-1);
            }
          }}
        >
          <span className='hidden lg:inline-block'>{current.name} ({current.short})</span>
          <span className='lg:hidden'>
            {current.short}
          </span>
          {/* Chevron */}
          <span className={`pointer-events-none absolute right-2 inline-flex transition-transform ${isDesktopOpen ? 'rotate-180' : ''}`}>
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-slate-400">
              <path d="M6 8l4 4 4-4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </button>

        {/* Dropdown list */}
        {isDesktopOpen && (
          <div
            role="listbox"
            aria-activedescendant={highlightIndex >= 0 ? `lang-${languages[highlightIndex].code}` : undefined}
            className="absolute right-0 top-full mt-2 w-48 rounded-2xl bg-white border border-slate-200 shadow-xl ring-1 ring-black/5 overflow-hidden z-50"
          >
            <ul className="py-1 max-h-72 overflow-auto">
              {languages.map((lang, idx) => {
                const selected = language === lang.code;
                const highlighted = idx === highlightIndex;
                return (
                  <li key={lang.code} id={`lang-${lang.code}`} role="option" aria-selected={selected}>
                    <button
                      type="button"
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-all ${
                        highlighted ? 'bg-slate-50' : 'bg-white'
                      } ${selected ? 'text-blue-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'}`}
                      onMouseEnter={() => setHighlightIndex(idx)}
                      onFocus={() => setHighlightIndex(idx)}
                      onClick={() => {
                        handleLanguageChange(lang.code);
                        setIsDesktopOpen(false);
                        setHighlightIndex(-1);
                      }}
                    >
                      <span className="w-6 text-lg leading-none">{lang.flag || lang.short}</span>
                      <span className="flex-1">
                        {lang.name} 
                      </span>
                      {selected && (
                        <Check size={16} className="text-blue-600" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    );
  }

  // Mobile: Elegant globe button + Premium bottom sheet
  return (
    <>
      <button
        onClick={openBottomSheet}
        className="group flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200/80 hover:border-blue-300/60 hover:from-blue-50 hover:to-blue-100 transition-all duration-300 ease-out shadow-sm hover:shadow-md text-slate-600 hover:text-blue-600"
        aria-label={t('language.changeLanguage')}
      >
        <Globe size={18} className="group-hover:scale-110 transition-transform duration-300" />
      </button>

      {/* Premium Bottom Sheet Portal */}
      {isBottomSheetOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-end">
          {/* Elegant Backdrop */}
          <div 
            className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/40 to-transparent backdrop-blur-sm" 
            onClick={closeBottomSheet}
          />
          
          {/* Premium Bottom Sheet */}
          <div className="relative w-full bg-white/95 backdrop-blur-xl rounded-t-3xl shadow-2xl max-h-[85vh] overflow-hidden border-t border-slate-200/60">
            {/* Elegant Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200/60 bg-gradient-to-r from-slate-50/80 to-white/80">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  <Globe size={16} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">{t('language.selectLanguage')}</h3>
              </div>
              <button
                onClick={closeBottomSheet}
                className="p-2 rounded-xl hover:bg-slate-100/80 transition-all duration-200 group"
              >
                <X size={20} className="text-slate-500 group-hover:text-slate-700 transition-colors" />
              </button>
            </div>
            
            {/* Premium Language Options */}
            <div className="p-6 space-y-3">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`group w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-left transition-all duration-300 ease-out ${
                    language === lang.code
                      ? 'bg-gradient-to-r from-blue-50 to-blue-100/80 text-blue-800 border border-blue-200/60 shadow-md scale-[1.02]'
                      : 'hover:bg-slate-50/80 text-slate-700 hover:scale-[1.01] hover:shadow-sm'
                  }`}
                >
                  <div className="relative">
                    <span className="text-3xl filter drop-shadow-sm">{lang.flag}</span>
                    {language === lang.code && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center animate-pulse">
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-base">{lang.name}</div>
                    <div className="text-sm text-slate-500 font-medium">{lang.short}</div>
                  </div>
                  {language === lang.code && (
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                      <div className="w-3 h-3 bg-white rounded-full" />
                    </div>
                  )}
                </button>
              ))}
            </div>
            
            {/* Elegant Footer */}
            <div className="p-6 bg-gradient-to-r from-slate-50/60 to-white/60 border-t border-slate-200/60">
              <div className="text-center text-sm text-slate-500">
                {t('language.selectLanguageDescription')}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

  