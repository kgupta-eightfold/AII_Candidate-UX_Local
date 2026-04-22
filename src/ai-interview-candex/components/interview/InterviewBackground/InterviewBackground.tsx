import classnames from 'classnames';
import styles from './interviewBackground.module.scss';

/**
 * Shared blurred backdrop for conversational / tech Q&A / coding interview screens.
 */
export function InterviewBackground() {
  return (
    <div className={styles.bgBase}>
      <div className={classnames(styles.bgBlur, styles.bgBlurBlue)} />
      <div className={classnames(styles.bgBlur, styles.bgBlurPurple)} />
    </div>
  );
}
