import {
  dateToUnix,
  isDateWithinOptionalRange,
  useInputFormat,
  useInputFormatter,
} from './dateUtils'
import * as React from 'react'
import type { ValidRangeType } from './Calendar'

export default function useDateInput({
  locale,
  value,
  validRange,
  inputMode,
  onChange,
}: {
  onChange: (d: Date) => void
  locale: undefined | string
  value: Date | undefined
  validRange: ValidRangeType | undefined
  inputMode: 'start' | 'end'
}) {
  const [error, setError] = React.useState<null | string>(null)
  const formatter = useInputFormatter({ locale })
  const inputFormat = useInputFormat({ formatter })
  const formattedValue = formatter.format(value)
  const onChangeText = (date: string) => {
    const dayIndex = inputFormat.indexOf('DD')
    const monthIndex = inputFormat.indexOf('MM')
    const yearIndex = inputFormat.indexOf('YYYY')

    const day = Number(date.slice(dayIndex, dayIndex + 2))
    const year = Number(date.slice(yearIndex, yearIndex + 4))
    const month = Number(date.slice(monthIndex, monthIndex + 2))

    if (Number.isNaN(day) || Number.isNaN(year) || Number.isNaN(month)) {
      setError(inputFormat)
      return
    }

    const finalDate =
      inputMode === 'end'
        ? new Date(year, month - 1, day, 23, 59, 59)
        : new Date(year, month - 1, day)

    const validStart = validRange?.startDate
    const validEnd = validRange?.endDate
    if (
      !isDateWithinOptionalRange(finalDate, {
        startUnix: validStart ? dateToUnix(validStart) : undefined,
        endUnix: validEnd ? dateToUnix(validEnd) : undefined,
      })
    ) {
      let errors =
        validStart && validEnd
          ? [`${formatter.format(validStart)} - ${formatter.format(validEnd)}`]
          : [
              validStart ? `> ${formatter.format(validStart)}` : '',
              validEnd ? `< ${formatter.format(validEnd)}` : '',
            ]
      setError(errors.filter((n) => n).join(' '))
      return
    }

    setError(null)
    if (inputMode === 'end') {
      onChange(finalDate)
    } else {
      onChange(finalDate)
    }
  }
  return {
    onChange,
    error,
    formattedValue,
    onChangeText,
    inputFormat,
  }
}
