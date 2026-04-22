export const i18nUtils = {
  gettext: (text: string): string => text,
  ngettext: (singular: string, plural: string, count: number): string =>
    count === 1 ? singular : plural,
};
