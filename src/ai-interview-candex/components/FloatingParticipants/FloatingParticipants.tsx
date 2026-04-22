import { useRef, useEffect, useState } from 'react';
import classnames from 'classnames';
import { i18nUtils } from '@i18n';
import { useInterview } from '../../context/InterviewContext';
import styles from './floatingParticipants.module.scss';

interface FloatingParticipantsProps {
  agentVideoSrc?: string;
}

export default function FloatingParticipants({ agentVideoSrc }: FloatingParticipantsProps) {
  const { cameraStreamRef, cameraStreamVersion } = useInterview();
  const selfVideoRef = useRef<HTMLVideoElement>(null);
  const agentVideoRef = useRef<HTMLVideoElement>(null);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (selfVideoRef.current && cameraStreamRef.current) {
      selfVideoRef.current.srcObject = cameraStreamRef.current;
    }
  }, [cameraStreamRef, cameraStreamVersion]);

  useEffect(() => {
    if (agentVideoRef.current && agentVideoSrc) {
      agentVideoRef.current.src = agentVideoSrc;
      agentVideoRef.current.muted = true;
    }
  }, [agentVideoSrc]);

  return (
    <div className={classnames(styles.floatingParticipants, { [styles.collapsedPanel]: collapsed })}>
      <div className={styles.floatingParticipantsHeader}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <circle cx="5" cy="6" r="2" fill="currentColor" />
          <circle cx="12" cy="6" r="2" fill="currentColor" />
          <circle cx="19" cy="6" r="2" fill="currentColor" />
          <circle cx="5" cy="12" r="2" fill="currentColor" />
          <circle cx="12" cy="12" r="2" fill="currentColor" />
          <circle cx="19" cy="12" r="2" fill="currentColor" />
        </svg>
        <span>{i18nUtils.gettext('Participants')}</span>
        <svg
          className={styles.chevron}
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          onClick={(e) => { e.stopPropagation(); setCollapsed((c) => !c); }}
        >
          <path d="M18 15L12 9L6 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div className={styles.floatingParticipantsGrid}>
        <div className={styles.floatingParticipantTile}>
          <video ref={agentVideoRef} autoPlay playsInline muted />
          <span className={styles.floatingParticipantLabel}>{i18nUtils.gettext('Sophia')}</span>
        </div>
        <div className={styles.floatingParticipantTile}>
          <video ref={selfVideoRef} className={styles.selfCamera} autoPlay playsInline muted />
          <span className={styles.floatingParticipantLabel}>{i18nUtils.gettext('You')}</span>
        </div>
      </div>
    </div>
  );
}
