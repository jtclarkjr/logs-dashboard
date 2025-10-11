export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  SERVER_BASE_URL: process.env.API_URL
    ? `${process.env.API_URL}/api/v1`
    : 'http://localhost:8000/api/v1',
  API_VERSION: '/api/v1',
  TIMEOUT: 30000
} as const
