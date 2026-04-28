import { useRef, useEffect } from 'react';
import { useInterview, VIDEOS, SECTION_TRANSITION_END_INTERVIEW } from '../../context/InterviewContext';
import AvatarArea from '../../components/AvatarArea';
import SectionTransitionCard from '../../components/SectionTransitionCard';
import { InterviewBackground, InterviewMainBand } from '../../components/interview';
import SelfVideoPanel from '../../components/SelfVideoPanel';
import TranscriptPanel from '../../components/TranscriptPanel';
import { i18nUtils } from '@i18n';
import './endInterviewScreen.module.scss';

const { gettext: t } = i18nUtils;

/**
 * End interview: same layout as other section transitions -- avatar + SectionTransitionCard
 * (primary "End interview", no break CTA). End.mp4 in avatar.
 */
export default function EndInterviewScreen() {
  const { state, dispatch } = useInterview();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (state.screen !== 'endInterview') return;
    if (state.transitionModal) return;
    dispatch({ type: 'SHOW_TRANSITION', config: SECTION_TRANSITION_END_INTERVIEW });
  }, [state.screen, state.transitionModal, dispatch]);

  const activeHere = state.screen === 'endInterview';

  useEffect(() => {
    if (!activeHere) return;
    const v = videoRef.current;
    if (!v) return;
    const boost = () => {
      v.muted = false;
      v.volume = 1;
    };
    boost();
    v.addEventListener('loadeddata', boost);
    return () => v.removeEventListener('loadeddata', boost);
  }, [activeHere]);

  useEffect(() => {
    return () => {
      const v = videoRef.current;
      if (!v) return;
      v.pause();
      v.removeAttribute('src');
      v.load();
    };
  }, []);

  const transcriptMessages = [{ text: t('Thank you for completing the interview.') }];

  return (
    <section className="screen active end-interview-screen" id="screen-end-interview">
      <InterviewBackground />

      <InterviewMainBand
        variant="techqna"
        transcriptHidden={false}
        techqnaClassName="techqna-content--transition-handoff"
      >
        <div className="techqna-sidebar-slot techqna-sidebar-slot--exited" aria-hidden>
          <div className="problem-card">
            <div className="panel-surface-header">
              <span className="panel-surface-title">{t('Questions')}</span>
            </div>
            <div className="problem-card-body" />
          </div>
        </div>

        <div className="techqna-main-area techqna-main-area--section-transition">
          <div className="techqna-center-cluster">
            <div className="avatar-main-slot">
              <AvatarArea
                videoRef={videoRef}
                videoSrc={activeHere ? VIDEOS.end : ''}
                suppressAutoPlay={!activeHere}
              />
            </div>
          </div>
          <SectionTransitionCard />
        </div>

        <TranscriptPanel messages={transcriptMessages} variant="coding" />
      </InterviewMainBand>

      <SelfVideoPanel />
    </section>
  );
}
