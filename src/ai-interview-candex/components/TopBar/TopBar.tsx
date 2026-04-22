import classnames from 'classnames';
import { i18nUtils } from '@i18n';
import { useInterview } from '../../context/InterviewContext';
import { phaseLabels, completedLabels } from './constants';
import styles from './topBar.module.scss';

export default function TopBar() {
  const { state } = useInterview();
  const handoff = state.transitionModal != null;

  const isLandingOrEmail =
    state.screen === 'email' ||
    state.screen === 'landing' ||
    state.screen === 'landingStarbucks' ||
    state.screen === 'landingAssessment' ||
    state.screen === 'landingPostAssessment' ||
    state.screen === 'feedbackForm';
  const isBreak = state.screen === 'break';

  if (isLandingOrEmail) return null;

  let label = phaseLabels[state.phase] ?? '';
  if (state.screen === 'endInterview') {
    label = completedLabels.endInterview;
  } else if (handoff && state.phase === 'promptTechQna') {
    label = completedLabels.promptTechQna;
  } else if (handoff && state.phase === 'promptCoding') {
    label = completedLabels.promptCoding;
  } else if (handoff && state.phase === 'promptWhiteboard') {
    label = completedLabels.promptWhiteboard;
  }
  const minutes = String(Math.floor(state.elapsedSeconds / 60)).padStart(2, '0');
  const seconds = String(state.elapsedSeconds % 60).padStart(2, '0');

  return (
    <header
      className={classnames(styles.topBar, {
        [styles.codingTopBar]:
          state.screen === 'coding' || state.screen === 'whiteboard' || state.screen === 'endInterview',
      })}
    >
      <div className={styles.titleGroup}>
        <img className={styles.titleIcon} src={`${import.meta.env.BASE_URL}ef-logo.png`} alt="EF logo" />
        <div className={styles.titleDivider} />
        <span className={styles.titleText}>{i18nUtils.gettext('Smart Interview')}</span>
      </div>
      <div className={styles.topBarRight}>
        {isBreak ? (
          <span className={styles.timerPill}>{i18nUtils.gettext('Break Time')}</span>
        ) : state.screen === 'endInterview' || label ? (
          <>
            <span className={styles.screeningLabel}>{label}</span>
            <span className={styles.timerPill}>{minutes}:{seconds}</span>
          </>
        ) : null}
      </div>
    </header>
  );
}
