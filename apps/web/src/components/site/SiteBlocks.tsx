import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Plus } from 'lucide-react';
import { useSiteCopy } from '../../lib/siteCopy';

/** Common container of the public pages. */
export const Section: React.FC<{ children: React.ReactNode; className?: string; id?: string }> = ({
  children,
  className = '',
  id,
}) => (
  <section id={id} className={`max-w-[1200px] mx-auto px-4 sm:px-6 pt-14 sm:pt-24 scroll-mt-24 ${className}`}>
    {children}
  </section>
);

/** Small label + big title (+ optional text) used to open a section. */
export const SectionHead: React.FC<{ label?: string; title: string; text?: string; className?: string }> = ({
  label,
  title,
  text,
  className = '',
}) => (
  <div className={`flex flex-col gap-2.5 max-w-[640px] ${className}`}>
    {label && <span className="micro">{label}</span>}
    <h2 className="text-[clamp(26px,3.2vw,38px)] font-bold leading-[1.1] tracking-[-0.02em] rtl:tracking-normal rtl:leading-[1.3]">
      {title}
    </h2>
    {text && <p className="text-slate-600 dark:text-slate-300">{text}</p>}
  </div>
);

/** Heading block of an inner page: breadcrumb, title, lead. */
export const PageHead: React.FC<{ crumb: string; title: string; lead: string }> = ({ crumb, title, lead }) => {
  const c = useSiteCopy();
  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
      <div className="grid gap-4 max-w-[820px] pt-10 sm:pt-16 pb-3">
        <div className="flex items-center gap-2 text-[13px] font-semibold text-slate-600 dark:text-slate-400">
          <Link to="/" className="hover:underline">
            {c.nav.home}
          </Link>
          <ArrowRight className="w-3.5 h-3.5 rtl:-scale-x-100" aria-hidden="true" />
          <span>{crumb}</span>
        </div>
        <h1 className="text-[clamp(34px,4.6vw,58px)] font-bold leading-[1.04] tracking-[-0.03em] rtl:tracking-normal rtl:leading-[1.25]">
          {title}
        </h1>
        <p className="text-[clamp(16px,1.6vw,19px)] text-slate-600 dark:text-slate-300 max-w-[60ch]">{lead}</p>
      </div>
    </div>
  );
};

/** One question and its answer, as a native disclosure (keyboard and screen-reader friendly). */
export const FaqAccordion: React.FC<{ items: { q: string; a: string }[] }> = ({ items }) => (
  <div className="border-t border-light-border dark:border-dark-border">
    {items.map((it) => (
      <details key={it.q} className="group border-b border-light-border dark:border-dark-border">
        <summary className="list-none cursor-pointer flex items-center justify-between gap-4 py-5 font-display font-semibold text-[19px] [&::-webkit-details-marker]:hidden">
          {it.q}
          <span className="w-[34px] h-[34px] shrink-0 grid place-items-center rounded-full border-[1.5px] border-light-border dark:border-dark-border transition-transform group-open:rotate-45 group-open:bg-light-tile dark:group-open:bg-dark-surface">
            <Plus className="w-[18px] h-[18px]" aria-hidden="true" />
          </span>
        </summary>
        <p className="pb-5 max-w-[68ch] text-slate-600 dark:text-slate-300">{it.a}</p>
      </details>
    ))}
  </div>
);

/** Closing call to action shared by the public pages. */
export const CtaBand: React.FC = () => {
  const c = useSiteCopy();
  return (
    <Section>
      <div className="panel p-7 sm:p-14 grid md:grid-cols-2 gap-6 items-center">
        <div>
          <h2 className="text-[clamp(26px,3.2vw,38px)] font-bold leading-[1.1] text-white">{c.cta.title}</h2>
          <p className="mt-3 max-w-[46ch] text-white/90">{c.cta.text}</p>
        </div>
        <div className="flex flex-wrap gap-3 md:justify-end">
          <Link
            to="/login?role=CLIENT"
            className="h-14 px-8 rounded-full bg-brand-accent hover:bg-brand-accent-hover text-brand-on-accent font-bold inline-flex items-center gap-2.5 transition-colors"
          >
            {c.cta.ask}
            <ArrowRight className="w-5 h-5 rtl:-scale-x-100" aria-hidden="true" />
          </Link>
          <Link
            to="/register?role=PROVIDER"
            className="h-14 px-8 rounded-full border-[1.5px] border-white/55 hover:bg-white/10 font-bold inline-flex items-center transition-colors"
          >
            {c.nav.becomePro}
          </Link>
        </div>
      </div>
    </Section>
  );
};
