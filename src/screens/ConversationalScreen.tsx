import { useRef, useEffect, useCallback, useState, useMemo } from 'react';
import {
  useInterview,
  videoUrl,
  VIDEOS,
  TRANSCRIPTS,
  SECTION_TRANSITION_TECHQNA,
} from '@context/InterviewContext';
import AvatarArea from '@components/AvatarArea';
import SectionTransitionCard from '@components/SectionTransitionCard';
import { InterviewBackground, InterviewMainBand } from '@components/interview';
import SelfVideoPanel from '@components/SelfVideoPanel';
import TranscriptPanel from '@components/TranscriptPanel';

export default function ConversationalScreen() {
  const { state, dispatch } = useInterview();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [caption, setCaption] = useState('');
  const transcriptMessages = useMemo(
    () => [{ text: caption || 'Hi Emily, thank you for joining today. I will be guiding this interview.' }],
    [caption],
  );
  const transcriptIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const phaseRef = useRef(state.phase);
  phaseRef.current = state.phase;

  const clearTranscript = useCallback(() => {
    if (transcriptIntervalRef.current) {
      clearInterval(transcriptIntervalRef.current);
      transcriptIntervalRef.current = null;
    }
  }, []);

  const playWithTranscript = useCallback(
    (filename: string, transcriptKey: string, onEnd?: () => void) => {
      const video = videoRef.current;
      if (!video) return;

      video.src = videoUrl(filename);
      video.load();
      setCaption('');
      clearTranscript();

      const fullText = TRANSCRIPTS[transcriptKey] || '';
      const words = fullText.split(' ');

      const startTranscript = () => {
        const duration = video.duration;
        if (!duration || words.length === 0) return;
        const wordDelay = (duration * 1000) / words.length;
        let wordIndex = 0;
        let built = '';

        transcriptIntervalRef.current = setInterval(() => {
          if (wordIndex < words.length) {
            built += (wordIndex > 0 ? ' ' : '') + words[wordIndex];
            setCaption(built);
            wordIndex++;
          } else {
            clearTranscript();
          }
        }, wordDelay);
      };

      if (video.readyState >= 1) {
        startTranscript();
      } else {
        const onMeta = () => { video.removeEventListener('loadedmetadata', onMeta); startTranscript(); };
        video.addEventListener('loadedmetadata', onMeta);
      }

      if (onEnd) {
        const handler = () => {
          video.removeEventListener('ended', handler);
          clearTranscript();
          video.pause();
          const dur = video.duration;
          if (dur && !Number.isNaN(dur) && dur > 0.05) {
            video.currentTime = Math.max(0, dur - 0.05);
          }
          onEnd();
        };
        video.addEventListener('ended', handler);
      }

      video.play().catch(() => {
        const resume = () => { video.play(); document.removeEventListener('click', resume); };
        document.addEventListener('click', resume);
      });
    },
    [clearTranscript],
  );

  useEffect(() => {
    if (state.screen !== 'conversational' || state.phase !== 'intro') return;

    const timer = setTimeout(() => {
      playWithTranscript(VIDEOS.intro, 'intro', () => {
        dispatch({ type: 'SET_PHASE', phase: 'promptTechQna' });
        playWithTranscript(VIDEOS.promptTechQna, 'promptTechQna', () => {
          dispatch({ type: 'SHOW_TRANSITION', config: SECTION_TRANSITION_TECHQNA });
        });
      });
    }, 300);

    return () => { clearTimeout(timer); clearTranscript(); };
  }, [state.screen, state.phase, playWithTranscript, dispatch, clearTranscript]);

  /** View switcher / deep link: show transition with Sophia paused on last frame of the prompt video. */
  useEffect(() => {
    if (state.screen !== 'conversational' || state.phase !== 'promptTechQna' || !state.transitionModal) return;

    const video = videoRef.current;
    if (!video) return;

    const nearEnd =
      video.paused &&
      video.duration &&
      !Number.isNaN(video.duration) &&
      video.duration - video.currentTime < 0.25;

    if (video.src && video.src.includes(encodeURIComponent(VIDEOS.promptTechQna)) && nearEnd) {
      return;
    }

    video.src = videoUrl(VIDEOS.promptTechQna);
    video.load();
    const onMeta = () => {
      if (video.duration && !Number.isNaN(video.duration)) {
        video.currentTime = Math.max(0, video.duration - 0.05);
      }
      video.pause();
      video.removeEventListener('loadedmetadata', onMeta);
    };
    video.addEventListener('loadedmetadata', onMeta);
  }, [state.screen, state.phase, state.transitionModal]);

  return (
    <section className="screen active" id="screen-conversational">
      <InterviewBackground />

      <InterviewMainBand
        variant="techqna"
        transcriptHidden={state.transcriptPanelOpen}
        techqnaClassName="techqna-content--conversational"
      >
        {/* Same column width as Tech Q&A questions panel; visually empty (screening has no questions list) */}
        <div className="techqna-questions-slot techqna-questions-slot--empty" aria-hidden="true" />

        <div
          className={`techqna-main-area${state.transitionModal ? ' techqna-main-area--section-transition' : ''}`}
        >
          <div className="techqna-center-cluster">
            <div className="avatar-main-slot">
              <AvatarArea videoRef={videoRef} />
            </div>

            {!state.transitionModal && (
              <div className="transcript-area">
                <div className="transcript-fade" />
                <p className="transcript-line current">{caption}</p>
                <button
                  type="button"
                  className="view-transcript-btn"
                  onClick={() => dispatch({ type: 'TOGGLE_TRANSCRIPT_PANEL' })}
                >
                  View transcript
                </button>
              </div>
            )}

            {state.transitionModal && <SectionTransitionCard />}
          </div>
        </div>

        <TranscriptPanel messages={transcriptMessages} variant="coding" />
      </InterviewMainBand>

      <SelfVideoPanel />
    </section>
  );
}
