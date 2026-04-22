import { i18nUtils } from '@i18n';

export const phaseLabels: Record<string, string> = {
  intro: i18nUtils.gettext('Screening in progress'),
  promptTechQna: i18nUtils.gettext('Screening in progress'),
  techQnaIntro: i18nUtils.gettext('Technical Q&A in progress'),
  promptCoding: i18nUtils.gettext('Technical Q&A in progress'),
  codingIntro: i18nUtils.gettext('Coding exercise in progress'),
  codingActive: i18nUtils.gettext('Coding exercise in progress'),
  promptWhiteboard: i18nUtils.gettext('Coding exercise in progress'),
  whiteboardIntro: i18nUtils.gettext('Systems design in progress'),
  whiteboardActive: i18nUtils.gettext('Systems design in progress'),
  ended: i18nUtils.gettext('Interview completed'),
};

export const completedLabels = {
  endInterview: i18nUtils.gettext('System Design completed'),
  promptTechQna: i18nUtils.gettext('Screening Completed'),
  promptCoding: i18nUtils.gettext('Technical Q&A Completed'),
  promptWhiteboard: i18nUtils.gettext('Coding exercise Completed'),
} as const;
