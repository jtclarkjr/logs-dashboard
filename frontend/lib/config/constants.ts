export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL,
  SERVER_BASE_URL: `${process.env.API_URL}/api/v${process.env.API_VERSION}`,
  API_VERSION: `/api/v${process.env.API_VERSION}`,
  TIMEOUT: 30000
} as const
