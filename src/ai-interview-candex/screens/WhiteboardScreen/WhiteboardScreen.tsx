import { useRef, useEffect, useCallback, useState } from 'react';
import { InterviewBackground, InterviewMainBand } from '../../components/interview';
import FloatingParticipants from '../../components/FloatingParticipants';
import TranscriptPanel from '../../components/TranscriptPanel';
import { i18nUtils } from '@i18n';
import './whiteboardScreen.module.scss';

const { gettext: t } = i18nUtils;

const SYSTEMS_BODY = t(
  'Design a notification system for a product with 5 different user roles (admin, manager, contributor, reviewer, viewer). How do you decide who gets notified about what, when, and through which channel? Walk me through your framework.',
);

export default function WhiteboardScreen() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [layoutReady, setLayoutReady] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setLayoutReady(true), 80);
    return () => window.clearTimeout(id);
  }, []);

  const initCanvas = useCallback(() => {
    if (canvasRef.current && !canvasRef.current.dataset.init) {
      canvasRef.current.dataset.init = '1';
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const resize = () => {
        const rect = canvas.parentElement!.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
      };
      resize();
      window.addEventListener('resize', resize);

      ctx.strokeStyle = '#A9B0F5';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      let drawing = false;
      canvas.addEventListener('mousedown', (e) => {
        drawing = true;
        ctx.beginPath();
        ctx.moveTo(e.offsetX, e.offsetY);
      });
      canvas.addEventListener('mousemove', (e) => {
        if (!drawing) return;
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();
      });
      canvas.addEventListener('mouseup', () => {
        drawing = false;
      });
      canvas.addEventListener('mouseleave', () => {
        drawing = false;
      });
    }
  }, []);

  useEffect(() => {
    if (layoutReady) initCanvas();
  }, [layoutReady, initCanvas]);

  const transcriptMessages = [
    { text: t('Hi Emily, thank you for joining today. I will be guiding this interview.'), dimmed: true },
    { text: t('Take your time to sketch and talk through your design.'), dimmed: false },
  ];

  return (
    <section className="screen active coding-screen" id="screen-whiteboard">
      <InterviewBackground />

      <InterviewMainBand
        variant="coding"
        codingClassName={`coding-content--intro${layoutReady ? ' coding-content--ready' : ''}`}
      >
        <div className="coding-questions-panel">
          <div className="panel-surface-header">
            <span className="panel-surface-title">{t('Question')}</span>
          </div>
          <div className="coding-questions-body">
            <div className="coding-q-item active">
              <div className="coding-q-header">
                <span className="q-badge">{t('Q1')}</span>
                <h3 className="q-title">{t('Systems thinking')}</h3>
              </div>
              <p className="q-description">{SYSTEMS_BODY}</p>
            </div>
          </div>
        </div>

        <div className="code-editor-panel whiteboard-only-panel">
          <div className="editor-view" style={{ display: 'flex', flex: 1, minHeight: 0 }}>
            <canvas className="whiteboard-canvas" ref={canvasRef} />
          </div>
        </div>

        <TranscriptPanel messages={transcriptMessages} variant="coding" />
      </InterviewMainBand>

      <FloatingParticipants />
    </section>
  );
}
