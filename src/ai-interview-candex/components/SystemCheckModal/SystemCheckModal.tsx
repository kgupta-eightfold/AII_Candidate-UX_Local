import { useState, useEffect, useRef, useCallback } from 'react';
import classnames from 'classnames';
import { i18nUtils } from '@i18n';
import { useInterview } from '../../context/InterviewContext';
import { mdiMicrophone, mdiVideo, mdiChevronDown } from '@mdi/js';
import DeviceMenuPopup from '../DeviceMenuPopup';
import styles from './systemCheckModal.module.scss';

const mdiCheckCircleOutline = "M12 2C6.5 2 2 6.5 2 12S6.5 22 12 22 22 17.5 22 12 17.5 2 12 2M12 20C7.59 20 4 16.41 4 12S7.59 4 12 4 20 7.59 20 12 16.41 20 12 20M16.59 7.58L10 14.17L7.41 11.59L6 13L10 17L18 9L16.59 7.58Z";
const mdiProgressHelper = "M13 2V4C17.39 4.54 20.5 8.53 19.96 12.92C19.5 16.56 16.64 19.43 13 19.88V21.88C18.5 21.28 22.45 16.34 21.85 10.85C21.33 6.19 17.66 2.5 13 2M11 2C9.04 2.18 7.19 2.95 5.67 4.2L7.1 5.74C8.22 4.84 9.57 4.26 11 4.06V2M4.26 5.67C3 7.19 2.24 9.04 2.05 11H4.05C4.24 9.58 4.8 8.23 5.69 7.1L4.26 5.67M2.06 13C2.26 14.96 3.03 16.81 4.27 18.33L5.69 16.9C4.81 15.77 4.24 14.42 4.06 13H2.06M7.06 18.37L5.67 19.74C7.18 21 9.04 21.79 11 22V20C9.58 19.82 8.23 19.25 7.1 18.37H7.06Z";
const mdiRobot = "M12,2A2,2 0 0,1 14,4C14,4.74 13.6,5.39 13,5.73V7H14A7,7 0 0,1 21,14H22A1,1 0 0,1 23,15V18A1,1 0 0,1 22,19H21V20A2,2 0 0,1 19,22H5A2,2 0 0,1 3,20V19H2A1,1 0 0,1 1,18V15A1,1 0 0,1 2,14H3A7,7 0 0,1 10,7H11V5.73C10.4,5.39 10,4.74 10,4A2,2 0 0,1 12,2M7.5,13A2.5,2.5 0 0,0 5,15.5A2.5,2.5 0 0,0 7.5,18A2.5,2.5 0 0,0 10,15.5A2.5,2.5 0 0,0 7.5,13M16.5,13A2.5,2.5 0 0,0 14,15.5A2.5,2.5 0 0,0 16.5,18A2.5,2.5 0 0,0 19,15.5A2.5,2.5 0 0,0 16.5,13Z";
const mdiMicrophoneOff = "M19,11C19,12.19 18.66,13.3 18.1,14.28L16.87,13.05C17.14,12.43 17.3,11.74 17.3,11H19M15,11.16L9,5.18V5A3,3 0 0,1 12,2A3,3 0 0,1 15,5V11L15,11.16M4.27,3L21,19.73L19.73,21L15.54,16.81C14.77,17.27 13.91,17.58 13,17.72V21H11V17.72C7.72,17.23 5,14.41 5,11H6.7C6.7,14 9.24,16.1 12,16.1C12.81,16.1 13.6,15.91 14.31,15.58L12.65,13.92L12,14A3,3 0 0,1 9,11V10.28L3,4.27L4.27,3Z";
const mdiVideoOff = "M3.27,2L2,3.27L4.73,6H4A1,1 0 0,0 3,7V17A1,1 0 0,0 4,18H16C16.2,18 16.39,17.92 16.54,17.82L19.73,21L21,19.73M21,6.5L17,10.5V7A1,1 0 0,0 16,6H9.82L21,17.18V6.5Z";

type Step = 'systemCheck' | 'consent' | 'verify';
const STEPS: { key: Step; label: string }[] = [
  { key: 'systemCheck', label: i18nUtils.gettext('System check') },
  { key: 'consent', label: i18nUtils.gettext('Consent to record') },
  { key: 'verify', label: i18nUtils.gettext('Verify identity') },
];

const AGENT_CHECKS = [
  i18nUtils.gettext('Checking network...'),
  i18nUtils.gettext('Running firewall test...'),
  i18nUtils.gettext('Verifying connection...'),
];

interface SystemCheckModalProps {
  open: boolean;
  onClose: () => void;
}

export default function SystemCheckModal({ open, onClose }: SystemCheckModalProps) {
  const { dispatch, initCamera } = useInterview();
  const [step, setStep] = useState<Step>('systemCheck');

  // Permissions
  const [permGranted, setPermGranted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Agent check
  const [agentStatus, setAgentStatus] = useState<'idle' | 'running' | 'done'>('idle');
  const [agentText, setAgentText] = useState('');
  const agentStartedRef = useRef(false);

  // Consent
  const [agreed, setAgreed] = useState(true);

  // Verify
  const [verified, setVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  // Reset on close
  useEffect(() => {
    if (!open) {
      setStep('systemCheck');
      setPermGranted(false);
      setAgentStatus('idle');
      setAgentText('');
      setAgreed(true);
      setVerified(false);
      setVerifying(false);
      agentStartedRef.current = false;
      stopStream();
    }
  }, [open, stopStream]);

  // Request permissions on open
  useEffect(() => {
    if (!open || step !== 'systemCheck') return;
    let cancelled = false;

    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }
        streamRef.current = stream;
        setPermGranted(true);
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch {
        if (!cancelled) setPermGranted(false);
      }
    })();

    return () => { cancelled = true; };
  }, [open, step]);

  // Attach stream when videoRef is ready
  useEffect(() => {
    if (permGranted && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [permGranted]);

  // Run agent checks after permissions granted
  useEffect(() => {
    if (!permGranted || agentStartedRef.current) return;
    agentStartedRef.current = true;
    setAgentStatus('running');
    setAgentText(AGENT_CHECKS[0]);

    let idx = 0;
    const interval = setInterval(() => {
      idx++;
      if (idx >= AGENT_CHECKS.length) {
        clearInterval(interval);
        setTimeout(() => {
          setAgentText('');
          setAgentStatus('done');
        }, 800);
      } else {
        setAgentText(AGENT_CHECKS[idx]);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [permGranted]);

  const stepIndex = STEPS.findIndex((s) => s.key === step);

  const canNext =
    (step === 'systemCheck' && agentStatus === 'done') ||
    (step === 'consent' && agreed) ||
    (step === 'verify' && verified);

  const handleNext = () => {
    if (step === 'systemCheck') setStep('consent');
    else if (step === 'consent') setStep('verify');
    else if (step === 'verify' && verified) handleJoin();
  };

  const handleVerify = () => {
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      setVerified(true);
    }, 1500);
  };

  const handleJoin = () => {
    stopStream();
    onClose();
    initCamera();
    dispatch({ type: 'SET_PHASE', phase: 'intro' });
    dispatch({ type: 'SET_SCREEN', screen: 'conversational' });
    dispatch({ type: 'SET_CONTROLS_MODE', mode: 'expanded' });
  };

  if (!open) return null;

  return (
    <div className={styles.scOverlay} onClick={onClose}>
      <div className={styles.scModal} onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className={styles.scHeader}>
          <span className={styles.scHeaderTitle}>{i18nUtils.gettext('Join interview')}</span>
        </div>

        {/* Body: stepper + content */}
        <div className={styles.scBody}>

          {/* Left stepper */}
          <div className={styles.scStepper}>
            <ul className={styles.scStepperSteps}>
              {STEPS.map((s, i) => {
                const allDone = step === 'verify' && verified;
                const activeIndex = allDone ? STEPS.length : stepIndex;
                const isDone = i < activeIndex;
                const isActive = i === activeIndex;
                return (
                  <li key={s.key} className={styles.scStepperStep}>
                    {i > 0 && (
                      <div className={classnames(styles.scStepperSeparator, {
                        [styles.scStepperSeparatorDone]: isDone || isActive,
                      })} />
                    )}
                    <div className={styles.scStepperContent}>
                      <div className={classnames(styles.scStepperCircle, {
                        [styles.scStepperCircleDone]: isDone,
                        [styles.scStepperCircleActive]: isActive,
                      })}>
                        {isDone ? (
                          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                          </svg>
                        ) : (
                          <span>{i + 1}</span>
                        )}
                      </div>
                      <div className={classnames(styles.scStepperLabel, {
                        [styles.scStepperLabelActive]: isDone || isActive,
                      })}>
                        {s.label}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Right content card */}
          <div className={styles.scContent}>

            {/* ---- System Check ---- */}
            {step === 'systemCheck' && (
              <>
                {/* Browser permissions section */}
                <div className={styles.scSection}>
                  <div className={styles.scSectionHeader}>
                    {permGranted ? (
                      <svg viewBox="0 0 24 24" width="24" height="24" fill="#8CE1CA" className={styles.scSectionIcon}>
                        <path d={mdiCheckCircleOutline} />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" width="24" height="24" fill="#FFCD78" className={classnames(styles.scSectionIcon, styles.scSectionIconSpin)}>
                        <path d={mdiProgressHelper} />
                      </svg>
                    )}
                    <span className={styles.scSectionTitle}>{i18nUtils.gettext('Browser permissions')}</span>
                  </div>

                  <div className={styles.scCameraPreview}>
                    <video ref={videoRef} autoPlay playsInline muted className={styles.scCameraVideo} />
                    {!permGranted && (
                      <div className={styles.scCameraPlaceholder}>
                        <span className={styles.scCameraPlaceholderText}>
                          {i18nUtils.gettext('Please provide access to camera and microphone.')}
                        </span>
                        <div className={styles.scPlaceholderIcons}>
                          <button className={styles.scPlaceholderIcon} disabled aria-label="Microphone off">
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="#6C2222">
                              <path d={mdiMicrophoneOff} />
                            </svg>
                          </button>
                          <button className={styles.scPlaceholderIcon} disabled aria-label="Camera off">
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="#6C2222">
                              <path d={mdiVideoOff} />
                            </svg>
                          </button>
                        </div>
                      </div>
                    )}
                    {permGranted && (
                      <div className={styles.scDeviceControls}>
                        <DeviceMenuPopup type="audio">
                          <button className="ctl-split-btn" aria-label="Microphone options">
                            <span className="ctl-split-icon">
                              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                                <path d={mdiMicrophone} />
                              </svg>
                            </span>
                            <span className="ctl-split-chevron">
                              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                                <path d={mdiChevronDown} />
                              </svg>
                            </span>
                          </button>
                        </DeviceMenuPopup>
                        <DeviceMenuPopup type="video">
                          <button className="ctl-split-btn" aria-label="Camera options">
                            <span className="ctl-split-icon">
                              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                                <path d={mdiVideo} />
                              </svg>
                            </span>
                            <span className="ctl-split-chevron">
                              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                                <path d={mdiChevronDown} />
                              </svg>
                            </span>
                          </button>
                        </DeviceMenuPopup>
                      </div>
                    )}
                  </div>
                </div>

                {/* Divider */}
                <div className={styles.scDivider} />

                {/* AI agent check section */}
                <div className={classnames(styles.scSection, {
                  [styles.scSectionDimmed]: agentStatus === 'idle',
                })}>
                  <div className={styles.scSectionHeader}>
                    {agentStatus === 'done' ? (
                      <svg viewBox="0 0 24 24" width="24" height="24" fill="#8CE1CA" className={styles.scSectionIcon}>
                        <path d={mdiCheckCircleOutline} />
                      </svg>
                    ) : agentStatus === 'running' ? (
                      <svg viewBox="0 0 24 24" width="24" height="24" fill="#FFCD78" className={classnames(styles.scSectionIcon, styles.scSectionIconSpin)}>
                        <path d={mdiProgressHelper} />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" width="24" height="24" fill="#69717F" className={styles.scSectionIcon}>
                        <path d={mdiRobot} />
                      </svg>
                    )}
                    <span className={styles.scSectionTitle}>{i18nUtils.gettext('AI agent check')}</span>
                  </div>
                  {agentStatus === 'running' && agentText && (
                    <p className={styles.scAgentSubtext}>{agentText}</p>
                  )}
                </div>
              </>
            )}

            {/* ---- Consent to record ---- */}
            {step === 'consent' && (
              <div className={styles.scConsentContent}>
                <p className={styles.scConsentText}>
                  {i18nUtils.gettext('This interview will be recorded and will be carried out by an AI Interviewer Agent according to the terms of the')}{' '}
                  <a href="#" className={styles.scLink}>{i18nUtils.gettext('Customer Candidate Privacy Notice')}</a>
                  {' '}{i18nUtils.gettext('or')}{' '}
                  <a href="#" className={styles.scLink}>{i18nUtils.gettext('Privacy Notice, Notice at Collection of Personal Data')}</a>
                  {i18nUtils.gettext('. If you do not agree, select More options.')}
                </p>
                <label className={styles.scConsentLabel}>
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className={styles.scConsentCheckbox}
                  />
                  <span>{i18nUtils.gettext('I agree')}</span>
                </label>
              </div>
            )}

            {/* ---- Verify identity ---- */}
            {step === 'verify' && !verified && (
              <div className={styles.scVerifyContent}>
                <p className={styles.scVerifyText}>{i18nUtils.gettext('To keep interviews secure,')}</p>
                <ul className={styles.scVerifyList}>
                  <li>{i18nUtils.gettext("We'll confirm your name, phone number, and email.")}</li>
                  <li>{i18nUtils.gettext('We use CLEAR, a trusted third-party service, to handle this step safely.')}</li>
                  <li>{i18nUtils.gettext('Your details are only used for verification and stay protected.')}</li>
                </ul>
                <button className={styles.scVerifyBtn} onClick={handleVerify} disabled={verifying}>
                  <img src="/Icon/Label/Verify Icon.png" alt="" className={styles.scVerifyIcon} />
                  {verifying ? i18nUtils.gettext('Verifying...') : i18nUtils.gettext('Verify with CLEAR')}
                </button>
              </div>
            )}

            {step === 'verify' && verified && (
              <div className={styles.scVerifiedContent}>
                <div className={styles.scShieldIcon}>
                  <svg viewBox="0 0 64 64" width="64" height="64" fill="none">
                    <path d="M32 4L8 16v16c0 14.4 10.24 27.84 24 32 13.76-4.16 24-17.6 24-32V16L32 4z" fill="#2C8CC9" fillOpacity="0.2" stroke="#2C8CC9" strokeWidth="2" />
                    <path d="M24 32l5 5 11-11" stroke="#2C8CC9" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="18" cy="20" r="2" fill="#2C8CC9" opacity="0.5" />
                    <circle cx="46" cy="20" r="2" fill="#2C8CC9" opacity="0.5" />
                    <circle cx="50" cy="36" r="1.5" fill="#2C8CC9" opacity="0.4" />
                    <circle cx="14" cy="36" r="1.5" fill="#2C8CC9" opacity="0.4" />
                    <path d="M20 14l2 2M44 14l-2 2M48 28l2 1M16 28l-2 1" stroke="#2C8CC9" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
                  </svg>
                </div>
                <p className={styles.scVerifiedText}>
                  {i18nUtils.gettext('Your Identity has been verified with clear. Please click on Join Interview to continue.')}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className={styles.scFooter}>
          <button className={styles.scBtnMore} style={{ visibility: 'hidden' }}>{i18nUtils.gettext('More options')}</button>
          <div className={styles.scFooterActions}>
            <button className={styles.scBtnCancel} onClick={onClose}>{i18nUtils.gettext('Cancel')}</button>
            <button className={styles.scBtnNext} disabled={!canNext} onClick={handleNext}>
              {step === 'verify' && verified ? i18nUtils.gettext('Join interview') : i18nUtils.gettext('Next')}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
