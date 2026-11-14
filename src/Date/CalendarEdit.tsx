import { Keyboard, StyleSheet, View } from 'react-native'
import type { TextInputInstance } from 'react-native'

import type { LocalState } from './DatePickerModalContent'
import type { DisableWeekDaysType, ModeType, ValidRangeType } from './types'

import DatePickerInputWithoutModal from './DatePickerInputWithoutModal'
import { weekdaySpan, weekdaySpanOvershoot } from './weekdayColumns'
import { memo, useCallback, useEffect, useRef } from 'react'
import { useTheme } from 'react-native-paper'
import { sharedStyles } from '../shared/styles'

function CalendarEdit({
  collapsed,
  disableWeekDays,
  endLabel = 'End',
  inputEnabled,
  label = '',
  locale,
  mode,
  onChange,
  placeholder,
  startLabel = 'Start',
  state,
  validRange,
  withDateFormatInLabel,
}: {
  collapsed: boolean
  disableWeekDays?: DisableWeekDaysType
  endLabel?: string
  inputEnabled?: boolean
  label?: string
  locale: string
  mode: ModeType
  onChange: (s: LocalState) => void
  placeholder?: string
  startLabel?: string
  state: LocalState
  validRange: ValidRangeType | undefined
  withDateFormatInLabel?: boolean
}) {
  const dateInput = useRef<TextInputInstance | null>(null)
  const endInput = useRef<TextInputInstance | null>(null)
  const startInput = useRef<TextInputInstance | null>(null)
  const theme = useTheme()
  const surfaceColor = theme.colors.elevation.level3
  const inputStyle = { backgroundColor: surfaceColor }
  const inputTheme = { colors: { background: surfaceColor } }

  useEffect(() => {
    if (collapsed) {
      Keyboard.dismiss()
    }

    const inputsToBlur = [
      dateInput.current,
      startInput.current,
      endInput.current,
    ].filter((n) => n) as TextInputInstance[]

    const inputsToFocus = [dateInput.current, startInput.current].filter(
      (n) => n
    ) as TextInputInstance[]

    if (collapsed) {
      inputsToBlur.forEach((ip) => ip.blur())
    } else {
      inputsToFocus.forEach((ip) => ip.focus())
    }
  }, [mode, startInput, endInput, dateInput, collapsed])

  const onSubmitEndInput = useCallback(() => {}, [])

  const onSubmitInput = useCallback(() => {}, [])

  const onSubmitStartInput = useCallback(() => {
    if (endInput.current) {
      endInput.current.focus()
    }
  }, [endInput])

  return (
    <View style={styles.root}>
      <View style={weekdaySpan(disableWeekDays)}>
        <View style={weekdaySpanOvershoot}>
          {mode === 'single' ? (
            <DatePickerInputWithoutModal
              autoComplete={'off'}
              inputEnabled={inputEnabled}
              inputMode="start"
              label={label}
              locale={locale}
              onChange={(date) => onChange({ ...state, date })}
              onSubmitEditing={onSubmitInput}
              placeholder={placeholder}
              ref={dateInput}
              style={inputStyle}
              theme={inputTheme}
              validRange={validRange}
              value={state.date}
              variant="outlined"
              withDateFormatInLabel={withDateFormatInLabel}
              withModal={false}
            />
          ) : null}
          {mode === 'range' ? (
            <View style={sharedStyles.flexDirectionRow}>
              <View style={sharedStyles.root}>
                <DatePickerInputWithoutModal
                  autoComplete={'off'}
                  inputEnabled={inputEnabled}
                  inputMode="start"
                  label={startLabel}
                  locale={locale}
                  onChange={(startDate) => onChange({ ...state, startDate })}
                  onSubmitEditing={onSubmitStartInput}
                  placeholder={placeholder}
                  ref={startInput}
                  returnKeyType={'next'}
                  style={inputStyle}
                  theme={inputTheme}
                  validRange={validRange}
                  value={state.startDate}
                  variant="outlined"
                  withDateFormatInLabel={withDateFormatInLabel}
                  withModal={false}
                />
              </View>
              <View style={styles.separator} />
              <View style={sharedStyles.root}>
                <DatePickerInputWithoutModal
                  autoComplete="off"
                  inputEnabled={inputEnabled}
                  inputMode="end"
                  label={endLabel}
                  locale={locale}
                  onChange={(endDate) => onChange({ ...state, endDate })}
                  onSubmitEditing={onSubmitEndInput}
                  placeholder={placeholder}
                  ref={endInput}
                  style={inputStyle}
                  theme={inputTheme}
                  validRange={validRange}
                  value={state.endDate}
                  variant="outlined"
                  withDateFormatInLabel={withDateFormatInLabel}
                  withModal={false}
                />
              </View>
            </View>
          ) : null}
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    paddingVertical: 12,
    width: '100%',
  },
  separator: {
    width: 12,
  },
})

export default memo(CalendarEdit)
