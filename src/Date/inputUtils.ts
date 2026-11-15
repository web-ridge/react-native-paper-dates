import {
  parseLooseDate,
  useInputFormat,
  useInputFormatter,
  useRangeChecker,
} from './dateUtils'
import type { ValidRangeType } from './types'
import { getTranslation } from '../translations/utils'
import { useEffect, useRef, useState } from 'react'

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
  onChange: (d: Date | undefined) => void
  onValidationError?: (error: string | null) => void
  validRange: ValidRangeType | undefined
  value: Date | undefined
}) {
  const [draft, setDraft] = useState('')
  const [error, setError] = useState<null | string>(null)
  const [focused, setFocused] = useState(false)
  const [rejected, setRejected] = useState<null | string>(null)
  const errorRef = useRef(error)
  const formatter = useInputFormatter({ locale })
  const formattedValue = value ? formatter.format(value) : ''
  const inputFormat = useInputFormat({ formatter, locale })
  const onValidationErrorRef = useRef(onValidationError)
  const reportedValue = useRef(value)
  errorRef.current = error
  onValidationErrorRef.current = onValidationError

  useEffect(() => {
    if (reportedValue.current === value) return
    reportedValue.current = value
    setRejected(null)
    if (!errorRef.current) return
    setError(null)
    onValidationErrorRef.current?.(null)
  }, [value])

  const { isDisabled, isWithinValidRange, validEnd, validStart } =
    useRangeChecker(validRange)

  const report = (inputError: string | null) => {
    setError(inputError)
    onValidationError?.(inputError)
  }

  const commit = (text: string) => {
    const rejectFormat = () => {
      report(
        getTranslation(
          locale,
          'notAccordingToDateFormat',
          () => 'notAccordingToDateFormat'
        )(inputFormat)
      )
      setRejected(text)
    }
    const trimmed = text.trim()
    if (!trimmed) {
      report(null)
      setRejected(null)
      onChange(undefined)
      return
    }

    const parsed = parseLooseDate(trimmed, inputFormat)
    if (!parsed) {
      rejectFormat()
      return
    }

    const { day, month, year } = parsed
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
      report(getTranslation(locale, 'dateIsDisabled'))
      setRejected(text)
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
      report(errors.filter((message) => message).join(' '))
      setRejected(text)
      return
    }

    report(null)
    setRejected(null)
    onChange(finalDate)
  }

  const onChangeText = (text: string) => {
    setDraft(text)
    if (rejected) setRejected(null)
  }

  const onFocus = () => {
    setDraft(rejected ?? formattedValue)
    setFocused(true)
  }

  const onBlur = () => {
    setFocused(false)
    commit(draft)
  }

  const displayedValue = focused ? draft : (rejected ?? formattedValue)

  return {
    displayedValue,
    error,
    formattedValue,
    inputFormat,
    onBlur,
    onChange,
    onChangeText,
    onFocus,
    onSubmitEditing: () => commit(focused ? draft : displayedValue),
  }
}
