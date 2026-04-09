'use client';
import { useEffect, useRef, useState } from 'react';

function Counter({ target, suffix = '', started }: { target: number; suffix?: string; started: boolean }) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!started) return;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current = Math.min(current + increment, target);
      setValue(Math.floor(current));
      if (current >= target) clearInterval(timer);
    }, 2000 / steps);
    return () => clearInterval(timer);
  }, [started, target]);
  return <>{value.toLocaleString()}{suffix}</>;
}

export default function AnimatedStats() {
  const statsRef = useRef<HTMLDivElement>(null!);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setStarted(true); observer.disconnect(); } },
      { threshold: 0.5 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={statsRef} className="border-y border-white/5 bg-white/[0.02] py-10">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="grid grid-cols-3 gap-6 text-center">
          {[
            { value: 12000, suffix: '+', label: 'Resumes Built' },
            { value: 85, suffix: '%', label: 'Interview Rate' },
            { value: 94, suffix: '%', label: 'Avg ATS Score' },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-3xl sm:text-4xl font-black gradient-text counter-value mb-1">
                <Counter target={stat.value} suffix={stat.suffix} started={started} />
              </div>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
