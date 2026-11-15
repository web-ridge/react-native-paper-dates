import { Keyboard, StyleSheet, View } from 'react-native'
import type { TextInputInstance } from 'react-native'

import type { LocalState } from './DatePickerModalContent'
import type { DisableWeekDaysType, ModeType, ValidRangeType } from './types'

import DatePickerInputWithoutModal from './DatePickerInputWithoutModal'
import { weekdaySpan, weekdaySpanOvershoot } from './weekdayColumns'
import { memo, type Ref, useCallback, useEffect, useRef } from 'react'
import { useTheme } from 'react-native-paper'
import { sharedStyles } from '../shared/styles'
import type { TextInputHandles } from 'react-native-paper'

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

  const onSubmitStartInput = useCallback(() => {
    endInput.current?.focus()
  }, [endInput])

  return (
    <View style={styles.root}>
      <View style={weekdaySpan(disableWeekDays)}>
        <View style={weekdaySpanOvershoot}>
          {mode === 'single' ? (
            <CalendarDateField
              inputEnabled={inputEnabled}
              inputMode="start"
              inputRef={dateInput}
              label={label}
              locale={locale}
              onChange={(date) => onChange({ ...state, date })}
              placeholder={placeholder}
              surfaceColor={surfaceColor}
              validRange={validRange}
              value={state.date}
              withDateFormatInLabel={withDateFormatInLabel}
            />
          ) : null}
          {mode === 'range' ? (
            <View style={sharedStyles.flexDirectionRow}>
              <View style={sharedStyles.root}>
                <CalendarDateField
                  inputEnabled={inputEnabled}
                  inputMode="start"
                  inputRef={startInput}
                  label={startLabel}
                  locale={locale}
                  onChange={(startDate) => onChange({ ...state, startDate })}
                  onSubmitEditing={onSubmitStartInput}
                  placeholder={placeholder}
                  returnKeyType="next"
                  surfaceColor={surfaceColor}
                  validRange={validRange}
                  value={state.startDate}
                  withDateFormatInLabel={withDateFormatInLabel}
                />
              </View>
              <View style={styles.separator} />
              <View style={sharedStyles.root}>
                <CalendarDateField
                  inputEnabled={inputEnabled}
                  inputMode="end"
                  inputRef={endInput}
                  label={endLabel}
                  locale={locale}
                  onChange={(endDate) => onChange({ ...state, endDate })}
                  placeholder={placeholder}
                  surfaceColor={surfaceColor}
                  validRange={validRange}
                  value={state.endDate}
                  withDateFormatInLabel={withDateFormatInLabel}
                />
              </View>
            </View>
          ) : null}
        </View>
      </View>
    </View>
  )
}

function CalendarDateField({
  inputEnabled,
  inputMode,
  inputRef,
  label,
  locale,
  onChange,
  onSubmitEditing,
  placeholder,
  returnKeyType,
  surfaceColor,
  validRange,
  value,
  withDateFormatInLabel,
}: {
  inputEnabled?: boolean
  inputMode: 'start' | 'end'
  inputRef: Ref<TextInputHandles>
  label?: string
  locale: string
  onChange: (date: Date | undefined) => void
  onSubmitEditing?: () => void
  placeholder?: string
  returnKeyType?: 'next'
  surfaceColor: string
  validRange: ValidRangeType | undefined
  value: LocalState['date']
  withDateFormatInLabel?: boolean
}) {
  const inputTheme = { colors: { background: surfaceColor } }

  return (
    <DatePickerInputWithoutModal
      autoComplete="off"
      inputEnabled={inputEnabled}
      inputMode={inputMode}
      label={label}
      locale={locale}
      onChange={onChange}
      onSubmitEditing={onSubmitEditing}
      placeholder={placeholder}
      ref={inputRef}
      returnKeyType={returnKeyType}
      theme={inputTheme}
      validRange={validRange}
      value={value}
      variant="outlined"
      withDateFormatInLabel={withDateFormatInLabel}
      withModal={false}
    />
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
