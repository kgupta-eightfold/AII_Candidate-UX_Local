import { useRef, useEffect, useLayoutEffect, useCallback, useState, useMemo } from 'react';
import {
  useInterview,
  videoUrl,
  VIDEOS,
  TRANSCRIPTS,
  SECTION_TRANSITION_CODING,
} from '../../context/InterviewContext';
import AvatarArea from '../../components/AvatarArea';
import SectionTransitionCard from '../../components/SectionTransitionCard';
import { InterviewBackground, InterviewMainBand } from '../../components/interview';
import SelfVideoPanel from '../../components/SelfVideoPanel';
import TranscriptPanel from '../../components/TranscriptPanel';
import { i18nUtils } from '@i18n';
import './techQnAScreen.module.scss';

const { gettext: t } = i18nUtils;

export default function TechQnAScreen() {
  const { state, dispatch } = useInterview();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [caption, setCaption] = useState('');
  const transcriptMessages = useMemo(
    () => [{ text: caption || t("Let's begin the technical questions section.") }],
    [caption],
  );
  const transcriptIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedRef = useRef(false);

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
    if (state.screen !== 'techqna') return;
    if (state.phase === 'promptCoding' && state.transitionModal) return;
    if (startedRef.current) return;
    startedRef.current = true;

    const video = videoRef.current;

    const timer = setTimeout(() => {
      playWithTranscript(VIDEOS.techQna, 'techQna', () => {
        dispatch({ type: 'SET_PHASE', phase: 'promptCoding' });
        playWithTranscript(VIDEOS.promptCoding, 'promptCoding', () => {
          dispatch({ type: 'SHOW_TRANSITION', config: SECTION_TRANSITION_CODING });
        });
      });
    }, 500);

    return () => {
      clearTimeout(timer);
      clearTranscript();
      startedRef.current = false;
      if (video) { video.pause(); video.removeAttribute('src'); video.load(); }
    };
  }, [state.screen, playWithTranscript, dispatch, clearTranscript]);

  const handoffToCoding =
    state.phase === 'promptCoding' && state.transitionModal != null;

  useLayoutEffect(() => {
    if (state.screen !== 'techqna' || state.phase !== 'promptCoding' || !state.transitionModal) return;

    const apply = (): boolean => {
      const video = videoRef.current;
      if (!video) return false;

      const nearEnd =
        video.paused &&
        video.duration &&
        !Number.isNaN(video.duration) &&
        video.duration - video.currentTime < 0.25;

      if (video.src && video.src.includes(encodeURIComponent(VIDEOS.promptCoding)) && nearEnd) {
        return true;
      }

      video.src = videoUrl(VIDEOS.promptCoding);
      video.load();
      video.pause();
      const onMeta = () => {
        if (video.duration && !Number.isNaN(video.duration)) {
          video.currentTime = Math.max(0, video.duration - 0.05);
        }
        video.pause();
        video.removeEventListener('loadedmetadata', onMeta);
      };
      video.addEventListener('loadedmetadata', onMeta);
      return true;
    };

    if (apply()) return;
    const id = requestAnimationFrame(() => {
      apply();
    });
    return () => cancelAnimationFrame(id);
  }, [state.screen, state.phase, state.transitionModal]);

  return (
    <section className="screen active" id="screen-techqna">
      <InterviewBackground />

      <InterviewMainBand
        variant="techqna"
        transcriptHidden={state.transcriptPanelOpen}
        techqnaClassName={state.transitionModal ? 'techqna-content--transition-handoff' : undefined}
      >
        <div
          className={`techqna-sidebar-slot${state.transitionModal ? ' techqna-sidebar-slot--exited' : ''}`}
          aria-hidden={state.transitionModal ? true : undefined}
        >
          <div className="problem-card">
            <div className="panel-surface-header">
              <span className="panel-surface-title">{t('Questions')}</span>
            </div>
            <div className="problem-card-body">
              <div className="problem-item active">
                <div className="problem-item-header">
                  <span className="q-badge">{t('Q1')}</span>
                  <h3 className="q-title">{t('Two Sum')}</h3>
                </div>
                <p className="q-description">
                  {t('Explain how the Node.js Event Loop works under the hood. How does Node.js handle asynchronous operations despite being fundamentally single-threaded?')}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div
          className={`techqna-main-area${state.transitionModal ? ' techqna-main-area--section-transition' : ''}`}
        >
          <div className="techqna-center-cluster">
            <div className="avatar-main-slot">
              <AvatarArea videoRef={videoRef} suppressAutoPlay={handoffToCoding} />
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
                  {t('View transcript')}
                </button>
              </div>
            )}
          </div>

          {state.transitionModal && <SectionTransitionCard />}
        </div>

        <TranscriptPanel messages={transcriptMessages} variant="coding" />
      </InterviewMainBand>

      <SelfVideoPanel />
    </section>
  );
}
