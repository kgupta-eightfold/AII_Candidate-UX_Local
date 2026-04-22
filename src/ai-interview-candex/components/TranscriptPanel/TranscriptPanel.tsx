import { useState, useEffect } from 'react';
import classnames from 'classnames';
import { i18nUtils } from '@i18n';
import { useInterview } from '../../context/InterviewContext';
import styles from './transcriptPanel.module.scss';

/** Served from `public/olivia-avatar.png` */
const TRANSCRIPT_AI_AVATAR_SRC = `${import.meta.env.BASE_URL}olivia-avatar.png`;

interface TranscriptPanelProps {
  messages?: { text: string; dimmed?: boolean }[];
  variant?: 'side' | 'coding';
}

export default function TranscriptPanel({ messages = [], variant = 'side' }: TranscriptPanelProps) {
  const { state, dispatch } = useInterview();
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!state.transcriptPanelOpen) setExpanded(false);
  }, [state.transcriptPanelOpen]);

  if (variant === 'coding') {
    return (
      <div className={classnames(
        styles.transcriptPanel,
        { [styles.open]: state.transcriptPanelOpen },
        { [styles.expanded]: expanded },
      )}>
        {/* Drag handle — visible on mobile only, taps toggle expanded state */}
        <div
          className={styles.sheetHandle}
          onClick={() => setExpanded(e => !e)}
          role="button"
          aria-label={expanded ? i18nUtils.gettext('Collapse transcript') : i18nUtils.gettext('Expand transcript')}
        />
        <div className="panel-surface-header">
          <span className="panel-surface-title">{i18nUtils.gettext('Interviewer transcript')}</span>
          <div className="panel-header-actions">
            <button
              className="toolbar-icon-btn small"
              onClick={() => { dispatch({ type: 'CLOSE_TRANSCRIPT_PANEL' }); setExpanded(false); }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
        <div className={styles.transcriptMessages}>
          {messages.map((msg, i) => (
            <div className={styles.transcriptMsg} key={i}>
              <img
                className={styles.msgAvatar}
                src={TRANSCRIPT_AI_AVATAR_SRC}
                alt=""
                width={32}
                height={32}
                decoding="async"
              />
              <p className={classnames(styles.msgText, { [styles.dimmedText]: msg.dimmed })}>{msg.text}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
}
