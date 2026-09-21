export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export const APP_URL = {
  LINKS: {
    HOME: "/",
    ABOUT: "/about",
    LOGIN: "/login",
    REGISTER: "/register",
    FORGOT_PASSWORD: "/forgot-password",
    OTP_VERIFICATION: "/forgot-password/otp",
    RESET_PASSWORD: "/forgot-password/reset",
    EMAIL_VERIFICATION: "/email-verify",
    RELATIONSHIP_DETAILS: "/relationship-details",
    CREATE_UNION: "/create-union",
    CODE_CREATED: "/code-created",
    JOIN_UNION: "/join-union",
    CONNECTED: "/connected",
    PROFILE: "/profile",
    DASHBOARD: "/dashboard",
    WEEKLY_CHECK_IN: "/weekly-check-in",
    CHECK_IN_COMPLETED: "/check-in-completed",
    TASKS: "/tasks",
    INSIGHTS: "/insights",
    NOTIFICATIONS: "/notifications",
    SETTINGS: "/settings",
    ACCOUNT: "/account",
    MY_ACCOUNT: "/account/my-account",
    CONNECTED_PARTNER: "/account/connected-partner",
    EXPLORE_PLANS: "/account/explore-plans",
    TRANSACTIONS: "/account/transactions",
    ACCOUNT_SETTINGS: "/account/settings",
    LEGAL: "/account/legal",
  },
  ENDPOINT_URL: {
    LOGIN: '/api/auth/login',
    SIGNUP: '/api/auth/signup',
    REQUEST_EMAIL_VERIFY: '/api/auth/request-email-verify',
    VERIFY_EMAIL: '/api/auth/verify-email',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    VERIFY_OTP: '/api/auth/verify-otp',
    RESET_PASSWORD: '/api/auth/reset-password',
    LOGOUT: '/api/auth/logout',
  },
  IMAGES: {
    LOGO: '/assets/images/logo.svg',
    LIGHT_LOGO: '/assets/images/LightLogo.svg',
    LOGO_BADGE: '/assets/images/logo-badge.svg'
  }
}
