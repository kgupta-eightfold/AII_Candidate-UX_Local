import { useState, useEffect, useRef, useCallback } from 'react';
import classnames from 'classnames';
import { i18nUtils } from '@i18n';
import { useInterview } from '../../context/InterviewContext';
import styles from './sectionTransitionCard.module.scss';

const COUNTDOWN_SECONDS = 60;

/**
 * Section handoff CTAs shown in the interview main area (replaces the former full-screen transition modal).
 * Design reference: https://www.figma.com/design/9iS8TSEUPITZacdJ6TSBQz/%E2%9C%85-AI-Interview---Part-5?node-id=9-29745
 */
export default function SectionTransitionCard() {
  const { state, dispatch } = useInterview();
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);

  const handleContinue = useCallback(() => {
    dispatch({ type: 'HIDE_TRANSITION' });

    if (state.screen === 'endInterview') {
      dispatch({ type: 'SET_SCREEN', screen: 'feedbackForm' });
      dispatch({ type: 'SET_CONTROLS_MODE', mode: 'hidden' });
      return;
    }

    if (state.phase === 'promptTechQna') {
      dispatch({ type: 'SET_PHASE', phase: 'techQnaIntro' });
      dispatch({ type: 'SET_SCREEN', screen: 'techqna' });
      dispatch({ type: 'SET_CONTROLS_MODE', mode: 'expanded' });
    } else if (state.phase === 'promptCoding') {
      dispatch({ type: 'SET_PHASE', phase: 'codingIntro' });
      dispatch({ type: 'SET_SCREEN', screen: 'coding' });
      dispatch({ type: 'SET_CONTROLS_MODE', mode: 'collapsed' });
    } else if (state.phase === 'promptWhiteboard') {
      dispatch({ type: 'SET_PHASE', phase: 'whiteboardActive' });
      dispatch({ type: 'SET_SCREEN', screen: 'whiteboard' });
      dispatch({ type: 'SET_CONTROLS_MODE', mode: 'collapsed' });
    }
  }, [state.screen, state.phase, dispatch]);

  // Keep a ref so the interval callback always has the latest handleContinue
  const handleContinueRef = useRef(handleContinue);
  useEffect(() => { handleContinueRef.current = handleContinue; }, [handleContinue]);

  // Reset and start countdown whenever a new transition modal opens
  useEffect(() => {
    if (!state.transitionModal) return;
    setCountdown(COUNTDOWN_SECONDS);
    const id = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) {
          clearInterval(id);
          setTimeout(() => handleContinueRef.current(), 0);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [state.transitionModal]);

  if (!state.transitionModal) return null;

  const { title, duration, details, primaryOnly, primaryLabel } = state.transitionModal;
  const showBreak = !primaryOnly;
  const continueLabel = primaryLabel ?? i18nUtils.gettext('Continue');

  const handleBreak = () => {
    dispatch({ type: 'HIDE_TRANSITION' });
    dispatch({ type: 'START_BREAK', returnPhase: state.phase });
  };

  return (
    <div className={styles.sectionTransitionCard} role="region" aria-label={i18nUtils.gettext('Next section')}>
      <div className={styles.sectionTransitionHeader}>
        <span className={styles.sectionTransitionTitle}>{title}</span>
        {duration ? (
          <div className={styles.sectionTransitionTime}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
              <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span>{duration}</span>
          </div>
        ) : null}
      </div>
      <div className="sc-divider" />
      <ul className={styles.sectionTransitionDetails}>
        {details.map((d, i) => (
          <li key={i}>{d}</li>
        ))}
      </ul>
      <div
        className={classnames(
          styles.sectionTransitionActions,
          'sc-footer-actions',
          { [styles.sectionTransitionActionsPrimaryOnly]: primaryOnly },
        )}
      >
        <button
          type="button"
          className={classnames('sc-btn-next', styles.sectionTransitionCta)}
          onClick={handleContinue}
        >
          {continueLabel}
          <span className={styles.sectionTransitionCountdown}>({countdown})</span>
        </button>
        {showBreak ? (
          <button type="button" className={classnames('sc-verify-btn', styles.sectionTransitionCta)} onClick={handleBreak}>
            {i18nUtils.gettext('Take a 10 min break')}
          </button>
        ) : null}
      </div>
      <p className={styles.sectionTransitionAutoMsg}>
        {i18nUtils.gettext('Page will automatically continue to interview')}
      </p>
    </div>
  );
}
