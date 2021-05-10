import * as React from 'react'
import {
  Keyboard,
  StyleSheet,
  TextInput as TextInputNative,
  View,
} from 'react-native'

import { CalendarDate, ModeType, ValidRangeType } from './Calendar'
import { LocalState } from './DatePickerModalContent'
import TextInputWithMask from '../TextInputMask'
import { HelperText } from 'react-native-paper'
import { dateToUnix, isDateWithinOptionalRange } from './dateUtils'

function CalendarEdit({
  mode,
  state,
  label = '',
  startLabel = 'Start',
  endLabel = 'End',
  collapsed,
  onChange,
  validRange,
  locale,
  theme,
}: {
  mode: ModeType
  label?: string
  startLabel?: string
  endLabel?: string
  state: LocalState
  collapsed: boolean
  onChange: (s: LocalState) => any
  validRange: ValidRangeType | undefined
  locale?: undefined | string
  theme: ReactNativePaper.Theme
}) {
  const dateInput = React.useRef<TextInputNative | null>(null)
  const startInput = React.useRef<TextInputNative | null>(null)
  const endInput = React.useRef<TextInputNative | null>(null)

  // when switching views focus, or un-focus text input
  React.useEffect(() => {
    // hide open keyboard
    if (collapsed) {
      Keyboard.dismiss()
    }

    const inputsToFocus = [dateInput.current, startInput.current].filter(
      (n) => n
    ) as TextInputNative[]

    const inputsToBlur = [
      dateInput.current,
      startInput.current,
      endInput.current,
    ].filter((n) => n) as TextInputNative[]

    if (collapsed) {
      inputsToBlur.forEach((ip) => ip.blur())
    } else {
      inputsToFocus.forEach((ip) => ip.focus())
    }
  }, [mode, startInput, endInput, dateInput, collapsed])

  const onSubmitStartInput = React.useCallback(() => {
    if (endInput.current) {
      endInput.current.focus()
    }
  }, [endInput])

  const onSubmitEndInput = React.useCallback(() => {
    // TODO: close modal and persist range
  }, [])

  const onSubmitInput = React.useCallback(() => {
    // TODO: close modal and persist range
  }, [])

  return (
    <View style={styles.root}>
      <View style={styles.inner}>
        {mode === 'single' ? (
          <CalendarInput
            ref={dateInput}
            label={label}
            value={state.date}
            onChange={(date) => onChange({ ...state, date })}
            onSubmitEditing={onSubmitInput}
            validRange={validRange}
            locale={locale}
            theme={theme}
          />
        ) : null}
        {mode === 'range' ? (
          <>
            <CalendarInput
              ref={startInput}
              label={startLabel}
              value={state.startDate}
              onChange={(startDate) => onChange({ ...state, startDate })}
              returnKeyType={'next'}
              onSubmitEditing={onSubmitStartInput}
              validRange={validRange}
              locale={locale}
              theme={theme}
            />
            <View style={styles.separator} />
            <CalendarInput
              ref={endInput}
              label={endLabel}
              value={state.endDate}
              onChange={(endDate) => onChange({ ...state, endDate })}
              isEndDate
              onSubmitEditing={onSubmitEndInput}
              validRange={validRange}
              locale={locale}
              theme={theme}
            />
          </>
        ) : null}
      </View>
    </View>
  )
}

function CalendarInputPure(
  {
    label,
    value,
    onChange,
    isEndDate,
    returnKeyType,
    onSubmitEditing,
    locale,
    validRange,
    theme,
  }: {
    locale?: undefined | string
    label: string
    value: CalendarDate
    onChange: (d: Date | undefined) => any
    isEndDate?: boolean
    returnKeyType?: string
    onSubmitEditing?: () => any
    validRange: ValidRangeType | undefined
    theme: ReactNativePaper.Theme
  },
  ref: any
) {
  const [error, setError] = React.useState<null | string>(null)
  const formatter = React.useMemo(() => {
    return new Intl.DateTimeFormat(locale, {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    })
  }, [locale])

  const inputFormat = React.useMemo(() => {
    // TODO: something cleaner and more universal?
    const inputDate = formatter.format(new Date(2020, 10 - 1, 1))
    return inputDate
      .replace('2020', 'YYYY')
      .replace('10', 'MM')
      .replace('01', 'DD')
  }, [formatter])

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

    const finalDate = isEndDate
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
    if (isEndDate) {
      onChange(finalDate)
    } else {
      onChange(finalDate)
    }
  }
  return (
    <View style={styles.inputContainer}>
      <TextInputWithMask
        ref={ref}
        value={formattedValue}
        style={styles.input}
        label={`${label} (${inputFormat})`}
        keyboardType={'number-pad'}
        placeholder={inputFormat}
        mask={inputFormat}
        onChangeText={onChangeText}
        returnKeyType={returnKeyType}
        onSubmitEditing={onSubmitEditing}
        keyboardAppearance={theme.dark ? 'dark' : 'default'}
        error={!!error}
        theme={theme}
      />
      <HelperText type="error" visible={!!error} theme={theme}>
        {error}
      </HelperText>
    </View>
  )
}

const CalendarInput = React.forwardRef(CalendarInputPure)

const styles = StyleSheet.create({
  root: { padding: 12 },
  inner: { flexDirection: 'row' },
  inputContainer: { flex: 1 },
  input: { flex: 1 },
  separator: { width: 12 },
})

export default React.memo(CalendarEdit)
