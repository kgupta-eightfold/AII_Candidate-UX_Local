import { useRef, useEffect, useState } from 'react';
import classnames from 'classnames';
import { i18nUtils } from '@i18n';
import { useInterview } from '../../context/InterviewContext';
import styles from './selfVideoPanel.module.scss';

export default function SelfVideoPanel() {
  const { cameraStreamRef, cameraStreamVersion } = useInterview();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (videoRef.current && cameraStreamRef.current) {
      videoRef.current.srcObject = cameraStreamRef.current;
    }
  }, [cameraStreamRef, cameraStreamVersion]);

  return (
    <div className={classnames(styles.selfVideoPanel, { [styles.collapsedPanel]: collapsed })}>
      <div className={styles.selfVideoHeader}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <circle cx="5" cy="6" r="2" fill="currentColor" />
          <circle cx="12" cy="6" r="2" fill="currentColor" />
          <circle cx="19" cy="6" r="2" fill="currentColor" />
          <circle cx="5" cy="12" r="2" fill="currentColor" />
          <circle cx="12" cy="12" r="2" fill="currentColor" />
          <circle cx="19" cy="12" r="2" fill="currentColor" />
        </svg>
        <span>{i18nUtils.gettext('You')}</span>
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
      <div className={styles.selfVideoFeed}>
        <video ref={videoRef} className={styles.selfCamera} autoPlay playsInline muted />
      </div>
    </div>
  );
}
