import Section from "./Section";
import FeatureRow from "./_components/FeatureRow";
import ComparisonTable from "./_components/ComparisonTable";

export default function Features({ t }) {
  return (
    <Section id="features" maxWidth="7xl">
      <h2 className="text-center text-4xl font-bold">{t('features.powerfulTitle') /* Powerful Features */}</h2>
      <p className="text-center text-slate-600 mt-2">{t('features.subtitle') /* Transform your meetings into actionable insights. */}</p>

      <FeatureRow
        title={t('features.getSummaries')}
        desc={t('features.summariesDescription')}
        bullets={[
          t('features.list.autoChapters'),
          t('features.list.qaExtraction'),
          t('features.list.speakerDiarization'),
          t('features.list.exportPdfDoc'),
        ]}
        img="meeting-digest.png"
        icon={<div className="h-10 w-10 rounded-xl bg-brand-500/15 text-brand-600 grid place-items-center font-bold">Σ</div>}
      />

      <FeatureRow
        title={t('features.getAnswers')}
        desc={t('features.answersDescription')}
        bullets={[
          t('features.answers.items.crossMeetingSearch'),
          t('features.answers.items.sourcesAttached'),
          t('features.answers.items.safeEnterpriseGuardrails'),
        ]}
        img="meeting-qa.png"
        reverse
        icon={<div className="h-10 w-10 rounded-xl bg-brand-500/15 text-brand-600 grid place-items-center font-bold">?</div>}
      />

      <FeatureRow
        title={t('features.worksWith')}
        desc={t('features.worksWithDescription')}
        bullets={[
          t('features.works.items.multiLanguage'),
          t('features.works.items.templatesAutomations'),
          t('features.works.items.adminControls'),
        ]}
        img="meeting-platforms.png"
        icon={<div className="h-10 w-10 rounded-xl bg-brand-500/15 text-brand-600 grid place-items-center font-bold">⇄</div>}
      />

      <ComparisonTable
          beforeTitle="Before"
          afterTitle="With Transcripta"
          items={{ before: t('features.before.list'), after: t('features.with.list') }}
          afterTitleClassName="text-brand-700"
        />

      {/* Before/After Card */}
      
    </Section>
  );
}