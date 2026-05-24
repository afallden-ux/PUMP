/** User-facing product name (site rebrand from PUMP). */
export const APP_NAME = "ClimbCompare";
export const APP_SHORT = "CC";
export const APP_TAGLINE = "Compare climbers side by side. Track crew. Level up.";

/** Static logo path (public/brand/logo.jpg). */
export const BRAND_LOGO_PATH = "/brand/logo.jpg";

export function appTitle(suffix?: string): string {
  if (!suffix) return APP_NAME;
  return `${suffix} — ${APP_NAME}`;
}
