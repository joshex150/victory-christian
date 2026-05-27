import type { CSSProperties } from "react";

export type SiteTheme = {
  pageBackground: string;
  surface: string;
  softSurface: string;
  border: string;
  accent: string;
  accentDeep: string;
  headingText: string;
  bodyText: string;
  mutedText: string;
  buttonBackground: string;
  buttonHover: string;
  buttonText: string;
  badgeBackground: string;
  badgeText: string;
  inputBackground: string;
  toastBackground: string;
  toastBorder: string;
  toastText: string;
  coverBackground: string;
  coverAccent: string;
};

export const DEFAULT_SITE_THEME: SiteTheme = {
  pageBackground: "#fdfaf7",
  surface: "#ffffff",
  softSurface: "#fbeef0",
  border: "#f4d7dd",
  accent: "#d4456a",
  accentDeep: "#b02c54",
  headingText: "#1a1014",
  bodyText: "#3a2a30",
  mutedText: "#76636a",
  buttonBackground: "#b02c54",
  buttonHover: "#6e1532",
  buttonText: "#ffffff",
  badgeBackground: "#d4456a",
  badgeText: "#ffffff",
  inputBackground: "#ffffff",
  toastBackground: "#fbeef0",
  toastBorder: "#f4d7dd",
  toastText: "#6e1532",
  coverBackground: "#ffffff",
  coverAccent: "#fbeef0",
};

export function themeStyle(theme: SiteTheme): CSSProperties {
  return {
    "--color-cream": theme.pageBackground,
    "--color-surface": theme.surface,
    "--color-blush": theme.softSurface,
    "--color-blush-deep": theme.border,
    "--color-rose": theme.accent,
    "--color-rose-deep": theme.accentDeep,
    "--color-wine": theme.buttonHover,
    "--color-ink": theme.headingText,
    "--color-ink-soft": theme.bodyText,
    "--color-mute": theme.mutedText,
    "--color-button": theme.buttonBackground,
    "--color-button-hover": theme.buttonHover,
    "--color-button-text": theme.buttonText,
    "--color-badge": theme.badgeBackground,
    "--color-badge-text": theme.badgeText,
    "--color-input": theme.inputBackground,
    "--color-toast-bg": theme.toastBackground,
    "--color-toast-border": theme.toastBorder,
    "--color-toast-text": theme.toastText,
    "--color-cover-bg": theme.coverBackground,
    "--color-cover-accent": theme.coverAccent,
  } as CSSProperties;
}

export type EmailTemplate = {
  subject: string;
  eyebrow: string;
  heading: string;
  subtitle: string;
  intro: string;
  message: string;
  signoff: string;
  footer: string;
  background: string;
  surface: string;
  headerBackground: string;
  border: string;
  accent: string;
  headingText: string;
  bodyText: string;
  mutedText: string;
};

export const DEFAULT_EMAIL_TEMPLATE: EmailTemplate = {
  subject: "You're on the list - {{bookTitle}}",
  eyebrow: "You're on the list",
  heading: "{{bookTitle}}",
  subtitle: "{{subheadline}}",
  intro: "Thank you for joining the waitlist.",
  message:
    "You'll be among the first to know when {{bookTitle}} drops. No spam, no noise - just one quiet note when it's time.",
  signoff: "Until then: take care of her - the version of you who's still learning.",
  footer:
    "You're receiving this because you signed up at the {{bookTitle}} waitlist. If this wasn't you, simply ignore this email.",
  background: "#fdfaf7",
  surface: "#ffffff",
  headerBackground: "#fbeef0",
  border: "#f4d7dd",
  accent: "#b02c54",
  headingText: "#1a1014",
  bodyText: "#3a2a30",
  mutedText: "#76636a",
};

export const DEFAULT_UPCOMING_EMAIL_TEMPLATE: EmailTemplate = {
  ...DEFAULT_EMAIL_TEMPLATE,
  subject: "You're on the early-access list - {{bookTitle}}",
  eyebrow: "Early access confirmed",
  intro: "Thank you for joining the early-access list.",
  message:
    "You'll be among the first to hear when {{bookTitle}} is ready. We'll send a quiet update when there is news worth sharing.",
  signoff: "Until then, thank you for making room for what comes next.",
  footer:
    "You're receiving this because you asked for updates about {{bookTitle}}. If this wasn't you, simply ignore this email.",
};

type TemplateValues = {
  bookTitle: string;
  subheadline: string;
  footerText: string;
};

export function fillTemplate(value: string, content: TemplateValues) {
  return value
    .replaceAll("{{bookTitle}}", content.bookTitle)
    .replaceAll("{{subheadline}}", content.subheadline)
    .replaceAll("{{footerText}}", content.footerText);
}
