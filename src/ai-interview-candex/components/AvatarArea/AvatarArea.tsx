import { useRef, useEffect, useLayoutEffect } from 'react';
import classnames from 'classnames';
import { videoUrl } from '../../context/InterviewContext';
import styles from './avatarArea.module.scss';

interface AvatarAreaProps {
  /**
   * When set to a filename (e.g. from `VIDEOS`), AvatarArea loads/plays/cleans up that asset.
   * When **omitted** (`undefined`), the parent owns `video.src` on `videoRef` — AvatarArea must not clear it
   * (Tech Q&A, Coding, Conversational).
   * Pass **`''`** to explicitly tear down the element (e.g. end-interview exit).
   */
  videoSrc?: string;
  videoRef?: React.RefObject<HTMLVideoElement | null>;
  name?: string;
  onVideoEnd?: () => void;
  /** When true, no autoplay (section handoff / paused last frame — parent sets src + pause). */
  suppressAutoPlay?: boolean;
}

export default function AvatarArea({
  videoSrc,
  videoRef: externalRef,
  name = 'Sophia',
  onVideoEnd,
  suppressAutoPlay = false,
}: AvatarAreaProps) {
  const internalRef = useRef<HTMLVideoElement>(null);
  const ref = externalRef || internalRef;

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    // Parent-managed source (ref only) — do not touch src; TechQnA / Coding set it on videoRef.
    if (videoSrc === undefined) {
      return;
    }

    // Explicit teardown when parent passes "" (e.g. end interview while exiting layer still mounted).
    if (videoSrc === '') {
      video.pause();
      video.removeAttribute('src');
      video.load();
      return;
    }

    video.src = videoUrl(videoSrc);
    video.load();
    if (!suppressAutoPlay) {
      video.play().catch(() => {
        const resume = () => {
          video.play();
          document.removeEventListener('click', resume);
        };
        document.addEventListener('click', resume);
      });
    }

    const handleEnded = () => {
      video.removeEventListener('ended', handleEnded);
      onVideoEnd?.();
    };
    if (onVideoEnd) video.addEventListener('ended', handleEnded);

    return () => {
      if (onVideoEnd) video.removeEventListener('ended', handleEnded);
      video.pause();
      video.removeAttribute('src');
      video.load();
    };
  }, [videoSrc, ref, onVideoEnd, suppressAutoPlay]);

  /** Block any playback while showing a paused handoff frame (parent sets src + seek + pause). */
  useLayoutEffect(() => {
    if (!suppressAutoPlay) return;
    const video = ref.current;
    if (!video) return;
    const stop = () => {
      video.pause();
    };
    video.addEventListener('play', stop);
    video.addEventListener('playing', stop);
    stop();
    return () => {
      video.removeEventListener('play', stop);
      video.removeEventListener('playing', stop);
    };
  }, [suppressAutoPlay, ref]);

  return (
    <div className={styles.avatarArea}>
      <div className={styles.avatarContainer}>
        <div className={styles.avatarRings}>
          <div className={classnames(styles.ring, styles.ringOuter)} />
          <div className={classnames(styles.ring, styles.ringMiddle)} />
          <div className={classnames(styles.ring, styles.ringInner)} />
        </div>
        <div className={styles.avatarCircle}>
          <video
            ref={ref}
            playsInline
            muted={suppressAutoPlay}
            {...(suppressAutoPlay ? {} : { autoPlay: true })}
          />
        </div>
      </div>
      <div className={styles.avatarNameTag}>
        <div className={styles.waveform}>
          <span className={styles.waveBar} />
          <span className={styles.waveBar} />
          <span className={styles.waveBar} />
          <span className={styles.waveBar} />
        </div>
        <span className={styles.avatarName}>{name}</span>
      </div>
    </div>
  );
}
