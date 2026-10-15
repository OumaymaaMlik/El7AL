import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { PublicLayout } from '../layouts/PublicLayout';
import { FaqAccordion, PageHead, Section } from '../components/site/SiteBlocks';
import { FaqItem, useSiteCopy } from '../lib/siteCopy';

/** Questions by audience, with a search box that looks across all of them. */
export const FaqPage: React.FC = () => {
  const c = useSiteCopy().faq;
  const [tab, setTab] = useState<FaqItem['group']>('client');
  const [query, setQuery] = useState('');

  const q = query.trim().toLowerCase();
  const rows = c.items.filter((it) => (q ? `${it.q} ${it.a}`.toLowerCase().includes(q) : it.group === tab));

  return (
    <PublicLayout>
      <PageHead crumb={c.crumb} title={c.title} lead={c.lead} />

      <Section className="!pt-6">
        <div className="max-w-[920px]">
          <div className="grid gap-5 mb-4">
            <div className="flex flex-col gap-2 max-w-[420px]">
              <label htmlFor="faq-q" className="text-[13px] font-semibold">
                {c.search}
              </label>
              <div className="flex items-center gap-2.5 h-[52px] px-4 rounded-field border-[1.5px] border-light-border dark:border-dark-border bg-white dark:bg-dark-surface focus-within:border-brand-500 dark:focus-within:border-brand-accent">
                <Search className="w-5 h-5 shrink-0 text-slate-600 dark:text-slate-400" aria-hidden="true" />
                <input
                  id="faq-q"
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={c.searchPh}
                  className="flex-1 min-w-0 h-full bg-transparent outline-none text-[15px] placeholder:text-slate-500"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2" role="group">
              {c.tabs.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  aria-pressed={!q && tab === t.key}
                  onClick={() => {
                    setTab(t.key);
                    setQuery('');
                  }}
                  className={`h-[42px] px-4 rounded-full border-[1.5px] text-sm font-semibold transition-colors ${
                    !q && tab === t.key
                      ? 'bg-brand-500 border-brand-500 text-white dark:bg-brand-accent dark:border-brand-accent dark:text-brand-on-accent'
                      : 'border-light-border dark:border-dark-border bg-white dark:bg-dark-card hover:bg-light-tile dark:hover:bg-dark-surface'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {rows.length > 0 ? (
            <FaqAccordion items={rows} />
          ) : (
            <p className="py-8 text-slate-600 dark:text-slate-300">{c.none}</p>
          )}

          <div className="mt-10 border-[1.5px] border-dashed border-light-border dark:border-dark-border rounded-tile px-6 py-9 flex flex-col items-start gap-3">
            <h3 className="text-xl font-semibold">{c.notFound}</h3>
            <p className="text-slate-600 dark:text-slate-300">{c.notFoundText}</p>
            <Link
              to="/contact"
              className="h-12 px-6 rounded-full border-[1.5px] border-slate-900 dark:border-slate-100 font-bold inline-flex items-center hover:bg-light-tile dark:hover:bg-dark-surface transition-colors"
            >
              {c.toContact}
            </Link>
          </div>
        </div>
      </Section>
    </PublicLayout>
  );
};
