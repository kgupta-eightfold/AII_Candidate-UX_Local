import { useInterview } from '../../context/InterviewContext';
import type { EmailVariant } from '../../context/InterviewContext';
import { Pill, PillSize } from '@eightfold.ai/octuple';
import { i18nUtils } from '@i18n';
import styles from './emailScreen.module.scss';

const { gettext: t } = i18nUtils;

const ICON_EXTERNAL = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M19 19H5V5h7V3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z" fill="currentColor"/>
  </svg>
);

const ICON_CALENDAR = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
    <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const ICON_CLOCK = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="9" stroke="#4F5666" strokeWidth="2"/>
    <path d="M12 8v4l2 2" stroke="#4F5666" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const ICON_INFO = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="9" stroke="#146DA6" strokeWidth="2"/>
    <path d="M12 8v4M12 16h.01" stroke="#146DA6" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

function GmailTopbar() {
  return (
    <div className={styles.gmailTopbar}>
      <div className={styles.gmailTopbarLeft}>
        <svg className={styles.gmailHamburger} width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M3 6h18M3 12h18M3 18h18" stroke="#5F6368" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        <svg className={styles.gmailLogo} width="109" height="28" viewBox="0 0 109 28">
          <path d="M7.2 21.5V10.1L14 15.3l6.8-5.2V21.5H24V6.5h-1.6L14 13.1 5.6 6.5H4v15h3.2z" fill="#EA4335"/>
          <text x="28" y="20" fontSize="20" fontWeight="500" fill="#5F6368" fontFamily="'Product Sans', Arial, sans-serif">{t('Gmail')}</text>
        </svg>
      </div>
      <div className={styles.gmailSearch}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <circle cx="11" cy="11" r="7" stroke="#5F6368" strokeWidth="2"/>
          <path d="M16 16l4.5 4.5" stroke="#5F6368" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        <span className={styles.gmailSearchText}>{t('fill feedback form')}</span>
      </div>
      <div className={styles.gmailTopbarRight}>
        <div className={styles.gmailAvatar}>K</div>
      </div>
    </div>
  );
}

function GmailSidebar() {
  return (
    <div className={styles.gmailSidebar}>
      <button className={styles.gmailCompose}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
        </svg>
        {t('Compose')}
      </button>
      <div className={styles.gmailNavItems}>
        <div className={`${styles.gmailNavItem} ${styles.gmailNavItemActive}`}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 8l9-5 9 5v11a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" stroke="currentColor" strokeWidth="2"/></svg>
          {t('Inbox')} <span className={styles.gmailBadge}>257</span>
        </div>
        <div className={styles.gmailNavItem}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 2l2.4 7.4h7.6l-6 4.6 2.4 7.4-6.4-4.8-6.4 4.8 2.4-7.4-6-4.6h7.6z" stroke="currentColor" strokeWidth="2" fill="none"/></svg>
          {t('Starred')}
        </div>
        <div className={styles.gmailNavItem}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/><path d="M12 8v4l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          {t('Snoozed')}
        </div>
        <div className={styles.gmailNavItem}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          {t('Sent')}
        </div>
        <div className={styles.gmailNavItem}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          {t('Drafts')} <span className={styles.gmailBadgeSm}>1</span>
        </div>
        <div className={`${styles.gmailNavItem} ${styles.gmailNavItemMuted}`}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          {t('More')}
        </div>
        <div className={styles.gmailSidebarDivider} />
        <div className={styles.gmailNavLabel}>{t('Labels')}</div>
        <div className={styles.gmailNavItem}>
          <span className={styles.gmailLabelDot} style={{ background: '#4285F4' }} /> {t('Design')} <span className={styles.gmailBadgeSm}>2</span>
        </div>
        <div className={styles.gmailNavItem}>
          <span className={styles.gmailLabelDot} style={{ background: '#34A853' }} /> {t('HR')}
        </div>
        <div className={styles.gmailNavItem}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          {t('Meetings')}
        </div>
        <div className={`${styles.gmailNavItem} ${styles.gmailNavItemMuted}`}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          {t('More')}
        </div>
      </div>
    </div>
  );
}

function CardFooter() {
  return (
    <div className={styles.gmailCardFooter}>
      <div className={styles.gmailCardFooterDivider} />
      <div className={styles.gmailCardFooterRow}>
        <div className={styles.gmailCardExpiry}>
          {ICON_CLOCK}
          <span>{t('Link expires 8:00am Apr 25, 2026')}</span>
        </div>
        <a className={styles.gmailCardHelp}>{t('Need assistance?')}</a>
      </div>
    </div>
  );
}

function InterviewCard({ onGoToLanding }: { onGoToLanding: () => void }) {
  return (
    <div className={styles.gmailCard}>
      <div className={styles.gmailCardHeader}>
        <div className={styles.gmailCardHeaderRow}>
          <span className={styles.gmailCardTitle}>{t('Smart interview round')}</span>
          <div className={styles.gmailCardTags}>
            <Pill label={t('AI Interview')} theme="aiAgent" size={PillSize.Small} />
            <Pill label={t('~60 mins')} theme="grey" size={PillSize.Small} />
          </div>
        </div>
      </div>
      <div className={styles.gmailCardBody}>
        <p className={styles.gmailCardDesc}>
          {t('This is a guided AI interview designed to understand your')} <strong>{t('skills')}</strong> {t('and')} <strong>{t('experience.')}</strong>
        </p>
        <div className={styles.gmailCardCoverage}>
          <p className={styles.gmailCardCoverageLabel}>{t('What does the interview cover?')}</p>
          <div className={styles.gmailCardCoverageTags}>
            <span className={styles.gmailCardSectionTag}>{t('Screening')}</span>
            <span className={styles.gmailCardSectionDot}>&middot;</span>
            <span className={styles.gmailCardSectionTag}>{t('Technical Q&A')}</span>
            <span className={styles.gmailCardSectionDot}>&middot;</span>
            <span className={styles.gmailCardSectionTag}>{t('Multiple coding rounds')}</span>
            <span className={styles.gmailCardSectionDot}>&middot;</span>
            <span className={styles.gmailCardSectionTag}>{t('System design')}</span>
          </div>
        </div>
        <div className={styles.gmailCardButtons}>
          <button className={styles.gmailBtnPrimary} onClick={onGoToLanding}>
            {ICON_EXTERNAL} {t('Interview page')}
          </button>
          <button className={styles.gmailBtnSecondary}>
            {ICON_CALENDAR} {t('Add to Calendar')}
          </button>
        </div>
      </div>
      <CardFooter />
    </div>
  );
}

function AssessmentCard({ onGoToLanding }: { onGoToLanding: () => void }) {
  return (
    <div className={styles.gmailCard}>
      <div className={styles.gmailCardHeader}>
        <div className={styles.gmailCardHeaderRow}>
          <span className={styles.gmailCardTitle}>{t('Cultural fit – Personality test')}</span>
          <div className={styles.gmailCardTags}>
            <Pill label={t('SHL powered')} theme="blue" size={PillSize.Small} />
          </div>
        </div>
      </div>
      <div className={styles.gmailCardBody}>
        <p className={styles.gmailCardDesc}>
          {t('This assessment includes questions designed to evaluate your')} <strong>{t('technical knowledge')}</strong>, <strong>{t('cognitive ability')}</strong>, {t('and')} <strong>{t('behavioral traits.')}</strong>
        </p>
        <div className={styles.gmailCardCoverage}>
          <div className={styles.gmailCardCoverageLabel}>
            {t('Sections Included')}
            <Pill label={t('30 mins')} theme="grey" size={PillSize.Small} classNames={styles.gmailInlinePill} />
          </div>
          <div className={styles.gmailCardCoverageTags}>
            <span className={styles.gmailCardSectionTag}>{t('Technical MCQs')}</span>
            <span className={styles.gmailCardSectionDot}>&middot;</span>
            <span className={styles.gmailCardSectionTag}>{t('Cognitive ability')}</span>
            <span className={styles.gmailCardSectionDot}>&middot;</span>
            <span className={styles.gmailCardSectionTag}>{t('Psychometric evaluation')}</span>
          </div>
        </div>
        <div className={styles.gmailCardButtons}>
          <button className={styles.gmailBtnPrimary} onClick={onGoToLanding}>
            {ICON_EXTERNAL} {t('Start Assessment')}
          </button>
          <button className={styles.gmailBtnSecondary}>
            {ICON_CALENDAR} {t('Add to Calendar')}
          </button>
        </div>
      </div>
      <CardFooter />
    </div>
  );
}

function CombinedCard({ onGoToLanding }: { onGoToLanding: () => void }) {
  return (
    <div className={styles.gmailCard}>
      <div className={styles.gmailCardHeader}>
        <div className={styles.gmailCardHeaderRow}>
          <span className={styles.gmailCardTitle}>{t('Assessment + Interview guide')}</span>
          <div className={styles.gmailCardTags}>
            <Pill label={t('AI Interview')} theme="aiAgent" size={PillSize.Small} />
          </div>
        </div>
      </div>
      <div className={styles.gmailCardBody}>
        <p className={styles.gmailCardDesc}>
          {t("You'll complete a few short assessments followed by a guided interview designed to understand your")} <strong>{t('skills')}</strong> {t('and')} <strong>{t('experience.')}</strong>
        </p>
        <div className={styles.gmailCardTimeline}>
          <div className={styles.gmailCardTimelineItem}>
            <div className={styles.gmailCardTimelineContent}>
              <div className={styles.gmailCardTimelineHeader}>
                <span className={styles.gmailCardTimelineName}>{t('SHL Assessment')}</span>
                <Pill label={t('SHL powered')} theme="blue" size={PillSize.Small} />
                <Pill label={t('30 mins')} theme="grey" size={PillSize.Small} />
              </div>
              <div className={styles.gmailCardCoverageTags}>
                <span className={styles.gmailCardSectionTag}>{t('Technical MCQs')}</span>
                <span className={styles.gmailCardSectionDot}>&middot;</span>
                <span className={styles.gmailCardSectionTag}>{t('Cognitive ability')}</span>
                <span className={styles.gmailCardSectionDot}>&middot;</span>
                <span className={styles.gmailCardSectionTag}>{t('Psychometric evaluation')}</span>
              </div>
            </div>
          </div>
          <div className={styles.gmailCardTimelineItem}>
            <div className={styles.gmailCardTimelineContent}>
              <div className={styles.gmailCardTimelineHeader}>
                <span className={styles.gmailCardTimelineName}>{t('AI Interview')}</span>
                <Pill label={t('60 mins')} theme="grey" size={PillSize.Small} />
              </div>
              <div className={styles.gmailCardCoverageTags}>
                <span className={styles.gmailCardSectionTag}>{t('Screening')}</span>
                <span className={styles.gmailCardSectionDot}>&middot;</span>
                <span className={styles.gmailCardSectionTag}>{t('Technical Q&A')}</span>
                <span className={styles.gmailCardSectionDot}>&middot;</span>
                <span className={styles.gmailCardSectionTag}>{t('Multiple coding rounds')}</span>
                <span className={styles.gmailCardSectionDot}>&middot;</span>
                <span className={styles.gmailCardSectionTag}>{t('System design')}</span>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.gmailCardButtons}>
          <button className={styles.gmailBtnPrimary} onClick={onGoToLanding}>
            {ICON_EXTERNAL} {t('Start assessment')}
          </button>
          <button className={styles.gmailBtnSecondary}>
            {ICON_CALENDAR} {t('Add to Calendar')}
          </button>
        </div>
      </div>
      <CardFooter />
    </div>
  );
}

function InfoCard() {
  return (
    <div className={styles.gmailInfoCard}>
      <div className={styles.gmailInfoHeader}>
        <span className={styles.gmailInfoTitle}>{t('A stress-free path to your next role')}</span>
      </div>
      <div className={styles.gmailInfoBody}>
        <div className={styles.gmailInfoPoints}>
          <p>&bull; {t('Objective evaluation that sees your true potential.')}</p>
          <p>&bull; {t('Take the lead and move at your own pace.')}</p>
          <p>&bull; {t('A private space to be your authentic self.')}</p>
        </div>
        <div className={styles.gmailInfoIllustration}>
          <img src={`${import.meta.env.BASE_URL}meditation-illustration.png`} alt="" width="180" />
        </div>
      </div>
      <div className={styles.gmailInfoFooter}>
        <div className={styles.gmailInfoFooterDivider} />
        <div className={styles.gmailInfoFooterLink}>
          {ICON_INFO}
          <a className={styles.gmailKnowMore}>{t('Learn more about AI interviews')}</a>
        </div>
      </div>
    </div>
  );
}

function PoweredFooter() {
  return (
    <div className={styles.gmailPoweredFooter}>
      <div className={styles.gmailPoweredLeft}>
        <span>{t('Powered by')}</span>
        <img src={`${import.meta.env.BASE_URL}ef-logo.png`} alt="" width="20" height="20" />
        <span className={styles.gmailPoweredName}>{t('eightfold.ai')}</span>
      </div>
      <span className={styles.gmailPrivacy}>{t('Privacy policy')}</span>
    </div>
  );
}

function ReplyBar() {
  return (
    <div className={styles.gmailReplyBar}>
      <button className={styles.gmailReplyBtn}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M10 9V5l-7 7 7 7v-4.1c5 0 8.5 1.6 11 5.1-1-5-4-10-11-11z" stroke="#5F6368" strokeWidth="2" fill="none"/></svg>
        {t('Reply')}
      </button>
      <button className={styles.gmailReplyBtn}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M14 9V5l7 7-7 7v-4.1c-5 0-8.5 1.6-11 5.1 1-5 4-10 11-11z" stroke="#5F6368" strokeWidth="2" fill="none"/></svg>
        {t('Forward')}
      </button>
    </div>
  );
}

function getEmailText(variant: EmailVariant) {
  switch (variant) {
    case 'interview':
      return (
        <>
          {t('Emily,')}<br />
          {t('Thank you for applying for the')} <a className={styles.gmailLinkBold}>{t('Software Engineer')}</a> {t('role. As a next step, a smart interview round has been scheduled for you.')}
        </>
      );
    case 'assessment':
      return (
        <>
          {t('Emily,')}<br />
          {t('Thank you for applying for the')} <a className={styles.gmailLinkBold}>{t('Software Engineer')}</a> {t('role. As a next step, please take this SHL powered assessment.')}
        </>
      );
    case 'combined':
      return (
        <>
          {t('Hi Emily,')}<br />
          {t('Thank you for applying for the')} <a className={styles.gmailLinkBold}>{t('Software Engineer')}</a> {t('position. As the next step in our process, please complete the required assessment. After you have submitted the assessment, you will be invited to participate in an AI interview.')}
        </>
      );
  }
}

export default function EmailScreen() {
  const { state, dispatch } = useInterview();
  const variant = state.emailVariant;

  const handleGoToLanding = () => {
    dispatch({ type: 'SET_SCREEN', screen: 'landing' });
  };

  return (
    <section className="screen active" id="screen-email">
      <div className={styles.gmailPage}>
        <GmailTopbar />
        <div className={styles.gmailBody}>
          <GmailSidebar />
          <div className={styles.gmailEmailContent}>
            <div className={styles.gmailEmailHeader}>
              <h1 className={styles.gmailEmailSubject}>{t('AI Interview: UX designer (ACME) expires Apr 25')}</h1>
              <div className={styles.gmailEmailMeta}>
                <div className={styles.gmailSenderAvatar}>R</div>
                <div className={styles.gmailSenderInfo}>
                  <div className={styles.gmailSenderName}><strong>{t('Robin Hong via ACME')}</strong> ({t('robin@acme.com')})</div>
                  <div className={styles.gmailSenderTo}>{t('to me')}</div>
                </div>
                <div className={styles.gmailEmailDate}>{t('Fri, Oct 6, 2:47 PM')}</div>
              </div>
            </div>

            <div className={styles.gmailEmailBody}>
              <div className={styles.gmailEfLogo}>
                <img src={`${import.meta.env.BASE_URL}ef-logo.png`} alt="" width="24" height="24" />
                <span className={styles.gmailEfLogoText}>{t('eightfold.ai')}</span>
              </div>

              <p className={styles.gmailEmailText}>{getEmailText(variant)}</p>

              {variant === 'interview' && <InterviewCard onGoToLanding={handleGoToLanding} />}
              {variant === 'assessment' && <AssessmentCard onGoToLanding={handleGoToLanding} />}
              {variant === 'combined' && <CombinedCard onGoToLanding={handleGoToLanding} />}

              {variant !== 'assessment' && <InfoCard />}

              <PoweredFooter />
            </div>

            <ReplyBar />
          </div>
        </div>
      </div>
    </section>
  );
}
