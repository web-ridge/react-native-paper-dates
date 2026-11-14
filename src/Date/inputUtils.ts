import { useInputFormat, useInputFormatter, useRangeChecker } from './dateUtils'
import type { ValidRangeType } from './types'
import { getTranslation } from '../translations/utils'
import { useState } from 'react'

export default function useDateInput({
  inputMode,
  locale,
  onChange,
  onValidationError,
  validRange,
  value,
}: {
  inputMode: 'start' | 'end'
  locale: string | undefined
  onChange: (d: Date) => void
  onValidationError?: (error: string | null) => void
  validRange: ValidRangeType | undefined
  value: Date | undefined
}) {
  const formatter = useInputFormatter({ locale })
  const inputFormat = useInputFormat({ formatter, locale })
  const formattedValue = value ? formatter.format(value) : ''

  const [error, setError] = useState<null | string>(null)

  const { isDisabled, isWithinValidRange, validStart, validEnd } =
    useRangeChecker(validRange)

  const onChangeText = (date: string) => {
    const dayIndex = inputFormat.indexOf('DD')
    const monthIndex = inputFormat.indexOf('MM')
    const yearIndex =
      locale === 'pt'
        ? inputFormat.indexOf('AAAA')
        : inputFormat.indexOf('YYYY')
    const day = Number(date.slice(dayIndex, dayIndex + 2))
    const year = Number(date.slice(yearIndex, yearIndex + 4))
    const month = Number(date.slice(monthIndex, monthIndex + 2))

    const rejectFormat = () => {
      const inputError = getTranslation(
        locale,
        'notAccordingToDateFormat',
        () => 'notAccordingToDateFormat'
      )(inputFormat)
      setError(inputError)
      onValidationError && onValidationError(inputError)
    }

    if (
      dayIndex < 0 ||
      monthIndex < 0 ||
      yearIndex < 0 ||
      Number.isNaN(day) ||
      Number.isNaN(year) ||
      Number.isNaN(month)
    ) {
      rejectFormat()
      return
    }

    const finalDate =
      inputMode === 'end'
        ? new Date(year, month - 1, day, 23, 59, 59)
        : new Date(year, month - 1, day)

    if (
      finalDate.getFullYear() !== year ||
      finalDate.getMonth() !== month - 1 ||
      finalDate.getDate() !== day
    ) {
      rejectFormat()
      return
    }

    if (isDisabled(finalDate)) {
      const inputError = getTranslation(locale, 'dateIsDisabled')
      setError(inputError)
      onValidationError && onValidationError(inputError)
      return
    }
    if (!isWithinValidRange(finalDate)) {
      const errors =
        validStart && validEnd
          ? [
              `${getTranslation(
                locale,
                'mustBeBetween',
                () => 'mustBeBetween'
              )(formatter.format(validStart), formatter.format(validEnd))}`,
            ]
          : [
              validStart
                ? getTranslation(
                    locale,
                    'mustBeHigherThan',
                    () => 'mustBeHigherThan'
                  )(formatter.format(validStart))
                : '',
              validEnd
                ? getTranslation(
                    locale,
                    'mustBeLowerThan',
                    () => 'mustBeLowerThan'
                  )(formatter.format(validEnd))
                : '',
            ]
      const inputError = errors.filter((message) => message).join(' ')
      setError(inputError)
      onValidationError && onValidationError(inputError)
      return
    }

    setError(null)
    onValidationError?.(null)
    onChange(finalDate)
  }
  return {
    onChange,
    error,
    formattedValue,
    onChangeText,
    inputFormat,
  }
}
