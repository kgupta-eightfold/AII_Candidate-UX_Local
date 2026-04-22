import { useEffect, useRef, useCallback, Fragment } from 'react';
import classnames from 'classnames';
import { i18nUtils } from '@i18n';
import {
  useInterview,
  SECTION_TRANSITION_WHITEBOARD,
  SECTION_TRANSITION_END_INTERVIEW,
} from '../../context/InterviewContext';
import { mdiMicrophone, mdiVideo, mdiClosedCaption, mdiPhoneHangup, mdiViewGrid, mdiChevronDown } from '@mdi/js';
import {
  Button, ButtonShape, ButtonSize, ButtonVariant, IconName, Icon, IconSize,
  Dropdown, Menu, MenuItemType, MenuSize,
} from '@eightfold.ai/octuple';
import DeviceMenuPopup from '../DeviceMenuPopup';
import styles from './bottomControls.module.scss';

export default function BottomControls() {
  const { state, dispatch } = useInterview();
  const inactivityRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isInterviewScreen =
    state.screen === 'conversational' ||
    state.screen === 'techqna' ||
    state.screen === 'coding' ||
    state.screen === 'whiteboard' ||
    state.screen === 'endInterview';

  const isCodingLike = state.screen === 'coding' || state.screen === 'whiteboard';
  const transitionHandoffActive = state.transitionModal != null;

  const showSubmitInsteadOfFocus =
    isCodingLike &&
    state.controlsMode === 'collapsed' &&
    !transitionHandoffActive &&
    ((state.screen === 'coding' &&
      (state.phase === 'codingActive' || state.phase === 'codingIntro')) ||
      (state.screen === 'whiteboard' && state.phase === 'whiteboardActive'));

  const clearInactivity = useCallback(() => {
    if (inactivityRef.current) {
      clearTimeout(inactivityRef.current);
      inactivityRef.current = null;
    }
  }, []);

  const startInactivity = useCallback(() => {
    clearInactivity();
    inactivityRef.current = setTimeout(() => {
      if (isCodingLike) {
        dispatch({ type: 'SET_CONTROLS_MODE', mode: 'collapsed' });
      } else {
        dispatch({ type: 'SET_CONTROLS_MODE', mode: 'dimmed' });
      }
    }, 5000);
  }, [clearInactivity, dispatch, isCodingLike]);

  useEffect(() => {
    if (!isInterviewScreen) return;
    const reset = () => {
      if (state.controlsMode === 'expanded' || state.controlsMode === 'dimmed') {
        startInactivity();
      }
    };
    document.addEventListener('mousemove', reset);
    document.addEventListener('keydown', reset);
    startInactivity();
    return () => {
      document.removeEventListener('mousemove', reset);
      document.removeEventListener('keydown', reset);
      clearInactivity();
    };
  }, [isInterviewScreen, state.controlsMode, startInactivity, clearInactivity]);

  if (!isInterviewScreen || state.controlsMode === 'hidden') return null;

  const expand = () => {
    dispatch({ type: 'SET_CONTROLS_MODE', mode: 'expanded' });
    clearInactivity();
  };

  const handleTranscriptClick = () => {
    if (transitionHandoffActive) return;
    dispatch({ type: 'TOGGLE_TRANSCRIPT_PANEL' });
  };

  const handleSubmitCoding = (e: React.MouseEvent) => {
    e.stopPropagation();
    clearInactivity();
    dispatch({ type: 'SET_PHASE', phase: 'promptWhiteboard' });
    dispatch({ type: 'SHOW_TRANSITION', config: SECTION_TRANSITION_WHITEBOARD });
    dispatch({ type: 'SET_CONTROLS_MODE', mode: 'hidden' });
  };

  const handleSubmitWhiteboard = (e: React.MouseEvent) => {
    e.stopPropagation();
    clearInactivity();
    dispatch({ type: 'SET_PHASE', phase: 'ended' });
    dispatch({ type: 'SET_SCREEN', screen: 'endInterview' });
    dispatch({ type: 'SHOW_TRANSITION', config: SECTION_TRANSITION_END_INTERVIEW });
    dispatch({ type: 'SET_CONTROLS_MODE', mode: 'expanded' });
  };

  const modeClass = state.controlsMode;

  return (
    <Fragment>
      {/* Troubleshoot issues button - bottom left */}
      <button className={styles.troubleshootBtn}>
        <span>{i18nUtils.gettext('Troubleshoot issues')}</span>
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
          <path d="M7.41 8.58L12 13.17l4.59-4.59L18 10l-6 6-6-6 1.41-1.42z" />
        </svg>
      </button>

      <div className={classnames(styles.bottomControls, modeClass)}>
        {/* Expanded bar */}
        <div
          className={classnames(styles.controlsBar, styles.expandedBar)}
          onMouseEnter={() => { expand(); }}
          onMouseLeave={() => startInactivity()}
        >
          {/* Group 1: Mic + Video split buttons */}
          <div className={classnames(styles.ctlGroup, styles.ctlGroupTight)}>
            <DeviceMenuPopup type="audio">
              <button className="ctl-split-btn" aria-label="Microphone options">
                <span className="ctl-split-icon">
                  <Icon path={mdiMicrophone as IconName} size={IconSize.Medium} />
                </span>
                <span className="ctl-split-chevron">
                  <Icon path={mdiChevronDown as IconName} size={IconSize.Medium} />
                </span>
              </button>
            </DeviceMenuPopup>
            <DeviceMenuPopup type="video">
              <button className="ctl-split-btn" aria-label="Camera options">
                <span className="ctl-split-icon">
                  <Icon path={mdiVideo as IconName} size={IconSize.Medium} />
                </span>
                <span className="ctl-split-chevron">
                  <Icon path={mdiChevronDown as IconName} size={IconSize.Medium} />
                </span>
              </button>
            </DeviceMenuPopup>
          </div>

          <div className={styles.ctlDivider} />

          {/* View change + CC / Transcript */}
          <div className={classnames(styles.ctlGroup, styles.ctlGroupTight)}>
            <Dropdown
              overlay={
                <Menu
                  classNames="ctl-dropdown-menu"
                  size={MenuSize.small}
                  items={[
                    { text: i18nUtils.gettext('Grid view'), value: 'grid', type: MenuItemType.button },
                    { text: i18nUtils.gettext('Speaker view'), value: 'speaker', type: MenuItemType.button },
                  ]}
                />
              }
              placement="top-start"
              offset={8}
              portal
            >
              <button className="ctl-split-btn" aria-label="View options">
                <span className="ctl-split-icon">
                  <Icon path={mdiViewGrid as IconName} size={IconSize.Medium} />
                </span>
                <span className="ctl-split-chevron">
                  <Icon path={mdiChevronDown as IconName} size={IconSize.Medium} />
                </span>
              </button>
            </Dropdown>
            <Button
              ariaLabel="Toggle captions"
              classNames="ctl-btn-blue"
              disabled={transitionHandoffActive}
              iconProps={{ path: mdiClosedCaption as IconName }}
              onClick={handleTranscriptClick}
              shape={ButtonShape.Round}
              size={ButtonSize.Medium}
              variant={ButtonVariant.Secondary}
            />
          </div>

          <div className={styles.ctlDivider} />

          {/* Hangup */}
          <Button
            ariaLabel="End interview"
            classNames="ctl-btn-red"
            disruptive
            iconProps={{ path: mdiPhoneHangup as IconName }}
            shape={ButtonShape.Round}
            size={ButtonSize.Medium}
            variant={ButtonVariant.Secondary}
          />
        </div>

        {/* Collapsed bar */}
        <div className={classnames(styles.controlsBar, styles.collapsedBar)}>
          <div
            className={styles.collapsedControlsSection}
            onClick={expand}
            onMouseEnter={expand}
          >
            <svg className={styles.collapsedChevron} width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M18 15L12 9L6 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className={styles.collapsedLabel}>{i18nUtils.gettext('Interview controls')}</span>
          </div>
          <div className={styles.collapsedDivider} />
          {showSubmitInsteadOfFocus ? (
            <button
              type="button"
              className={styles.collapsedSubmitBtn}
              onClick={state.screen === 'whiteboard' ? handleSubmitWhiteboard : handleSubmitCoding}
            >
              {i18nUtils.gettext('Submit')}
            </button>
          ) : (
            <button type="button" className={styles.focusModeBtn}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3,13.5A0.5,0.5 0 0,0 2.5,14A0.5,0.5 0 0,0 3,14.5A0.5,0.5 0 0,0 3.5,14A0.5,0.5 0 0,0 3,13.5M6,17A1,1 0 0,0 5,18A1,1 0 0,0 6,19A1,1 0 0,0 7,18A1,1 0 0,0 6,17M10,20.5A0.5,0.5 0 0,0 9.5,21A0.5,0.5 0 0,0 10,21.5A0.5,0.5 0 0,0 10.5,21A0.5,0.5 0 0,0 10,20.5" />
              </svg>
              <span>{i18nUtils.gettext('Focus mode')}</span>
            </button>
          )}
        </div>
      </div>
    </Fragment>
  );
}
