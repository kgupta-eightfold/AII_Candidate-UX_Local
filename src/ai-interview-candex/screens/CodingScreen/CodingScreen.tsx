import { useRef, useEffect, useLayoutEffect, useState } from 'react';
import { useInterview, videoUrl, VIDEOS } from '../../context/InterviewContext';
import AvatarArea from '../../components/AvatarArea';
import SectionTransitionCard from '../../components/SectionTransitionCard';
import { InterviewBackground, InterviewMainBand } from '../../components/interview';
import FloatingParticipants from '../../components/FloatingParticipants';
import SelfVideoPanel from '../../components/SelfVideoPanel';
import TranscriptPanel from '../../components/TranscriptPanel';
import { i18nUtils } from '@i18n';
import './codingScreen.module.scss';

const { gettext: t } = i18nUtils;

const CROSSFADE_ALIGN_MS = 420;
const HANDOFF_FADE_MS = 420;

export default function CodingScreen() {
  const { state, dispatch } = useInterview();
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoSnapshotRef = useRef<{ src: string; time: number } | null>(null);

  const [initialHandoff] = useState(
    () => state.phase === 'promptWhiteboard' && state.transitionModal != null,
  );
  const [handoffStep, setHandoffStep] = useState<'idle' | 'fade' | 'transition'>(() =>
    initialHandoff ? 'transition' : 'idle',
  );

  const [dimQuestions, setDimQuestions] = useState(false);
  const [layoutReady, setLayoutReady] = useState(false);
  const startedRef = useRef(false);

  const handoffToWhiteboard =
    state.phase === 'promptWhiteboard' && state.transitionModal != null;

  useEffect(() => {
    if (state.screen !== 'coding') return;
    if (state.phase === 'promptWhiteboard' && state.transitionModal) return;
    if (startedRef.current) return;
    startedRef.current = true;

    const video = videoRef.current;
    if (!video) return;

    const timer = setTimeout(() => {
      video.src = videoUrl(VIDEOS.codingStart);
      video.load();
      video.play().catch(() => {
        const resume = () => {
          video.play();
          document.removeEventListener('click', resume);
        };
        document.addEventListener('click', resume);
      });
      const handler = () => {
        video.removeEventListener('ended', handler);
        dispatch({ type: 'SET_PHASE', phase: 'codingActive' });
      };
      video.addEventListener('ended', handler);
    }, 500);

    return () => {
      clearTimeout(timer);
      startedRef.current = false;
      video.pause();
      video.removeAttribute('src');
      video.load();
    };
  }, [state.screen, dispatch]);

  useEffect(() => {
    if (initialHandoff) return;

    if (state.phase !== 'promptWhiteboard' || !state.transitionModal) {
      setHandoffStep('idle');
      return;
    }

    const v = videoRef.current;
    if (v) {
      v.pause();
      const dur = v.duration;
      if (dur && !Number.isNaN(dur) && dur > 0.05) {
        v.currentTime = Math.max(0, dur - 0.05);
      }
    }

    setHandoffStep('fade');
    const t = window.setTimeout(() => {
      const el = videoRef.current;
      if (el?.src) {
        const d = el.duration;
        videoSnapshotRef.current = {
          src: el.src,
          time: d && !Number.isNaN(d) && d > 0.05 ? Math.max(0, d - 0.05) : el.currentTime,
        };
      }
      setHandoffStep('transition');
    }, HANDOFF_FADE_MS);
    return () => window.clearTimeout(t);
  }, [state.phase, state.transitionModal, initialHandoff]);

  useLayoutEffect(() => {
    if (!initialHandoff || handoffStep !== 'transition') return;

    const apply = (): boolean => {
      const v = videoRef.current;
      if (!v) return false;

      const nearEnd =
        v.paused &&
        v.duration &&
        !Number.isNaN(v.duration) &&
        v.duration - v.currentTime < 0.25;

      if (v.src && v.src.includes(encodeURIComponent(VIDEOS.codingStart)) && nearEnd) {
        return true;
      }

      v.src = videoUrl(VIDEOS.codingStart);
      v.load();
      v.pause();

      const onMeta = () => {
        if (v.duration && !Number.isNaN(v.duration)) {
          v.currentTime = Math.max(0, v.duration - 0.05);
        }
        v.pause();
        v.removeEventListener('loadedmetadata', onMeta);
      };
      v.addEventListener('loadedmetadata', onMeta);
      return true;
    };

    if (apply()) return;

    const id = requestAnimationFrame(() => {
      apply();
    });
    return () => cancelAnimationFrame(id);
  }, [initialHandoff, handoffStep]);

  useEffect(() => {
    if (handoffStep !== 'transition' || initialHandoff) return;

    const snap = videoSnapshotRef.current;
    if (!snap) return;

    const v = videoRef.current;
    if (!v) return;

    videoSnapshotRef.current = null;
    v.src = snap.src;
    v.load();
    v.pause();
    const onLoaded = () => {
      v.currentTime = snap.time;
      v.pause();
      v.removeEventListener('loadeddata', onLoaded);
    };
    v.addEventListener('loadeddata', onLoaded);
  }, [handoffStep, initialHandoff]);

  useEffect(() => {
    const id = window.setTimeout(() => setLayoutReady(true), CROSSFADE_ALIGN_MS);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    if (!layoutReady) return;
    const timer = window.setTimeout(() => setDimQuestions(true), 5000);
    return () => window.clearTimeout(timer);
  }, [layoutReady]);

  const lineNumbers = Array.from({ length: 25 }, (_, i) => i + 1);

  const transcriptMessages = [
    { text: t('Hi Emily, thank you for joining today. I will be guiding this interview.'), dimmed: true },
    { text: t('Can you share an example of a challenging project you worked on recently.'), dimmed: true },
    { text: t("That's a solid approach.") },
  ];

  const showCodingLayout = !handoffToWhiteboard || handoffStep === 'fade';
  const showTransitionLayout = handoffToWhiteboard && handoffStep === 'transition';

  return (
    <section className="screen active coding-screen" id="screen-coding">
      <InterviewBackground />

      {showCodingLayout && (
        <InterviewMainBand
          variant="coding"
          codingClassName={`coding-content--intro${layoutReady ? ' coding-content--ready' : ''}${
            handoffToWhiteboard && handoffStep === 'fade' ? ' coding-content--handoff-fade' : ''
          }`}
        >
          <div
            className={`coding-questions-panel${dimQuestions ? ' dimmed-panel' : ''}`}
            onMouseEnter={() => dimQuestions && setDimQuestions(false)}
          >
            <div className="panel-surface-header">
              <span className="panel-surface-title">{t('Questions')}</span>
            </div>
            <div className="coding-questions-body">
              <div className="coding-q-item active">
                <div className="coding-q-header">
                  <span className="q-badge">{t('Q1')}</span>
                  <h3 className="q-title">{t('Two Sum')}</h3>
                </div>
                <p className="q-description">
                  {t('Explain how the Node.js Event Loop works under the hood. How does Node.js handle asynchronous operations despite being fundamentally single-threaded?')}
                </p>
              </div>
              <div className="coding-q-item dimmed">
                <div className="coding-q-header">
                  <span className="q-badge">{t('Q2')}</span>
                  <h3 className="q-title">{t('Binary search tree')}</h3>
                </div>
              </div>
            </div>
          </div>

          <div className="code-editor-panel">
            <div className="editor-view" style={{ display: 'flex' }}>
              <div className="editor-toolbar">
                <div className="lang-selector">
                  <span className="lang-dot" />
                  <span className="lang-name">{t('Python')}</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
                <div className="editor-toolbar-actions">
                  <button type="button" className="toolbar-icon-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M12.5 8c-2.65 0-5.05 1.04-6.83 2.73L2 7.08V16h8.92l-3.69-3.69A8.085 8.085 0 0112.5 10c3.53 0 6.54 2.21 7.71 5.33l1.93-.64A10.043 10.043 0 0012.5 8z"
                        fill="currentColor"
                      />
                    </svg>
                  </button>
                  <button type="button" className="run-btn">
                    {t('Run')}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M8 5v14l11-7z" fill="currentColor" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="editor-body">
                <div className="line-numbers">
                  {lineNumbers.map((n) => (
                    <span key={n}>{n}</span>
                  ))}
                </div>
                <div className="code-area">
                  <pre className="code-display">
                    <span className="kw">class</span>{' '}
                    <span className="cls">Solution</span>:{'\n'}
                    {'    '}
                    <span className="kw">def</span>{' '}
                    <span className="fn">twoSum</span>(
                    <span className="param">self</span>, nums:{' '}
                    <span className="cls">List</span>[<span className="cls">int</span>], target:{' '}
                    <span className="cls">int</span>){' '}
                    <span className="kw">-&gt;</span>{' '}
                    <span className="cls">List</span>[<span className="cls">int</span>]:{'\n'}
                    {'        '}num_map <span className="kw">=</span> {'{}'}
                    {'\n'}
                    {'        '}
                    <span className="kw">for</span> i, num <span className="kw">in</span>{' '}
                    <span className="cls">enumerate</span>(nums):{'\n'}
                    {'            '}complement <span className="kw">=</span> target{' '}
                    <span className="kw">-</span> num{'\n'}
                    {'            '}
                    <span className="kw">if</span> complement <span className="kw">in</span> num_map:{'\n'}
                    {'                '}
                    <span className="kw">return</span> [num_map[complement], i]{'\n'}
                    {'            '}num_map[num] <span className="kw">=</span> i{'\n'}
                    {'        '}
                    <span className="kw">return</span> []
                  </pre>
                </div>
              </div>
            </div>
          </div>

          <TranscriptPanel messages={transcriptMessages} variant="coding" />
        </InterviewMainBand>
      )}

      {showTransitionLayout && (
        <InterviewMainBand
          variant="techqna"
          transcriptHidden={state.transcriptPanelOpen}
          techqnaClassName="techqna-content--transition-handoff"
        >
          <div className="techqna-sidebar-slot techqna-sidebar-slot--exited" aria-hidden>
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

          <div className="techqna-main-area techqna-main-area--section-transition">
            <div className="techqna-center-cluster">
              <div className="avatar-main-slot">
                <AvatarArea videoRef={videoRef} suppressAutoPlay />
              </div>
              <SectionTransitionCard />
            </div>
          </div>

          <TranscriptPanel messages={transcriptMessages} variant="coding" />
        </InterviewMainBand>
      )}

      {!handoffToWhiteboard && <FloatingParticipants agentVideoSrc={videoRef.current?.src} />}
      {handoffToWhiteboard && <SelfVideoPanel />}

      {showCodingLayout && (
        <video ref={videoRef} className="coding-intro-audio-visual" aria-hidden playsInline muted />
      )}
    </section>
  );
}
