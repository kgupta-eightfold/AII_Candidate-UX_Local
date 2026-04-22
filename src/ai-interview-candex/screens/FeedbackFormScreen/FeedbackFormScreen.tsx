import { useState } from 'react';
import {
  mdiStar,
  mdiStarOutline,
  mdiCircleMedium,
  mdiClockOutline,
  mdiCircleSmall,
} from '@mdi/js';
import { i18nUtils } from '@i18n';
import classnames from 'classnames';
import styles from './feedbackFormScreen.module.scss';

const { gettext: t } = i18nUtils;

const RATING_LABELS = ['', t('Poor'), t('Fair'), t('Okay'), t('Good'), t('Excellent')];

const CHECKBOXES = [
  t('Questions and AI responses felt relevant to role'),
  t('The interview felt organised and natural'),
  t('No technical issues during interview'),
];

export default function FeedbackFormScreen() {
  const [rating, setRating] = useState(4);
  const [checks, setChecks] = useState<Record<string, boolean>>({
    [CHECKBOXES[0]]: true,
  });
  const [feedback, setFeedback] = useState('');

  const toggleCheck = (label: string) =>
    setChecks((prev) => ({ ...prev, [label]: !prev[label] }));

  const label = RATING_LABELS[rating] ?? '';

  return (
    <section className={`screen active ${styles.fbPage}`} id="screen-feedback-form">

      {/* -- Nav Bar -- */}
      <header className={styles.fbNav}>
        <div className={styles.fbNavLeft}>
          <div className={styles.fbBrand}>
            <img src="/ef-logo.png" alt="Eightfold" width={24} height={24} />
          </div>
          <nav className={styles.fbNavTabs}>
            <div className={styles.fbNavTab}>{t('Eightfold.ai')}</div>
          </nav>
        </div>
        <div className={styles.fbNavRight}>
          <button type="button" className={styles.fbBtnSignin}>
            <img src="/ef-logo.png" alt="" width={16} height={16} />
            {t('Sign in')}
          </button>
          <button type="button" className={styles.fbBtnCart} aria-label={t('Cart')}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M17,18A2,2 0 0,1 19,20A2,2 0 0,1 17,22C15.89,22 15,21.1 15,20C15,18.89 15.89,18 17,18M1,2H4.27L5.21,4H20A1,1 0 0,1 21,5C21,5.17 20.95,5.34 20.88,5.5L17.3,11.97C16.96,12.58 16.3,13 15.55,13H8.1L7.2,14.63L7.17,14.75A0.25,0.25 0 0,0 7.42,15H19V17H7C5.89,17 5,16.1 5,15C5,14.65 5.09,14.32 5.24,14.04L6.6,11.59L3,4H1V2M7,18A2,2 0 0,1 9,20A2,2 0 0,1 7,22C5.89,22 5,21.1 5,20C5,18.89 5.89,18 7,18M16,11L18.78,6H6.14L8.5,11H16Z" />
            </svg>
          </button>
        </div>
      </header>
      <div className={styles.fbNavBorder} />

      {/* -- Scrollable body -- */}
      <div className={styles.fbBody}>
        <div className={styles.fbContent}>

          {/* Role header */}
          <div className={styles.fbRoleHeader}>
            <h1 className={styles.fbRoleTitle}>{t('Software Engineer')}</h1>
            <div className={styles.fbRoleMeta}>
              <span>{t('AI interview')}</span>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d={mdiCircleSmall} />
              </svg>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d={mdiClockOutline} />
              </svg>
              <span>{t('20 min')}</span>
              <span className={styles.fbRoleMetaEst}>{t('(estimated)')}</span>
            </div>
          </div>

          {/* Card */}
          <div className={styles.fbCard}>

            {/* -- Thanks + What happens next -- */}
            <div className={styles.fbCardInner}>
              <h2 className={styles.fbThanks}>{t('Thanks for your time!')}</h2>

              <div className={styles.fbNext}>
                <p className={styles.fbNextHeading}>{t('What happens next?')}</p>

                <div className={styles.fbTimeline}>
                  {/* Icon column */}
                  <div className={styles.fbTimelineNodes}>
                    <div className={styles.fbTimelineNode}>
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                        <path d={mdiCircleMedium} />
                      </svg>
                    </div>
                    <div className={styles.fbTimelineConnector} aria-hidden />
                    <div className={styles.fbTimelineNode}>
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                        <path d={mdiCircleMedium} />
                      </svg>
                    </div>
                  </div>

                  {/* Text column */}
                  <div className={styles.fbTimelineRows}>
                    <div className={styles.fbTimelineRow}>
                      <p className={styles.fbTimelineTitle}>{t('Review of feedback')}</p>
                      <p className={styles.fbTimelineDesc}>
                        {t('A human reviewer will evaluate the feedback and interview recording to take a decision')}
                      </p>
                    </div>
                    <div className={styles.fbTimelineRow}>
                      <p className={styles.fbTimelineTitle}>{t('Email')}</p>
                      <p className={styles.fbTimelineDesc}>
                        {t('Selected candidates will receive an email with next steps and (any) subsequent interviews.')}
                      </p>
                    </div>
                  </div>
                </div>

                <p className={styles.fbFaqLine}>
                  {t('For more information read')}{' '}
                  <a href="#" className={styles.fbLink}>{t('frequently asked questions')}</a>
                </p>
              </div>
            </div>

            {/* Divider */}
            <div className={styles.fbDivider} />

            {/* -- Rating + form -- */}
            <div className={styles.fbCardInner}>
              <div className={styles.fbFormBlock}>

                {/* Star rating */}
                <div className={styles.fbRating}>
                  <p className={styles.fbRatingHeading}>{t('How was your interview experience?')}</p>
                  <div className={styles.fbStarsRow}>
                    <div className={styles.fbStars} role="radiogroup" aria-label={t('Interview experience rating')}>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          type="button"
                          role="radio"
                          aria-checked={rating === n}
                          className={classnames(styles.fbStarBtn, {
                            [styles['fbStarBtn--on']]: n <= rating,
                          })}
                          onClick={() => setRating(n)}
                        >
                          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                            <path d={n <= rating ? mdiStar : mdiStarOutline} />
                          </svg>
                        </button>
                      ))}
                    </div>
                    {label && <span className={styles.fbRatingPill}>{label}</span>}
                  </div>
                  <p className={styles.fbRatingNote}>{t('This response is not part of your interview')}</p>
                </div>

                {/* Checkboxes */}
                <div className={styles.fbChecks}>
                  <p className={styles.fbChecksHeading}>{t('Check all that apply (optional)')}</p>
                  <div className={styles.fbChecksList}>
                    {CHECKBOXES.map((c) => (
                      <label key={c} className={styles.fbCheckItem}>
                        <input
                          type="checkbox"
                          checked={!!checks[c]}
                          onChange={() => toggleCheck(c)}
                          className={styles.fbCheckInput}
                        />
                        <span className={styles.fbCheckLabel}>{c}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Additional feedback */}
                <div className={styles.fbTextareaBlock}>
                  <p className={styles.fbTextareaHeading}>{t('Additional feedback')}</p>
                  <textarea
                    className={styles.fbTextarea}
                    placeholder=" "
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    rows={3}
                  />
                </div>

              </div>
            </div>

            {/* Button bar */}
            <div className={styles.fbBtnBar}>
              <button type="button" className={styles.fbBtnSkip}>{t('Skip')}</button>
              <button type="button" className={styles.fbBtnSubmit}>{t('Submit feedback')}</button>
            </div>

          </div>{/* /fb-card */}

          <div className={styles.fbGap} />
        </div>{/* /fb-content */}

        {/* Powered by footer */}
        <footer className={styles.fbFooter}>
          <span className={styles.fbFooterText}>{t('Powered by')}</span>
          <img src="/ef-logo.png" alt="Eightfold" width={18} height={18} />
          <span className={styles.fbFooterBrand}>{t('eightfold.ai')}</span>
          <span className={styles.fbFooterText}>{t('#Whatsnextforyou')}</span>
        </footer>
      </div>

    </section>
  );
}
