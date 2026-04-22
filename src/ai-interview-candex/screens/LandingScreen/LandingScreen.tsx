import { useRef, useState, useCallback, useEffect } from 'react';
import type { BrandVariant } from '../../context/InterviewContext';
import { Pill, PillSize } from '@eightfold.ai/octuple';
import { mdiPlay, mdiPause, mdiReplay } from '@mdi/js';
import SystemCheckModal from '../../components/SystemCheckModal';
import { i18nUtils } from '@i18n';
import classnames from 'classnames';
import styles from './landingScreen.module.scss';
import { SECTIONS, INTRO_VIDEOS } from './constants';

const { gettext: t } = i18nUtils;

interface LandingScreenProps {
  variant?: BrandVariant;
}

function LandingHeader() {
  return (
    <header className={styles.landingHeader}>
      <div className={styles.landingHeaderLogo}>
        <img src={`${import.meta.env.BASE_URL}ef-logo.png`} alt="" />
        <span className={styles.landingHeaderLogoText}>{t('Eightfold.ai')}</span>
      </div>
      <div className={styles.landingHeaderRight}>
        <div className={styles.landingHeaderRole}>
          <span>{t('Software Engineer')}</span>
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M19 19H5V5h7V3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z" fill="currentColor"/>
          </svg>
        </div>
        <span className={styles.landingHeaderLocation}>{t('Bangalore, India')}</span>
      </div>
    </header>
  );
}

function LandingFooter() {
  return (
    <footer className={styles.landingFooter}>
      <div className={styles.landingFooterInner}>
        <span className={styles.landingFooterText}>{t('Powered by')}</span>
        <img src={`${import.meta.env.BASE_URL}eightfold_logo_white.png`} alt="eightfold.ai" className={styles.landingFooterLogo} />
        <span className={styles.landingFooterText}>{t('#Whatsnextforyou')}</span>
      </div>
    </footer>
  );
}

export default function LandingScreen({ variant = 'default' }: LandingScreenProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [, setVideoIndex] = useState(0);
  const [shownChips, setShownChips] = useState<number[]>([]);
  const [sequenceDone, setSequenceDone] = useState(false);
  const [fading, setFading] = useState(false);
  const [hoveredSection, setHoveredSection] = useState<number | null>(null);
  const [systemCheckOpen, setSystemCheckOpen] = useState(false);
  const systemCheckOpenRef = useRef(false);
  const lastHoveredRef = useRef(0);
  if (hoveredSection !== null) lastHoveredRef.current = hoveredSection;

  useEffect(() => {
    systemCheckOpenRef.current = systemCheckOpen;
  }, [systemCheckOpen]);

  useEffect(() => {
    if (!systemCheckOpen) return;
    const video = videoRef.current;
    if (video) {
      video.pause();
    }
    setPlaying(false);
  }, [systemCheckOpen]);

  const restartSequence = useCallback(() => {
    setFading(true);
    setTimeout(() => {
      if (systemCheckOpenRef.current) return;
      const video = videoRef.current;
      if (video) {
        video.src = INTRO_VIDEOS[0].src;
        video.load();
        video.play().catch(() => {});
      }
      setVideoIndex(0);
      setShownChips([]);
      setSequenceDone(false);
      setPlaying(true);
      setFading(false);
    }, 400);
  }, []);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (sequenceDone) {
      restartSequence();
      return;
    }
    if (video.paused) {
      video.play();
      setPlaying(true);
    } else {
      video.pause();
      setPlaying(false);
    }
  }, [sequenceDone, restartSequence]);

  const handleVideoEnded = useCallback(() => {
    setVideoIndex(prev => {
      const next = prev + 1;
      if (next < INTRO_VIDEOS.length) {
        setTimeout(() => {
          if (systemCheckOpenRef.current) return;
          const video = videoRef.current;
          if (video) {
            video.src = INTRO_VIDEOS[next].src;
            video.load();
            video.play().then(() => {
              if (INTRO_VIDEOS[next].chip) {
                setShownChips(chips => [...chips, next]);
              }
            }).catch(() => {});
          }
        }, 300);
        return next;
      }
      setPlaying(false);
      setSequenceDone(true);
      return prev;
    });
  }, []);

  return (
    <section className="screen active" id={`screen-landing-${variant}`}>
      <div className={styles.landingPage}>
        <img src={`${import.meta.env.BASE_URL}landing-bg.png`} alt="" className={styles.landingBgImage} />

        <LandingHeader />

        <div className={styles.landingMain}>
          <div className={styles.landingContent}>
            {/* Welcome text */}
            <div className={styles.landingWelcome}>
              <p className={styles.landingWelcomeText}>
                {t('Hey Emily, welcome to the')} <strong>{t('Smart interview round.')}</strong>
              </p>
              <div className={styles.landingWelcomeTags}>
                <Pill label={t('AI Interview')} theme="aiAgent" size={PillSize.XSmall} classNames={styles.landingPillAi} />
                <span className={styles.landingTagSeparator}>&middot;</span>
                <Pill label={t('Approx 90 mins')} theme="grey" size={PillSize.XSmall} classNames={styles.landingPillTime} />
              </div>
            </div>

            {/* Main card */}
            <div className={styles.landingCard}>
              <div className={styles.landingCardInner}>
                <div className={styles.landingCardTop}>
                  {/* Avatar */}
                  <div className={styles.landingAvatarArea}>
                    <div className={styles.landingAvatarContainer}>
                      <div className={classnames(styles.landingAvatarRing, styles['landingAvatarRing--outer'])} />
                      <div className={classnames(styles.landingAvatarRing, styles['landingAvatarRing--mid'])} />
                      <div className={classnames(styles.landingAvatarRing, styles['landingAvatarRing--inner'])} />
                      <video
                        ref={videoRef}
                        src={INTRO_VIDEOS[0].src}
                        className={classnames(styles.landingAvatarVideo, {
                          [styles['landingAvatarVideo--fading']]: fading,
                        })}
                        playsInline
                        preload="auto"
                        onEnded={handleVideoEnded}
                      />
                      <button
                        className={styles.landingAvatarPlay}
                        aria-label={playing ? t('Pause intro') : t('Play intro')}
                        onClick={togglePlay}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                          <path d={playing ? mdiPause : sequenceDone ? mdiReplay : mdiPlay} />
                        </svg>
                      </button>

                      {/* Video intro info-bars */}
                      <div className={classnames(styles.landingVideoChips, {
                        [styles['landingVideoChips--fading']]: fading,
                      })}>
                        {INTRO_VIDEOS.map((v, i) =>
                          v.chip ? (
                            <div
                              key={i}
                              className={classnames(styles.landingVideoChip, {
                                [styles['landingVideoChip--visible']]: shownChips.includes(i),
                                [styles['landingVideoChip--past']]: shownChips.includes(i) && shownChips[shownChips.length - 1] !== i,
                              })}
                            >
                              {t(v.chip)}
                            </div>
                          ) : null,
                        )}
                      </div>
                    </div>

                    {/* Interview sections */}
                    <div className={styles.landingSections}>
                      <span className={styles.landingSectionsLabel}>{t('This interview includes')}</span>
                      <div className={styles.landingSectionsTags}>
                        {SECTIONS.map((s, i) => (
                          <span
                            key={s.label}
                            className={classnames(styles.landingSectionChip, {
                              [styles['landingSectionChip--active']]: hoveredSection === i,
                            })}
                            onMouseEnter={() => setHoveredSection(i)}
                            onMouseLeave={() => setHoveredSection(null)}
                          >
                            {t(s.label)}
                          </span>
                        ))}
                      </div>
                      <div className={classnames(styles.landingSectionInfo, {
                        [styles['landingSectionInfo--visible']]: hoveredSection !== null,
                      })}>
                        <span className={styles.landingSectionInfoDuration}>
                          {t(SECTIONS[hoveredSection ?? lastHoveredRef.current].duration)}
                        </span>
                        <span className={styles.landingSectionInfoDot}>&middot;</span>
                        <span className={styles.landingSectionInfoDesc}>
                          {t(SECTIONS[hoveredSection ?? lastHoveredRef.current].description)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* CTA */}
                  <div className={styles.landingCta}>
                    <button className={styles.landingStartBtn} onClick={() => setSystemCheckOpen(true)}>
                      {t('Start interview')}
                    </button>
                    <button className={styles.landingCalendarLink}>{t('Add to calendar')}</button>
                  </div>
                </div>

                {/* Card footer */}
                <div className={styles.landingCardFooter}>
                  <div className={styles.landingCardDivider} />
                  <div className={styles.landingCardFooterRow}>
                    <div className={styles.landingCardExpiry}>
                      <svg viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
                        <path d="M12 8v4l2 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                      <span>{t('Expires at 8:00am Apr 25, 2026')}</span>
                    </div>
                    <button className={styles.landingCardOptionsLink}>{t('View more options')}</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <LandingFooter />
      </div>

      <SystemCheckModal open={systemCheckOpen} onClose={() => setSystemCheckOpen(false)} />
    </section>
  );
}
