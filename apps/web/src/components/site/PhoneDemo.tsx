import React, { useEffect, useState } from 'react';
import { Clock, Phone, Star } from 'lucide-react';
import { useSiteCopy } from '../../lib/siteCopy';

const reduced = () =>
  typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

const box = 'rounded-[14px] border-[1.5px] border-light-border bg-white px-3 py-2.5 screen-in';

/** A phone showing the client's journey in five screens. It plays by itself (nothing to click); still under reduced motion. */
export const PhoneDemo: React.FC = () => {
  const c = useSiteCopy().demo;
  const [i, setI] = useState(0);

  useEffect(() => {
    if (reduced()) return;
    const id = setInterval(() => setI((n) => (n + 1) % 5), 3400);
    return () => clearInterval(id);
  }, []);

  const screens = [
    <>
      <h4 className="font-display text-[22px] font-bold leading-tight screen-in">{c.describe}</h4>
      <div className={box}>
        <span className="text-xs text-slate-600">{c.trade}</span>
        <div className="font-semibold">{c.tradeValue}</div>
      </div>
      <div className={box}>
        <span className="text-xs text-slate-600">{c.description}</span>
        <div className="font-semibold">{c.descriptionValue}</div>
      </div>
      <div className={box}>
        <span className="text-xs text-slate-600">{c.address}</span>
        <div className="font-semibold">{c.addressValue}</div>
      </div>
      <div className="mt-auto rounded-full bg-brand-accent py-3 text-center font-bold text-brand-on-accent screen-in">
        {c.ask}
      </div>
    </>,
    <>
      <h4 className="font-display text-[22px] font-bold leading-tight screen-in">{c.searching}</h4>
      <div className="grid flex-1 place-items-center screen-in">
        <svg viewBox="0 0 200 200" width="190" height="190" aria-hidden="true">
          <g fill="none" stroke="#D9E0D2" strokeWidth="2">
            <circle cx="100" cy="100" r="92" />
            <circle cx="100" cy="100" r="62" />
            <circle cx="100" cy="100" r="32" />
          </g>
          <circle cx="100" cy="100" r="8" fill="#0D5C3A" />
          <circle cx="100" cy="100" r="14" fill="none" stroke="#0D5C3A" strokeWidth="3">
            <animate attributeName="r" from="10" to="92" dur="1.8s" repeatCount="indefinite" />
            <animate attributeName="opacity" from=".9" to="0" dur="1.8s" repeatCount="indefinite" />
          </circle>
          {[
            [150, 60],
            [52, 128],
            [128, 154],
          ].map(([x, y]) => (
            <circle key={x} cx={x} cy={y} r="7" fill="#A3E635" stroke="#0D5C3A" strokeWidth="3" />
          ))}
        </svg>
      </div>
      <p className="text-center text-xs text-slate-600 screen-in">{c.searchingNote}</p>
    </>,
    <>
      <h4 className="font-display text-[22px] font-bold leading-tight screen-in">{c.accepted}</h4>
      <div className={`${box} flex items-center gap-3`}>
        <span
          className="grid h-11 w-11 place-items-center rounded-full bg-brand-500 font-display font-bold text-white"
          aria-hidden="true"
        >
          A
        </span>
        <div>
          <b>{c.onTheWay}</b>
          <div className="text-xs text-slate-600">{c.tradeValue}</div>
        </div>
      </div>
      <div className={`${box} flex items-center gap-2.5`}>
        <Clock className="h-5 w-5 text-brand-500" aria-hidden="true" />
        <b>{c.tracking}</b>
      </div>
      <div className="mt-auto flex items-center justify-center gap-2 rounded-full bg-brand-500 py-3 font-bold text-white screen-in">
        <Phone className="h-4 w-4" aria-hidden="true" />
        {c.call}
      </div>
    </>,
    <>
      <h4 className="font-display text-[22px] font-bold leading-tight screen-in">{c.onTheWay}</h4>
      <div className="relative h-[230px] overflow-hidden rounded-2xl bg-light-tile screen-in">
        <svg
          viewBox="0 0 400 400"
          preserveAspectRatio="xMidYMid slice"
          className="absolute inset-0 h-full w-full"
          aria-hidden="true"
        >
          <g stroke="#D9E0D2" strokeWidth="14" fill="none" strokeLinecap="round">
            <path d="M-10 300 L180 250 L250 410" />
            <path d="M110 -10 L150 410" />
            <path d="M-10 110 L420 160" />
            <path d="M300 -10 L340 410" />
          </g>
          <path
            d="M70 340 C120 300 170 250 215 190"
            fill="none"
            stroke="#0D5C3A"
            strokeWidth="5"
            strokeDasharray="2 12"
            strokeLinecap="round"
          />
          <circle cx="70" cy="340" r="14" fill="#A3E635" stroke="#0D5C3A" strokeWidth="4" />
          <circle cx="215" cy="190" r="13" fill="#0D5C3A" stroke="#fff" strokeWidth="4" />
        </svg>
      </div>
      <div className="grid grid-cols-6 gap-1 screen-in" aria-hidden="true">
        {[0, 1, 2, 3, 4, 5].map((n) => (
          <i
            key={n}
            className={`block h-[5px] rounded-full ${n < 2 ? 'bg-brand-accent' : n === 2 ? 'bg-brand-500' : 'bg-light-border'}`}
          />
        ))}
      </div>
    </>,
    <>
      <h4 className="font-display text-[22px] font-bold leading-tight screen-in">{c.howWas}</h4>
      <div className="flex gap-1 text-[#F2B84B] screen-in" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((n) => (
          <Star key={n} className="h-7 w-7 fill-current" />
        ))}
      </div>
      <div className={box}>
        <span className="text-xs text-slate-600">{c.yourReview}</span>
        <div className="font-semibold">{c.reviewValue}</div>
      </div>
      <div className="mt-auto rounded-full bg-brand-accent py-3 text-center font-bold text-brand-on-accent screen-in">
        {c.sendReview}
      </div>
    </>,
  ];

  return (
    <div className="grid justify-items-center gap-4">
      <div
        role="img"
        aria-label={c.label}
        className="relative h-[580px] w-[288px] shrink-0 rounded-[44px] bg-[#06100B] p-2.5 shadow-[0_30px_60px_-20px_rgba(0,0,0,.45)] before:absolute before:left-1/2 before:top-[18px] before:z-10 before:h-[22px] before:w-[84px] before:-translate-x-1/2 before:rounded-xl before:bg-[#06100B] before:content-['']"
        dir="ltr"
      >
        <div className="flex h-full w-full flex-col gap-3 overflow-hidden rounded-[34px] bg-light-bg px-[18px] pb-[18px] pt-11 text-[13px] text-[#0E2A1F]">
          <div key={i} className="flex h-full flex-col gap-3" dir="auto">
            {screens[i]}
          </div>
        </div>
      </div>
      {/* Progress only: the demo is not interactive. */}
      <div className="flex gap-1.5" aria-hidden="true">
        {c.tabs.map((label, k) => (
          <i
            key={label}
            className={`block h-1.5 rounded-full transition-all duration-300 ${i === k ? 'w-6 bg-brand-accent' : 'w-1.5 bg-white/30'}`}
          />
        ))}
      </div>
      <span className="text-xs text-white/70">{c.sample}</span>
    </div>
  );
};
