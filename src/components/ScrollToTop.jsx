import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname } = useLocation();
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // 1. Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  // 2. Track scroll position for visibility and progress circle
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      
      // Calculate progress percentage
      if (docHeight > 0) {
        const progress = (scrollTop / docHeight) * 100;
        setScrollProgress(progress);
      }

      // Show button if scrolled down past 300px
      if (scrollTop > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Initial call in case the page is already scrolled
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // SVG parameters for the progress circle
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (scrollProgress / 100) * circumference;

  return (
    <button
      onClick={scrollToTop}
      aria-label="Scroll to top"
      id="scroll-to-top-btn"
      className={`fixed bottom-6 right-6 z-50 flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-2xl transition-all duration-500 ease-out transform cursor-pointer border border-slate-100 hover:border-[#5D34F7]/30 group ${
        isVisible 
          ? 'opacity-100 translate-y-0 scale-100' 
          : 'opacity-0 translate-y-6 scale-75 pointer-events-none'
      }`}
    >
      {/* Background radial gradient glow on hover */}
      <span className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#5D34F7]/5 to-[#FF477E]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Circular Progress Ring */}
      <svg className="absolute w-full h-full transform -rotate-90 select-none pointer-events-none">
        <circle
          cx="24"
          cy="24"
          r={radius}
          className="stroke-slate-100/60"
          strokeWidth="3.5"
          fill="transparent"
        />
        <circle
          cx="24"
          cy="24"
          r={radius}
          className="stroke-[url(#scroll-grad)] transition-all duration-75"
          strokeWidth="3.5"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="scroll-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#5D34F7" />
            <stop offset="100%" stopColor="#FF477E" />
          </linearGradient>
        </defs>
      </svg>

      {/* Up Arrow Icon */}
      <svg
        className="w-5 h-5 text-slate-700 group-hover:text-[#5D34F7] group-hover:-translate-y-0.5 transition-all duration-300 ease-out relative z-10"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
      </svg>
    </button>
  );
}
