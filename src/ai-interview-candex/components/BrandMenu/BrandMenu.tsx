import { useState, useRef, useEffect } from 'react';
import classnames from 'classnames';
import { i18nUtils } from '@i18n';
import {
  useInterview,
  type ScreenName,
  type InterviewPhase,
  type EmailVariant,
  SECTION_TRANSITION_TECHQNA,
  SECTION_TRANSITION_CODING,
  SECTION_TRANSITION_WHITEBOARD,
  SECTION_TRANSITION_END_INTERVIEW,
} from '../../context/InterviewContext';
import styles from './brandMenu.module.scss';

interface MenuItem {
  label: string;
  action: () => void;
  active?: boolean;
}

interface MenuCategory {
  label: string;
  icon: React.ReactNode;
  items: MenuItem[];
}

const icons = {
  email: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M22 6l-10 7L2 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  landing: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M3 9h18" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M9 9v12" stroke="currentColor" strokeWidth="1.8"/>
    </svg>
  ),
  interview: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14v-4z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <rect x="3" y="6" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.8"/>
    </svg>
  ),
};

export default function BrandMenu() {
  const { state, dispatch, initCamera } = useInterview();

  const goToTransitionTechQna = () => {
    dispatch({ type: 'HIDE_TRANSITION' });
    dispatch({ type: 'SET_SCREEN', screen: 'conversational' });
    dispatch({ type: 'SET_PHASE', phase: 'promptTechQna' });
    dispatch({ type: 'SHOW_TRANSITION', config: SECTION_TRANSITION_TECHQNA });
    dispatch({ type: 'SET_CONTROLS_MODE', mode: 'expanded' });
    initCamera();
    setOpen(false);
  };

  const goToTransitionCoding = () => {
    dispatch({ type: 'HIDE_TRANSITION' });
    dispatch({ type: 'SET_SCREEN', screen: 'techqna' });
    dispatch({ type: 'SET_PHASE', phase: 'promptCoding' });
    dispatch({ type: 'SHOW_TRANSITION', config: SECTION_TRANSITION_CODING });
    dispatch({ type: 'SET_CONTROLS_MODE', mode: 'expanded' });
    initCamera();
    setOpen(false);
  };

  const goToTransitionWhiteboard = () => {
    dispatch({ type: 'HIDE_TRANSITION' });
    dispatch({ type: 'SET_SCREEN', screen: 'coding' });
    dispatch({ type: 'SET_PHASE', phase: 'promptWhiteboard' });
    dispatch({ type: 'SHOW_TRANSITION', config: SECTION_TRANSITION_WHITEBOARD });
    dispatch({ type: 'SET_CONTROLS_MODE', mode: 'expanded' });
    initCamera();
    setOpen(false);
  };

  const goToEndInterview = () => {
    dispatch({ type: 'HIDE_TRANSITION' });
    dispatch({ type: 'SET_SCREEN', screen: 'endInterview' });
    dispatch({ type: 'SET_PHASE', phase: 'ended' });
    dispatch({ type: 'SHOW_TRANSITION', config: SECTION_TRANSITION_END_INTERVIEW });
    dispatch({ type: 'SET_CONTROLS_MODE', mode: 'expanded' });
    initCamera();
    setOpen(false);
  };
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const navigateTo = (screen: ScreenName, phase?: InterviewPhase, controlsMode?: 'expanded' | 'collapsed' | 'hidden') => {
    dispatch({ type: 'HIDE_TRANSITION' });
    dispatch({ type: 'SET_SCREEN', screen });
    if (phase) dispatch({ type: 'SET_PHASE', phase });
    dispatch({ type: 'SET_CONTROLS_MODE', mode: controlsMode ?? 'hidden' });
    if (
      screen === 'conversational' ||
      screen === 'techqna' ||
      screen === 'coding' ||
      screen === 'whiteboard' ||
      screen === 'endInterview'
    ) {
      initCamera();
    }
    setOpen(false);
  };

  const setEmailView = (variant: EmailVariant) => {
    dispatch({ type: 'SET_EMAIL_VARIANT', variant });
    navigateTo('email');
  };

  /** Handoff previews: only these rows should be active -- not the matching Interview page row. */
  const isTransitionToTechQna =
    state.transitionModal != null &&
    state.screen === 'conversational' &&
    state.phase === 'promptTechQna';
  const isTransitionToCoding =
    state.transitionModal != null &&
    state.screen === 'techqna' &&
    state.phase === 'promptCoding';
  const isTransitionToWhiteboard =
    state.transitionModal != null &&
    state.screen === 'coding' &&
    state.phase === 'promptWhiteboard';

  const categories: MenuCategory[] = [
    {
      label: i18nUtils.gettext('Emails'),
      icon: icons.email,
      items: [
        { label: i18nUtils.gettext('Interview only'), action: () => setEmailView('interview'), active: state.screen === 'email' && state.emailVariant === 'interview' },
        { label: i18nUtils.gettext('Interview + Assessment'), action: () => setEmailView('combined'), active: state.screen === 'email' && state.emailVariant === 'combined' },
        { label: i18nUtils.gettext('Assessment only'), action: () => setEmailView('assessment'), active: state.screen === 'email' && state.emailVariant === 'assessment' },
      ],
    },
    {
      label: i18nUtils.gettext('Start/End pages'),
      icon: icons.landing,
      items: [
        { label: i18nUtils.gettext('Interview landing page'), action: () => navigateTo('landing'), active: state.screen === 'landing' },
        {
          label: i18nUtils.gettext('Feedback form page'),
          action: () => navigateTo('feedbackForm', 'ended', 'hidden'),
          active: state.screen === 'feedbackForm',
        },
      ],
    },
    {
      label: i18nUtils.gettext('Interview pages'),
      icon: icons.interview,
      items: [
        {
          label: i18nUtils.gettext('Conversational'),
          action: () => navigateTo('conversational', 'intro', 'expanded'),
          active: state.screen === 'conversational' && !isTransitionToTechQna,
        },
        {
          label: i18nUtils.gettext('Q&A'),
          action: () => navigateTo('techqna', 'techQnaIntro', 'expanded'),
          active: state.screen === 'techqna' && !isTransitionToCoding,
        },
        {
          label: i18nUtils.gettext('Coding'),
          action: () => navigateTo('coding', 'codingIntro', 'collapsed'),
          active: state.screen === 'coding' && !isTransitionToWhiteboard,
        },
        {
          label: i18nUtils.gettext('Whiteboard'),
          action: () => navigateTo('whiteboard', 'whiteboardActive', 'collapsed'),
          active: state.screen === 'whiteboard',
        },
        { label: i18nUtils.gettext('Break'), action: () => navigateTo('break'), active: state.screen === 'break' },
      ],
    },
    {
      label: i18nUtils.gettext('Transition screens'),
      icon: icons.interview,
      items: [
        {
          label: i18nUtils.gettext('For techqna'),
          action: goToTransitionTechQna,
          active: isTransitionToTechQna,
        },
        {
          label: i18nUtils.gettext('For coding'),
          action: goToTransitionCoding,
          active: isTransitionToCoding,
        },
        {
          label: i18nUtils.gettext('For whiteboard'),
          action: goToTransitionWhiteboard,
          active: isTransitionToWhiteboard,
        },
        {
          label: i18nUtils.gettext('For end interview'),
          action: goToEndInterview,
          active: state.screen === 'endInterview',
        },
      ],
    },
  ];

  return (
    <div ref={menuRef} className={styles.viewSwitcher}>
      <button className={styles.viewSwitcherBtn} onClick={() => setOpen(!open)}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M3 6h18M3 12h18M3 18h18" stroke="#343C4C" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>

      {open && (
        <div className={styles.viewSwitcherDropdown}>
          <div className={styles.viewSwitcherHeader}>
            <span className={styles.viewSwitcherTitle}>{i18nUtils.gettext('Jump to screen')}</span>
          </div>
          {categories.map((cat) => (
            <div key={cat.label} className={styles.viewSwitcherSection}>
              <div className={styles.viewSwitcherCategory}>
                <span className={styles.viewSwitcherCategoryIcon}>{cat.icon}</span>
                <span>{cat.label}</span>
              </div>
              {cat.items.map((item) => (
                <button
                  key={item.label}
                  className={classnames(styles.viewSwitcherItem, {
                    [styles.viewSwitcherItemActive]: item.active,
                  })}
                  onClick={item.action}
                >
                  <span className={styles.viewSwitcherItemDot} />
                  <span>{item.label}</span>
                  {item.active && (
                    <svg className={styles.viewSwitcherCheck} width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M5 12l5 5L20 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
