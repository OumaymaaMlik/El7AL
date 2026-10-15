import React, { useState } from 'react';
import { PublicLayout } from '../layouts/PublicLayout';
import { Stage3D } from '../components/ui/Stage3D';
import { CtaBand, PageHead, Section, SectionHead } from '../components/site/SiteBlocks';
import { useSiteCopy } from '../lib/siteCopy';
import { authCopy } from '../lib/authCopy';
import { useLanguageStore } from '../store/useLanguageStore';

/** The whole journey: the 3D scene, the four steps (they follow the scene), and what the artisan does on his side. */
export const HowItWorksPage: React.FC = () => {
  const c = useSiteCopy().how;
  const language = useLanguageStore((s) => s.language);
  const scene = authCopy[language] ?? authCopy.fr;
  // The step list follows the 3D scene: the green number is the one being played.
  const [active, setActive] = useState(0);

  return (
    <PublicLayout>
      <PageHead crumb={c.crumb} title={c.title} lead={c.lead} />

      <Section className="!pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-stretch">
          <Stage3D
            variant="flow"
            captions={scene.captions}
            label={scene.scene}
            onStep={setActive}
            className="min-h-[420px] lg:min-h-[520px]"
          />
          <ol className="grid">
            {c.stages.map((s, i) => (
              <li
                key={s.title}
                aria-current={i === active ? 'step' : undefined}
                className={`relative grid grid-cols-[44px_1fr] gap-4 pb-6 last:pb-0 transition-opacity duration-300 ${i === active ? 'opacity-100' : 'opacity-70'}`}
              >
                {i < c.stages.length - 1 && (
                  <span
                    className="absolute start-[21px] top-10 bottom-0 w-0.5 bg-light-border dark:bg-dark-border"
                    aria-hidden="true"
                  />
                )}
                <span
                  className={`w-11 h-11 rounded-full grid place-items-center font-display font-bold transition-all duration-300 ${
                    i === active
                      ? 'bg-brand-accent text-brand-on-accent scale-110'
                      : i < active
                        ? 'bg-brand-500/15 text-brand-500 dark:bg-brand-accent/20 dark:text-brand-accent'
                        : 'bg-light-tile dark:bg-dark-surface'
                  }`}
                  aria-hidden="true"
                >
                  {i + 1}
                </span>
                <div>
                  <h3 className="text-[19px] font-semibold">{s.title}</h3>
                  <p className="mt-1 max-w-[52ch] text-slate-600 dark:text-slate-300">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </Section>

      <Section>
        <SectionHead label={c.proLabel} title={c.proTitle} className="mb-8" />
        <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-t-2 border-slate-900 dark:border-slate-100">
          {c.proSteps.map((s, i) => (
            <li key={s.title} className="pt-5 pb-5 pe-5">
              <span
                className="font-display font-bold text-[44px] leading-none tracking-[-0.04em] text-brand-500 dark:text-brand-accent"
                aria-hidden="true"
              >
                {i + 1}
              </span>
              <h3 className="mt-3 text-[19px] font-semibold">{s.title}</h3>
              <p className="mt-2 text-[14.5px] text-slate-600 dark:text-slate-300">{s.text}</p>
            </li>
          ))}
        </ol>
      </Section>

      <CtaBand />
    </PublicLayout>
  );
};
