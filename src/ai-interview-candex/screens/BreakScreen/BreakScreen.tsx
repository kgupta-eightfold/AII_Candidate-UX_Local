import { useState, useEffect, useRef, useCallback } from 'react';
import { useInterview } from '../../context/InterviewContext';
import { i18nUtils } from '@i18n';
import classnames from 'classnames';
import styles from './breakScreen.module.scss';

const { gettext: t } = i18nUtils;

export default function BreakScreen() {
  const { state, dispatch } = useInterview();
  const [remaining, setRemaining] = useState(600);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const breakReturnRef = useRef(state.breakReturnPhase);
  breakReturnRef.current = state.breakReturnPhase;

  const handleEndBreak = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    const returnPhase = breakReturnRef.current;
    dispatch({ type: 'END_BREAK' });

    if (returnPhase === 'promptTechQna') {
      dispatch({ type: 'SET_PHASE', phase: 'techQnaIntro' });
      dispatch({ type: 'SET_SCREEN', screen: 'techqna' });
      dispatch({ type: 'SET_CONTROLS_MODE', mode: 'expanded' });
    } else if (returnPhase === 'promptCoding') {
      dispatch({ type: 'SET_PHASE', phase: 'codingIntro' });
      dispatch({ type: 'SET_SCREEN', screen: 'coding' });
      dispatch({ type: 'SET_CONTROLS_MODE', mode: 'collapsed' });
    } else if (returnPhase === 'promptWhiteboard') {
      dispatch({ type: 'SET_PHASE', phase: 'whiteboardActive' });
      dispatch({ type: 'SET_SCREEN', screen: 'whiteboard' });
      dispatch({ type: 'SET_CONTROLS_MODE', mode: 'collapsed' });
    }
  }, [dispatch]);

  useEffect(() => {
    if (state.screen !== 'break') return;
    setRemaining(600);
    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          handleEndBreak();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [state.screen, handleEndBreak]);

  const minutes = String(Math.floor(remaining / 60)).padStart(2, '0');
  const seconds = String(remaining % 60).padStart(2, '0');

  return (
    <section className="screen active break-screen" id="screen-break">
      <div className="bg-base">
        <div className="bg-blur bg-blur-blue" />
        <div className="bg-blur bg-blur-purple" />
      </div>

      <div className={styles.breakContent}>
        <div className={styles.breakRings}>
          <div className={classnames(styles.breakRing, styles.breakRing1)} />
          <div className={classnames(styles.breakRing, styles.breakRing2)} />
          <div className={classnames(styles.breakRing, styles.breakRing3)} />
        </div>
        <div className={styles.breakCenter}>
          <p className={styles.breakTitle}>{t('Take a moment to relax')}</p>
          <div className={styles.breakTimerBadge}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
              <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span>{minutes}:{seconds}</span>
          </div>
          <button className={styles.breakStartBtn} onClick={handleEndBreak}>
            {t('Start Next Section')}
          </button>
          <p className={styles.breakAutoResume}>
            {t('Next section will automatically resume after 10 min')}
          </p>
        </div>
      </div>
    </section>
  );
}
