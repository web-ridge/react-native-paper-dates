import { useCallback, useMemo } from 'react'

import type { ValidRangeType } from './types'
import {
  calendarDateKey,
  dateToUnix,
  getEndOfDay,
  getStartOfDay,
  isDateWithinOptionalRange,
} from './dateUtils'

const inputSample = new Date(2020, 9, 1)

export function maskFromFormatter(
  formatter: Intl.DateTimeFormat,
  locale: string | undefined
) {
  return formatter
    .formatToParts(inputSample)
    .map((part) => {
      if (part.type === 'year') return locale === 'pt' ? 'AAAA' : 'YYYY'
      if (part.type === 'month') return 'MM'
      if (part.type === 'day') return 'DD'
      return part.value
    })
    .join('')
}

export function useInputFormat({
  formatter,
  locale,
}: {
  formatter: Intl.DateTimeFormat
  locale: string | undefined
}) {
  return useMemo(
    () => maskFromFormatter(formatter, locale),
    [formatter, locale]
  )
}

export function useInputFormatter({ locale }: { locale: string | undefined }) {
  return useMemo(() => {
    return new Intl.DateTimeFormat(locale, {
      calendar: 'gregory',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }, [locale])
}

export function useRangeChecker(validRange: ValidRangeType | undefined) {
  const disabledDates = validRange?.disabledDates

  const disabledKeys = useMemo(() => {
    const keys = new Set<string>()
    if (disabledDates) {
      for (const disabledDate of disabledDates) {
        keys.add(calendarDateKey(disabledDate))
      }
    }
    return keys
  }, [disabledDates])
  const isDisabled = useCallback(
    (day: Date) => disabledKeys.has(calendarDateKey(day)),
    [disabledKeys]
  )

  const validEnd = validRange?.endDate

  const endUnix =
    validEnd instanceof Date ? dateToUnix(getEndOfDay(validEnd)) : undefined

  const validStart = validRange?.startDate

  const startUnix =
    validStart instanceof Date
      ? dateToUnix(getStartOfDay(validStart))
      : undefined

  const isWithinValidRange = useCallback(
    (day: Date) => {
      return isDateWithinOptionalRange(day, {
        endUnix: endUnix,
        startUnix: startUnix,
      })
    },
    [startUnix, endUnix]
  )

  return { disabledKeys, isDisabled, isWithinValidRange, validEnd, validStart }
}
