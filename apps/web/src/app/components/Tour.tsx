import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { TourStep } from '@/app/tourSteps';

interface TourProps {
  steps: TourStep[];
  onClose: () => void;
}

const cardWidth = 340;

export function Tour({ steps, onClose }: TourProps) {
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const card = useRef<HTMLDivElement>(null);
  const step = steps[index];
  const last = index === steps.length - 1;

  useLayoutEffect(() => {
    const measure = () => {
      const element = step.target ? document.querySelector(step.target) : null;
      if (!element) {
        setRect(null);
        return;
      }
      element.scrollIntoView({ block: 'nearest' });
      const box = element.getBoundingClientRect();
      const visible = box.width > 0 && box.right > 0 && box.left < window.innerWidth;
      setRect(visible ? box : null);
    };
    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    return () => {
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
    };
  }, [index]);

  useEffect(() => {
    card.current?.focus();
  }, [index]);

  const placement = (): React.CSSProperties => {
    if (!rect) {
      return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    }
    const left = Math.min(Math.max(12, rect.left), window.innerWidth - cardWidth - 12);
    if (rect.height > window.innerHeight * 0.6) {
      return { top: rect.top + 16, left: Math.min(Math.max(12, rect.left + 16), window.innerWidth - cardWidth - 12) };
    }
    if (rect.bottom < window.innerHeight * 0.55) {
      return { top: rect.bottom + 14, left };
    }
    return { bottom: window.innerHeight - rect.top + 14, left };
  };

  return (
    <div className="fixed inset-0 z-[100]">
      <div className="absolute inset-0" onClick={onClose} aria-hidden />
      {rect ? (
        <div
          aria-hidden
          className="absolute rounded-lg pointer-events-none"
          style={{
            top: rect.top - 6,
            left: rect.left - 6,
            width: rect.width + 12,
            height: rect.height + 12,
            boxShadow: '0 0 0 9999px rgba(15, 23, 42, 0.6)',
            outline: '3px solid #60a5fa',
          }}
        />
      ) : (
        <div aria-hidden className="absolute inset-0 bg-slate-900/60 pointer-events-none" />
      )}
      <div
        ref={card}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tour-title"
        tabIndex={-1}
        onKeyDown={e => {
          if (e.key === 'Escape') onClose();
        }}
        className="absolute rounded-xl bg-white p-5 shadow-2xl outline-none"
        style={{ width: Math.min(cardWidth, window.innerWidth - 24), ...placement() }}
      >
        <p className="text-xs font-semibold uppercase text-blue-700">
          Step {index + 1} of {steps.length}
        </p>
        <h2 id="tour-title" className="mt-1 text-lg font-bold text-gray-900">
          {step.title}
        </h2>
        <p className="mt-2 text-sm text-gray-700">{step.body}</p>
        <div className="mt-4 flex items-center gap-2">
          <button type="button" onClick={onClose} className="mr-auto text-sm text-gray-500 hover:text-gray-800">
            Skip tour
          </button>
          {index > 0 && (
            <button
              type="button"
              onClick={() => setIndex(index - 1)}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-100"
            >
              Back
            </button>
          )}
          <button
            type="button"
            onClick={() => (last ? onClose() : setIndex(index + 1))}
            className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            {last ? 'Done' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}
