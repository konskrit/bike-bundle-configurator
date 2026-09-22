export const Language = {
  ENGLISH: "en",
  GERMAN: "de",
} as const;

export type Language = (typeof Language)[keyof typeof Language];

export const LOCALES = [Language.ENGLISH, Language.GERMAN] as const;

export const DEFAULT_LANGUAGE = Language.GERMAN;
