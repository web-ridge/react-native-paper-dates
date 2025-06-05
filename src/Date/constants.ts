/**
 * Default year range constants for the date picker
 */
export const DEFAULT_YEAR_RANGE = {
  START_YEAR: 1800,
  END_YEAR: 2200,
} as const

// For backward compatibility, export individual constants
export const DEFAULT_START_YEAR = DEFAULT_YEAR_RANGE.START_YEAR
export const DEFAULT_END_YEAR = DEFAULT_YEAR_RANGE.END_YEAR 