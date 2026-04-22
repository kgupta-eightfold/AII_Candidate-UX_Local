import type { ReactNode } from 'react';
import classnames from 'classnames';
import './interviewMainBand.module.scss';

/**
 * Main content band below TopBar / above BottomControls.
 * Uses existing layout tokens only — spacing is defined in interview.css.
 *
 * - `coding`: same as `.coding-content` (12px gap; coding round only).
 * - `techqna`: same as `.techqna-content` (24px gap + techqna padding; conversational + tech Q&A).
 */
type InterviewMainBandProps =
  | { variant: 'coding'; children: ReactNode; codingClassName?: string }
  | { variant: 'techqna'; transcriptHidden: boolean; techqnaClassName?: string; children: ReactNode };

export function InterviewMainBand(props: InterviewMainBandProps) {
  if (props.variant === 'techqna') {
    return (
      <div
        className={classnames(
          'techqna-content',
          { 'transcript-hidden': props.transcriptHidden },
          props.techqnaClassName,
        )}
      >
        {props.children}
      </div>
    );
  }
  return (
    <div className={classnames('coding-content', props.codingClassName)}>
      {props.children}
    </div>
  );
}
