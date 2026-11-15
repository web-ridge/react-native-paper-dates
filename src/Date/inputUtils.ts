import { useEffect, useRef, useState } from 'react'

import { getTranslation } from '../translations/utils'
import {
  interpretTypedDate,
  useInputFormat,
  useInputFormatter,
  useRangeChecker,
} from './dateUtils'
import type { ValidRangeType } from './types'

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
    const reject = (message: string) => {
      report(message)
      setRejected(text)
    }
    const next = interpretTypedDate(text, inputFormat, inputMode, {
      isDisabled,
      isWithinValidRange,
    })
    if (next.issue === 'disabled') {
      reject(getTranslation(locale, 'dateIsDisabled'))
      return
    }
    if (next.issue === 'format') {
      reject(
        getTranslation(
          locale,
          'notAccordingToDateFormat',
          () => 'notAccordingToDateFormat'
        )(inputFormat)
      )
      return
    }
    if (next.issue === 'range') {
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
      reject(errors.filter((message) => message).join(' '))
      return
    }

    report(null)
    setRejected(null)
    onChange(next.date)
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
