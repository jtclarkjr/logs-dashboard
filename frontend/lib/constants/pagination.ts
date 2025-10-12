/**
 * Pagination constants used throughout the application
 */
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MIN_PAGE_SIZE: 5,
  MAX_PAGE_SIZE: 100,
  PAGE_SIZE_OPTIONS: [10, 15, 25] as const
} as const

export const DEFAULT_PAGE_SIZE = PAGINATION.DEFAULT_PAGE_SIZE
export const PAGE_SIZE_OPTIONS = PAGINATION.PAGE_SIZE_OPTIONS
