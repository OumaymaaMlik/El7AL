import React from 'react';
import { PRIVACY_POLICY } from '@el7al/shared';
import { PublicLayout } from '../layouts/PublicLayout';
import { PageHead, Section } from '../components/site/SiteBlocks';
import { useLanguageStore } from '../store/useLanguageStore';

/** The privacy policy, in the visitor's language. The text lives in packages/shared so the mobile app shows the same one. */
export const PrivacyPage: React.FC = () => {
  const language = useLanguageStore((s) => s.language);
  const policy = PRIVACY_POLICY[language];

  return (
    <PublicLayout>
      <PageHead crumb={policy.title} title={policy.title} lead={policy.updated} />
      <Section className="!pt-6">
        <div className="max-w-[760px] space-y-8">
          <p className="text-[17px] text-slate-700 dark:text-slate-300">{policy.intro}</p>
          {policy.sections.map((section) => (
            <section key={section.heading} className="space-y-3">
              <h2 className="text-2xl font-semibold tracking-tight">{section.heading}</h2>
              {section.paragraphs.map((text) => (
                <p key={text} className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  {text}
                </p>
              ))}
            </section>
          ))}
        </div>
      </Section>
    </PublicLayout>
  );
};
