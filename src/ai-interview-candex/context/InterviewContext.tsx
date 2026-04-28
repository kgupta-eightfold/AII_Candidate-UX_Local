import {
  createContext,
  useContext,
  useReducer,
  useRef,
  useCallback,
  useState,
  type ReactNode,
} from 'react';
import { i18nUtils } from '@i18n';

export type ScreenName =
  | 'email'
  | 'landing'
  | 'landingStarbucks'
  | 'landingAssessment'
  | 'landingPostAssessment'
  | 'conversational'
  | 'techqna'
  | 'coding'
  | 'whiteboard'
  | 'endInterview'
  | 'feedbackForm'
  | 'break';

export type BrandVariant = 'default' | 'starbucks' | 'assessment' | 'post-assessment';

export type EmailVariant = 'interview' | 'assessment' | 'combined';

export type TransitionMode = 'default' | 'v2';

export type InterviewPhase =
  | 'landing'
  | 'intro'
  | 'promptTechQna'
  | 'techQnaIntro'
  | 'promptCoding'
  | 'codingIntro'
  | 'codingActive'
  | 'promptWhiteboard'
  | 'whiteboardIntro'
  | 'whiteboardActive'
  | 'ended';

export interface TransitionConfig {
  title: string;
  duration?: string;
  details: string[];
  /** When true, hide "Take a break" — single primary action only. */
  primaryOnly?: boolean;
  /** Primary button label (default "Continue"). */
  primaryLabel?: string;
}

/** Shown in the main interview area after Sophia’s prompt video (screening → Technical Q&A). Matches Figma handoff. */
export const SECTION_TRANSITION_TECHQNA: TransitionConfig = {
  title: i18nUtils.gettext('Next is technical Q&A'),
  duration: i18nUtils.gettext('45 min'),
  details: [
    i18nUtils.gettext('This section has 2 questions.'),
    i18nUtils.gettext('Every question is timed.'),
    i18nUtils.gettext('Question appears in the left side panel.'),
  ],
};

/** Shown after prompt to coding (Technical Q&A → Coding). */
export const SECTION_TRANSITION_CODING: TransitionConfig = {
  title: i18nUtils.gettext('Next is coding exercises'),
  duration: i18nUtils.gettext('45 min'),
  details: [
    i18nUtils.gettext('This section has 2 questions.'),
    i18nUtils.gettext('Each question is timed.'),
    i18nUtils.gettext('Code in your browser, share live with test cases.'),
  ],
};

/** Shown after coding (Coding → Whiteboard / systems design). */
export const SECTION_TRANSITION_WHITEBOARD: TransitionConfig = {
  title: i18nUtils.gettext('Next is systems design'),
  duration: i18nUtils.gettext('~45 min'),
  details: [
    i18nUtils.gettext('This section has 1 open-ended design problem.'),
    i18nUtils.gettext("You'll have access to a shared canvas to sketch your approach."),
    i18nUtils.gettext("Think out loud — we're evaluating your process, not the final output."),
  ],
};

/** End interview handoff — same card shell as other section transitions. */
export const SECTION_TRANSITION_END_INTERVIEW: TransitionConfig = {
  title: i18nUtils.gettext('Interview completed'),
  details: [i18nUtils.gettext('You can end the interview and move to feedback page.')],
  primaryOnly: true,
  primaryLabel: i18nUtils.gettext('End interview'),
};

export const VIDEO_BASE = `${import.meta.env.BASE_URL}videos/`;

/** Use for filenames that may contain spaces (e.g. "Sophia intro.mp4"). */
export function videoUrl(filename: string): string {
  return VIDEO_BASE + encodeURIComponent(filename);
}

export const VIDEOS = {
  intro: 'Sophia intro.mp4',
  promptTechQna: 'Prompt to techqna.mp4',
  techQna: 'techqna.mp4',
  promptCoding: 'Coding.mp4',
  codingStart: 'Coding start.mp4',
  end: 'End.mp4',
} as const;

export const TRANSCRIPTS: Record<string, string> = {
  intro: i18nUtils.gettext(
    "Hello! I'm Sophia, your AI interviewer for today. Welcome to this technical interview session. We'll be going through a few rounds together, starting with some screening questions to get to know you better, then we'll move on to a technical Q&A section, and finally wrap up with a coding challenge. Let's get started! Tell me a little about yourself and your experience in software development.",
  ),
  promptTechQna: i18nUtils.gettext(
    "That was great, thank you for sharing your background. I can see you have solid experience. Now, would you like to move on to the technical Q&A round? We'll explore some deeper technical concepts together.",
  ),
  techQna: i18nUtils.gettext(
    "Welcome to the Technical Q&A round. I'll be asking you about software architecture and design patterns. Take your time thinking through your answers. Let's start with the first question on the board.",
  ),
  promptCoding: i18nUtils.gettext(
    "Excellent responses! You've shown strong conceptual understanding. Are you ready to move on to the coding challenge? We'll put your problem-solving skills to the test.",
  ),
  codingStart: i18nUtils.gettext(
    "Here's your coding challenge. You'll see the problem on the left panel. Take your time to read through it carefully, and feel free to think out loud as you work through your solution. I'm here if you need any clarification.",
  ),
};

interface InterviewState {
  screen: ScreenName;
  phase: InterviewPhase;
  brand: BrandVariant;
  emailVariant: EmailVariant;
  transitionMode: TransitionMode;
  elapsedSeconds: number;
  transcriptPanelOpen: boolean;
  controlsMode: 'expanded' | 'collapsed' | 'dimmed' | 'hidden';
  transitionModal: TransitionConfig | null;
  breakReturnPhase: InterviewPhase | null;
}

type InterviewAction =
  | { type: 'SET_SCREEN'; screen: ScreenName }
  | { type: 'SET_PHASE'; phase: InterviewPhase }
  | { type: 'SET_BRAND'; brand: BrandVariant }
  | { type: 'SET_TRANSITION_MODE'; mode: TransitionMode }
  | { type: 'TICK_TIMER' }
  | { type: 'TOGGLE_TRANSCRIPT_PANEL' }
  | { type: 'CLOSE_TRANSCRIPT_PANEL' }
  | { type: 'SET_CONTROLS_MODE'; mode: InterviewState['controlsMode'] }
  | { type: 'SHOW_TRANSITION'; config: TransitionConfig }
  | { type: 'HIDE_TRANSITION' }
  | { type: 'SET_EMAIL_VARIANT'; variant: EmailVariant }
  | { type: 'START_BREAK'; returnPhase: InterviewPhase }
  | { type: 'END_BREAK' };

const initialState: InterviewState = {
  screen: 'email',
  phase: 'landing',
  brand: 'default',
  emailVariant: 'interview',
  transitionMode: 'default',
  elapsedSeconds: 0,
  transcriptPanelOpen: false,
  controlsMode: 'hidden',
  transitionModal: null,
  breakReturnPhase: null,
};

function interviewReducer(state: InterviewState, action: InterviewAction): InterviewState {
  switch (action.type) {
    case 'SET_SCREEN':
      return { ...state, screen: action.screen, transcriptPanelOpen: false };
    case 'SET_PHASE':
      return { ...state, phase: action.phase };
    case 'SET_BRAND':
      return { ...state, brand: action.brand };
    case 'SET_TRANSITION_MODE':
      return { ...state, transitionMode: action.mode };
    case 'TICK_TIMER':
      return { ...state, elapsedSeconds: state.elapsedSeconds + 1 };
    case 'TOGGLE_TRANSCRIPT_PANEL':
      return { ...state, transcriptPanelOpen: !state.transcriptPanelOpen };
    case 'CLOSE_TRANSCRIPT_PANEL':
      return { ...state, transcriptPanelOpen: false };
    case 'SET_CONTROLS_MODE':
      return { ...state, controlsMode: action.mode };
    case 'SHOW_TRANSITION':
      return { ...state, transitionModal: action.config };
    case 'HIDE_TRANSITION':
      return { ...state, transitionModal: null };
    case 'SET_EMAIL_VARIANT':
      return { ...state, emailVariant: action.variant };
    case 'START_BREAK':
      return {
        ...state,
        screen: 'break',
        controlsMode: 'hidden',
        breakReturnPhase: action.returnPhase,
      };
    case 'END_BREAK':
      return { ...state, breakReturnPhase: null };
    default:
      return state;
  }
}

interface InterviewContextValue {
  state: InterviewState;
  dispatch: React.Dispatch<InterviewAction>;
  cameraStreamRef: React.MutableRefObject<MediaStream | null>;
  /** Increments when a new camera stream is attached; use to bind `<video>` elements. */
  cameraStreamVersion: number;
  initCamera: () => Promise<void>;
}

const InterviewContext = createContext<InterviewContextValue | null>(null);

export function InterviewProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(interviewReducer, initialState);
  const [cameraStreamVersion, setCameraStreamVersion] = useState(0);
  const cameraStreamRef = useRef<MediaStream | null>(null);

  const initCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
        audio: false,
      });
      cameraStreamRef.current = stream;
      setCameraStreamVersion((v) => v + 1);
    } catch (err) {
      console.log('Camera access denied or unavailable:', (err as Error).message);
    }
  }, []);

  return (
    <InterviewContext.Provider
      value={{ state, dispatch, cameraStreamRef, cameraStreamVersion, initCamera }}
    >
      {children}
    </InterviewContext.Provider>
  );
}

export function useInterview() {
  const ctx = useContext(InterviewContext);
  if (!ctx) throw new Error('useInterview must be used within InterviewProvider');
  return ctx;
}
