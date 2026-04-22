import { useEffect } from 'react';
import { useInterview } from '@context/InterviewContext';

import TopBar from './components/TopBar';
import BottomControls from './components/BottomControls';
import BrandMenu from './components/BrandMenu';

import InterviewScreenStack from './components/InterviewScreenStack';

function InterviewTimer() {
  const { state, dispatch } = useInterview();

  useEffect(() => {
    const isInterviewScreen =
      state.screen === 'conversational' ||
      state.screen === 'techqna' ||
      state.screen === 'coding' ||
      state.screen === 'whiteboard' ||
      state.screen === 'endInterview';
    if (!isInterviewScreen) return;

    const interval = setInterval(() => {
      dispatch({ type: 'TICK_TIMER' });
    }, 1000);

    return () => clearInterval(interval);
  }, [state.screen, dispatch]);

  return null;
}

export default function App() {
  return (
    <>
      <InterviewTimer />
      <TopBar />
      <InterviewScreenStack />
      <BottomControls />
      <BrandMenu />
    </>
  );
}
