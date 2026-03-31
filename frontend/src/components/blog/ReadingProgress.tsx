'use client';

import { useEffect, useState } from 'react';

export default function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      const article = document.getElementById('article-body');
      if (!article) return;
      const articleTop = article.offsetTop;
      const articleHeight = article.offsetHeight;
      const scrolled = window.scrollY - articleTop;
      const pct = Math.max(0, Math.min(100, (scrolled / (articleHeight - window.innerHeight)) * 100));
      setProgress(pct);
    };
    window.addEventListener('scroll', update, { passive: true });
    update();
    return () => window.removeEventListener('scroll', update);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-[3px] bg-white/5">
      <div
        className="h-full transition-[width] duration-100 ease-linear"
        style={{
          width: `${progress}%`,
          background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #06b6d4)',
        }}
      />
    </div>
  );
}
