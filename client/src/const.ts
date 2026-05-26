export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Single source for login target used across the app.
// Requirement: No external Manus portal linkage. Always use site-local login.
export const getLoginUrl = () => "/login";
