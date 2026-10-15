import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowRight, Mail, MapPin, User } from 'lucide-react';
import { PublicLayout } from '../layouts/PublicLayout';
import { PageHead, Section } from '../components/site/SiteBlocks';
import { useSiteCopy } from '../lib/siteCopy';

/** Where messages go. Set VITE_CONTACT_EMAIL for the deployed site. */
const CONTACT_EMAIL = import.meta.env.VITE_CONTACT_EMAIL || 'contact@el7al.tn';

const box = (bad: boolean) =>
  `flex items-center gap-2.5 h-[52px] px-4 rounded-field border-[1.5px] bg-white dark:bg-dark-surface transition-colors focus-within:border-brand-500 dark:focus-within:border-brand-accent ${
    bad ? 'border-red-600 dark:border-red-400' : 'border-light-border dark:border-dark-border'
  }`;
const inner = 'flex-1 min-w-0 h-full bg-transparent outline-none text-[15px] placeholder:text-slate-500';

const FieldError: React.FC<{ id: string; text: string }> = ({ id, text }) => (
  <span
    id={id}
    role="alert"
    className="flex items-center gap-1.5 text-[13px] font-semibold text-red-700 dark:text-red-400"
  >
    <AlertCircle className="w-4 h-4" aria-hidden="true" />
    {text}
  </span>
);

/** A contact form that opens the visitor's mail app with the message ready (the site has no mail endpoint). */
export const ContactPage: React.FC = () => {
  const c = useSiteCopy().contact;
  const [name, setName] = useState('');
  const [reach, setReach] = useState('');
  const [subject, setSubject] = useState(0);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<{ name?: boolean; reach?: boolean; message?: boolean }>({});
  const [opened, setOpened] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next = { name: !name.trim(), reach: !reach.trim(), message: !message.trim() };
    setErrors(next);
    if (next.name || next.reach || next.message) {
      document.getElementById(next.name ? 'k-name' : next.reach ? 'k-reach' : 'k-msg')?.focus();
      return;
    }
    const body = `${message.trim()}\n\n${name.trim()}\n${reach.trim()}`;
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`El 7al · ${c.subjects[subject]}`)}&body=${encodeURIComponent(body)}`;
    setOpened(true);
  };

  return (
    <PublicLayout>
      <PageHead crumb={c.crumb} title={c.title} lead={c.lead} />

      <Section className="!pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-10 lg:gap-16 items-start">
          <form onSubmit={submit} noValidate className="surface p-5 sm:p-9 grid gap-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label htmlFor="k-name" className="text-[13px] font-semibold">
                  {c.name} *
                </label>
                <div className={box(!!errors.name)}>
                  <User className="w-5 h-5 shrink-0 text-slate-600 dark:text-slate-400" aria-hidden="true" />
                  <input
                    id="k-name"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setErrors((x) => ({ ...x, name: false }));
                    }}
                    autoComplete="name"
                    placeholder={c.namePh}
                    aria-invalid={errors.name || undefined}
                    aria-describedby={errors.name ? 'k-name-err' : undefined}
                    className={inner}
                  />
                </div>
                {errors.name && <FieldError id="k-name-err" text={c.nameErr} />}
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="k-reach" className="text-[13px] font-semibold">
                  {c.reach} *
                </label>
                <div className={box(!!errors.reach)}>
                  <Mail className="w-5 h-5 shrink-0 text-slate-600 dark:text-slate-400" aria-hidden="true" />
                  <input
                    id="k-reach"
                    value={reach}
                    onChange={(e) => {
                      setReach(e.target.value);
                      setErrors((x) => ({ ...x, reach: false }));
                    }}
                    autoComplete="email"
                    placeholder={c.reachPh}
                    aria-invalid={errors.reach || undefined}
                    aria-describedby={errors.reach ? 'k-reach-err' : undefined}
                    className={inner}
                  />
                </div>
                {errors.reach && <FieldError id="k-reach-err" text={c.reachErr} />}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="k-sub" className="text-[13px] font-semibold">
                {c.subject}
              </label>
              <div className={box(false)}>
                <select
                  id="k-sub"
                  value={subject}
                  onChange={(e) => setSubject(Number(e.target.value))}
                  className={`${inner} cursor-pointer`}
                >
                  {c.subjects.map((s, i) => (
                    <option key={s} value={i}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="k-msg" className="text-[13px] font-semibold">
                {c.message} *
              </label>
              <textarea
                id="k-msg"
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  setErrors((x) => ({ ...x, message: false }));
                }}
                placeholder={c.messagePh}
                aria-invalid={errors.message || undefined}
                aria-describedby={errors.message ? 'k-msg-err' : undefined}
                className={`w-full min-h-[140px] resize-y rounded-field border-[1.5px] bg-white dark:bg-dark-surface px-4 py-3.5 text-[15px] outline-none placeholder:text-slate-500 focus:border-brand-500 dark:focus:border-brand-accent ${
                  errors.message ? 'border-red-600 dark:border-red-400' : 'border-light-border dark:border-dark-border'
                }`}
              />
              {errors.message && <FieldError id="k-msg-err" text={c.messageErr} />}
            </div>

            <button
              type="submit"
              className="h-14 px-8 rounded-full bg-brand-500 text-white hover:bg-brand-600 dark:bg-brand-accent dark:text-brand-on-accent dark:hover:bg-brand-accent-hover font-bold inline-flex items-center justify-center gap-2.5 transition-colors sm:justify-self-start"
            >
              {c.send}
              <ArrowRight className="w-5 h-5 rtl:-scale-x-100" aria-hidden="true" />
            </button>
            {opened && (
              <p role="status" className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                {c.openingMail}
              </p>
            )}
          </form>

          <div className="grid gap-5">
            <div className="flex gap-3.5">
              <span className="w-11 h-11 shrink-0 rounded-xl bg-light-tile dark:bg-dark-surface text-brand-500 dark:text-brand-accent grid place-items-center">
                <Mail className="w-5 h-5" aria-hidden="true" />
              </span>
              <div>
                <h3 className="text-[17px] font-semibold">{c.emailLabel}</h3>
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="text-slate-600 dark:text-slate-300 hover:underline"
                  dir="ltr"
                >
                  {CONTACT_EMAIL}
                </a>
              </div>
            </div>
            <div className="flex gap-3.5">
              <span className="w-11 h-11 shrink-0 rounded-xl bg-light-tile dark:bg-dark-surface text-brand-500 dark:text-brand-accent grid place-items-center">
                <MapPin className="w-5 h-5" aria-hidden="true" />
              </span>
              <div>
                <h3 className="text-[17px] font-semibold">{c.coverage}</h3>
                <p className="text-slate-600 dark:text-slate-300">{c.coverageValue}</p>
              </div>
            </div>
            <div className="border-[1.5px] border-dashed border-light-border dark:border-dark-border rounded-tile px-6 py-7 flex flex-col items-start gap-3">
              <h3 className="text-xl font-semibold">{c.urgentTitle}</h3>
              <p className="text-slate-600 dark:text-slate-300">{c.urgentText}</p>
              <Link
                to="/login?role=CLIENT"
                className="h-12 px-6 rounded-full bg-brand-accent hover:bg-brand-accent-hover text-brand-on-accent font-bold inline-flex items-center gap-2.5 transition-colors"
              >
                {c.urgentCta}
                <ArrowRight className="w-5 h-5 rtl:-scale-x-100" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </Section>
    </PublicLayout>
  );
};
