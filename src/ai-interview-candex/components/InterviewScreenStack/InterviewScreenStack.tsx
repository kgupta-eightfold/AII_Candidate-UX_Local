import { useEffect, useRef, useState } from 'react';
import classnames from 'classnames';
import { useInterview, type ScreenName } from '../../context/InterviewContext';
import EmailScreen from '../../screens/EmailScreen';
import LandingScreen from '../../screens/LandingScreen';
import ConversationalScreen from '../../screens/ConversationalScreen';
import TechQnAScreen from '../../screens/TechQnAScreen';
import CodingScreen from '../../screens/CodingScreen';
import WhiteboardScreen from '../../screens/WhiteboardScreen';
import EndInterviewScreen from '../../screens/EndInterviewScreen';
import FeedbackFormScreen from '../../screens/FeedbackFormScreen';
import BreakScreen from '../../screens/BreakScreen';
import styles from './interviewScreenStack.module.scss';

const CROSSFADE_MS = 420;

function renderScreen(screen: ScreenName) {
  switch (screen) {
    case 'email':
      return <EmailScreen />;
    case 'landing':
      return <LandingScreen variant="default" />;
    case 'landingStarbucks':
      return <LandingScreen variant="starbucks" />;
    case 'landingAssessment':
      return <LandingScreen variant="assessment" />;
    case 'landingPostAssessment':
      return <LandingScreen variant="post-assessment" />;
    case 'conversational':
      return <ConversationalScreen />;
    case 'techqna':
      return <TechQnAScreen />;
    case 'coding':
      return <CodingScreen />;
    case 'whiteboard':
      return <WhiteboardScreen />;
    case 'endInterview':
      return <EndInterviewScreen />;
    case 'feedbackForm':
      return <FeedbackFormScreen />;
    case 'break':
      return <BreakScreen />;
    default:
      return <EmailScreen />;
  }
}

/**
 * Crossfades between route screens (outgoing fades out while incoming fades in).
 */
export default function InterviewScreenStack() {
  const { state } = useInterview();
  const prevRef = useRef<ScreenName>(state.screen);
  const [exiting, setExiting] = useState<ScreenName | null>(null);

  useEffect(() => {
    if (state.screen === prevRef.current) return;
    setExiting(prevRef.current);
    prevRef.current = state.screen;
    const id = window.setTimeout(() => setExiting(null), CROSSFADE_MS);
    return () => window.clearTimeout(id);
  }, [state.screen]);

  return (
    <div className={styles.interviewScreenStack}>
      {exiting !== null && (
        <div className={classnames(styles.interviewScreenLayer, styles.interviewScreenLayerExiting)} aria-hidden>
          {renderScreen(exiting)}
        </div>
      )}
      <div className={classnames(styles.interviewScreenLayer, styles.interviewScreenLayerEntering)}>
        {renderScreen(state.screen)}
      </div>
    </div>
  );
}
