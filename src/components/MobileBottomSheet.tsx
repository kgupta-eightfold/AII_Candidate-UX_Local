import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { mdiChevronDown } from '@mdi/js';
import { Button, ButtonSize, ButtonVariant, IconName } from '@eightfold.ai/octuple';
import { useInterview } from '../context/InterviewContext';
import TextSizePopup, { type TextSize } from './TextSizePopup';

const AVATAR_SRC = '/olivia-avatar.png';

interface MobileBottomSheetProps {
  messages?: { text: string; dimmed?: boolean }[];
}

/**
 * Mobile-only transcript panel (see interview.css). Opens when transcriptPanelOpen is true.
 * Ephemeral overlay — full-bleed bottom sheet (z-index over mob-controls-bar), same stacking as modal.
 */
export default function MobileBottomSheet({
  messages = [],
}: MobileBottomSheetProps) {
  const { state, dispatch } = useInterview();

  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [textSize, setTextSize] = useState<TextSize>('medium');
  const [showGoToLatest, setShowGoToLatest] = useState(false);
  const messagesRef = useRef<HTMLDivElement>(null);
  const touchStartYRef = useRef<number | null>(null);

  useEffect(() => {
    if (state.transcriptPanelOpen) {
      setOpen(true);
    } else {
      setOpen(false);
      setExpanded(false);
    }
  }, [state.transcriptPanelOpen]);

  const close = useCallback(() => {
    setOpen(false);
    setExpanded(false);
    dispatch({ type: 'CLOSE_TRANSCRIPT_PANEL' });
  }, [dispatch]);

  useEffect(() => {
    const el = messagesRef.current;
    if (!el) return;
    const onScroll = () => {
      setShowGoToLatest(el.scrollHeight - el.scrollTop - el.clientHeight > 80);
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [open, textSize]);

  const scrollToLatest = () => {
    const el = messagesRef.current;
    if (el) el.scrollTop = el.scrollHeight;
    setShowGoToLatest(false);
  };

  const onHandleTouchStart = (e: React.TouchEvent) => {
    touchStartYRef.current = e.touches[0].clientY;
  };
  const onHandleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartYRef.current === null) return;
    const delta = touchStartYRef.current - e.changedTouches[0].clientY;
    if (delta > 50) setExpanded(true);
    else if (delta < -50) {
      if (expanded) setExpanded(false);
      else close();
    }
    touchStartYRef.current = null;
  };

  if (!open) return null;

  return createPortal(
    <div className={`mbs-wrap${expanded ? ' mbs-expanded' : ''}`}>
      <div className="mbs-sheet">
        <div
          className="mbs-handle-row"
          onClick={() => setExpanded(e => !e)}
          onTouchStart={onHandleTouchStart}
          onTouchEnd={onHandleTouchEnd}
          role="button"
          aria-label={expanded ? 'Collapse panel' : 'Expand panel'}
          tabIndex={0}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setExpanded(ex => !ex); }}
        >
          <div className="mbs-handle-pill" />
        </div>

        <div className="mbs-header">
          <span className="mbs-title">Interviewer transcript</span>
          <div className="mbs-header-actions">
            <TextSizePopup value={textSize} onChange={setTextSize}>
              <button type="button" className="mbs-ts-trigger" aria-label="Text size">
                <span className="mbs-ts-tt" aria-hidden>
                  Tt
                </span>
                <svg className="mbs-ts-chevron" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path
                    d="M6 9l6 6 6-6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </TextSizePopup>
            <button className="mbs-close" onClick={close} aria-label="Close panel">
              <svg className="mbs-close-icon" viewBox="0 0 24 24" fill="none">
                <path
                  d="M18 6L6 18M6 6l12 12"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        </div>

        <div
          className={`mbs-body mbs-body--transcript transcript-messages transcript-messages--${textSize}`}
          ref={messagesRef}
        >
          {messages.map((msg, i) => (
            <div className="transcript-msg" key={i}>
              <img
                className="msg-avatar"
                src={AVATAR_SRC}
                alt=""
                width={32}
                height={32}
                decoding="async"
              />
              <p className={`msg-text${msg.dimmed ? ' dimmed-text' : ''}`}>{msg.text}</p>
            </div>
          ))}
        </div>

        {showGoToLatest && (
          <div className="mbs-go-latest">
            <Button
              ariaLabel="Go to latest"
              text="Go to latest"
              iconProps={{ path: mdiChevronDown as IconName }}
              size={ButtonSize.Medium}
              variant={ButtonVariant.Primary}
              onClick={scrollToLatest}
            />
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
