import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Droplets,
  Zap,
  Snowflake,
  KeyRound,
  Car,
  Paintbrush,
  Hammer,
  Wrench,
  ArrowRight,
  MapPin,
  ShieldCheck,
  Navigation,
  Star,
  Tag,
} from 'lucide-react';
import { PublicLayout } from '../layouts/PublicLayout';
import { LiveDot } from '../components/ui/LiveDot';
import { PhoneDemo } from '../components/site/PhoneDemo';
import { CtaBand, FaqAccordion, Section, SectionHead } from '../components/site/SiteBlocks';
import { useLanguageStore } from '../store/useLanguageStore';
import { useSiteCopy } from '../lib/siteCopy';
import { landingCopy } from '../lib/landingCopy';

const SERVICE_ICONS: Record<string, React.ElementType> = {
  plomb: Droplets,
  elec: Zap,
  clim: Snowflake,
  serr: KeyRound,
  meca: Car,
  pein: Paintbrush,
  menu: Hammer,
  autre: Wrench,
};
const WHY_ICONS = [ShieldCheck, Navigation, Star];

const fieldLabel = 'text-[13px] font-semibold text-slate-900';
const fieldBox =
  'flex items-center gap-2.5 h-[50px] px-4 rounded-field bg-light-tile border-[1.5px] border-transparent focus-within:border-brand-500 text-slate-900';
const fieldInner =
  'flex-1 min-w-0 h-full bg-transparent outline-none text-[15px] text-slate-900 placeholder:text-slate-600';

/** Public home: the promise, a search, a phone showing the journey, the reasons, the trades, the artisan call. */
export const WelcomePage: React.FC = () => {
  const navigate = useNavigate();
  const language = useLanguageStore((s) => s.language);
  const c = landingCopy[language] ?? landingCopy.fr;
  const site = useSiteCopy();
  const [service, setService] = useState('');

  const start = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/login?role=CLIENT');
  };

  return (
    <PublicLayout>
      {/* Hero */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <section className="panel mt-6 p-6 sm:p-10 lg:p-14 grid grid-cols-1 lg:grid-cols-[1.25fr_0.75fr] gap-10 items-center overflow-hidden">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-3 text-[13px] font-bold uppercase tracking-[0.08em] rtl:tracking-normal text-brand-accent">
              <LiveDot />
              {c.hero.badge}
            </span>
            <h1 className="mt-5 text-[clamp(36px,5vw,62px)] font-bold leading-[1.04] tracking-[-0.03em] rtl:leading-[1.25] rtl:tracking-normal text-white">
              {c.hero.title}
            </h1>
            <p className="mt-5 text-lg max-w-[52ch] text-white/90">{c.hero.sub}</p>

            <form
              onSubmit={start}
              className="mt-8 max-w-[640px] bg-white rounded-tile p-2.5 grid grid-cols-1 sm:grid-cols-2 gap-2.5 items-end"
            >
              <div className="px-2 pt-2 flex flex-col gap-2">
                <label htmlFor="lp-service" className={fieldLabel}>
                  {c.hero.service}
                </label>
                <div className={fieldBox}>
                  <Tag className="w-5 h-5 shrink-0 text-slate-600" aria-hidden="true" />
                  <select
                    id="lp-service"
                    value={service}
                    onChange={(e) => setService(e.target.value)}
                    className={`${fieldInner} appearance-none cursor-pointer`}
                  >
                    <option value="">{c.hero.pick}</option>
                    {c.services.map((s) => (
                      <option key={s.key} value={s.key}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="px-2 pt-2 flex flex-col gap-2">
                <label htmlFor="lp-city" className={fieldLabel}>
                  {c.hero.city}
                </label>
                <div className={fieldBox}>
                  <MapPin className="w-5 h-5 shrink-0 text-slate-600" aria-hidden="true" />
                  <input id="lp-city" placeholder={c.hero.cityPh} autoComplete="off" className={fieldInner} />
                </div>
              </div>
              <button
                type="submit"
                className="sm:col-span-2 h-14 rounded-full bg-brand-accent hover:bg-brand-accent-hover text-brand-on-accent font-bold text-base inline-flex items-center justify-center gap-2.5 transition-colors"
              >
                {c.hero.cta}
                <ArrowRight className="w-5 h-5 rtl:-scale-x-100" aria-hidden="true" />
              </button>
            </form>

            <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold text-white/90">
              {c.hero.points.map((p, i) => {
                const Icon = WHY_ICONS[i];
                return (
                  <li key={p} className="inline-flex items-center gap-2">
                    <Icon className="w-4 h-4 text-brand-accent" aria-hidden="true" /> {p}
                  </li>
                );
              })}
            </ul>
          </div>
          <PhoneDemo />
        </section>
      </div>

      {/* Why: three reasons as ruled rows */}
      <Section>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          <div>
            <SectionHead label={site.home.whyLabel} title={site.home.whyTitle} text={site.home.whyText} />
            <Link
              to="/how-it-works"
              className="mt-6 h-12 px-6 rounded-full border-[1.5px] border-slate-900 dark:border-slate-100 font-bold inline-flex items-center gap-2.5 hover:bg-light-tile dark:hover:bg-dark-surface transition-colors"
            >
              {site.home.seeHow}
              <ArrowRight className="w-5 h-5 rtl:-scale-x-100" aria-hidden="true" />
            </Link>
          </div>
          <ul className="border-t border-light-border dark:border-dark-border">
            {c.why.map((w, i) => {
              const Icon = WHY_ICONS[i];
              return (
                <li
                  key={w.title}
                  className="grid grid-cols-[48px_1fr] gap-x-5 py-[22px] border-b border-light-border dark:border-dark-border"
                >
                  <span className="w-12 h-12 rounded-[14px] bg-light-tile dark:bg-dark-surface text-brand-500 dark:text-brand-accent grid place-items-center">
                    <Icon className="w-5 h-5" aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="text-[19px] font-semibold">{w.title}</h3>
                    <p className="mt-1.5 text-slate-600 dark:text-slate-300 max-w-[58ch]">{w.text}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </Section>

      {/* Artisan call */}
      <Section>
        <div className="panel p-7 sm:p-14 grid grid-cols-1 md:grid-cols-[1.2fr_1fr] gap-8 items-center">
          <div>
            <span className="micro !text-brand-accent">{site.home.proLabel}</span>
            <h2 className="mt-3 text-[clamp(26px,3.2vw,38px)] font-bold leading-[1.1] text-white">
              {site.home.proTitle}
            </h2>
            <p className="mt-3.5 max-w-[46ch] text-white/90">{site.home.proText}</p>
          </div>
          <div className="flex flex-wrap gap-3 md:justify-end">
            <Link
              to="/register?role=PROVIDER"
              className="h-14 px-8 rounded-full bg-brand-accent hover:bg-brand-accent-hover text-brand-on-accent font-bold inline-flex items-center gap-2.5 transition-colors"
            >
              {c.pro.cta}
              <ArrowRight className="w-5 h-5 rtl:-scale-x-100" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </Section>

      {/* Trades as an index */}
      <Section id="services">
        <SectionHead label={site.home.tradesLabel} title={site.home.tradesTitle} className="mb-8" />
        <ul className="grid grid-cols-1 md:grid-cols-2 md:gap-x-12 border-t border-light-border dark:border-dark-border">
          {c.services.map((s) => {
            const Icon = SERVICE_ICONS[s.key] ?? Wrench;
            return (
              <li key={s.key}>
                <Link
                  to="/login?role=CLIENT"
                  className="group grid grid-cols-[44px_1fr_auto] items-center gap-4 px-2 py-[18px] border-b border-light-border dark:border-dark-border hover:bg-light-tile dark:hover:bg-dark-surface transition-colors"
                >
                  <span className="w-11 h-11 rounded-xl bg-light-tile dark:bg-dark-surface group-hover:bg-white dark:group-hover:bg-dark-card grid place-items-center text-brand-500 dark:text-brand-accent">
                    <Icon className="w-5 h-5" aria-hidden="true" />
                  </span>
                  <span className="font-display text-xl font-semibold">{s.label}</span>
                  <ArrowRight
                    className="w-5 h-5 text-slate-600 dark:text-slate-300 rtl:-scale-x-100"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      </Section>

      {/* FAQ preview */}
      <Section>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          <div>
            <SectionHead label={site.home.faqLabel} title={site.home.faqTitle} />
            <Link
              to="/faq"
              className="mt-6 h-12 px-6 rounded-full border-[1.5px] border-slate-900 dark:border-slate-100 font-bold inline-flex items-center gap-2.5 hover:bg-light-tile dark:hover:bg-dark-surface transition-colors"
            >
              {site.home.allAnswers}
              <ArrowRight className="w-5 h-5 rtl:-scale-x-100" aria-hidden="true" />
            </Link>
          </div>
          <FaqAccordion items={site.faq.items.filter((_, i) => [0, 1, 5, 6].includes(i))} />
        </div>
      </Section>

      <CtaBand />
    </PublicLayout>
  );
};
