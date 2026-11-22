import { memo, type ReactNode, useEffect, useRef, useState } from 'react'
import {
  StyleSheet,
  type TextInputInstance,
  useWindowDimensions,
  View,
} from 'react-native'
import { useTheme } from 'react-native-paper'

import { useLatest, withAlpha } from '../shared/utils'
import { getTranslation } from '../translations/utils'
import AmPmSwitcher from './AmPmSwitcher'
import TimeInput from './TimeInput'
import TimePickerSupportingText, {
  timePickerErrorMessage,
} from './TimePickerSupportingText'
import TimeSeparator from './TimeSeparator'
import {
  clockTypes,
  disabledContentOpacity,
  inputTypes,
  periodSelectorGap,
  type PossibleClockTypes,
  type PossibleInputTypes,
  type TimeChange,
  timeInputFieldHeight,
  timePickerUsesLandscape,
  timeSelectorFieldWidth,
  timeSelectorHeight,
  toHourInputFormat,
  toHourOutputFormat,
} from './timeUtils'

function TimeInputs({
  disabled,
  error,
  errorText,
  focused,
  hours,
  inputFontSize,
  inputType,
  is24Hour,
  locale,
  minutes,
  onChange,
  onFocusInput,
  onInputInvalidChange,
}: {
  disabled?: boolean
  error?: boolean
  errorText?: string
  focused: PossibleClockTypes
  hours: number
  inputFontSize?: number
  inputType: PossibleInputTypes
  is24Hour: boolean
  locale?: string
  minutes: number
  onChange: TimeChange
  onFocusInput: (type: PossibleClockTypes) => void
  onInputInvalidChange?: (invalid: boolean) => void
}) {
  const dimensions = useWindowDimensions()
  const endInput = useRef<TextInputInstance | null>(null)
  const [hourInvalid, setHourInvalid] = useState(false)
  const [minuteInvalid, setMinuteInvalid] = useState(false)

  useEffect(() => {
    onInputInvalidChange?.(hourInvalid || minuteInvalid)
  }, [hourInvalid, minuteInvalid, onInputInvalidChange])

  const isLandscape = timePickerUsesLandscape(
    dimensions.width,
    dimensions.height,
    inputType
  )

  const minutesRef = useLatest(minutes)
  const onChangeHours = (newHours: number) => {
    onChange({
      hours: newHours,
      minutes: minutesRef.current,
    })
  }
  const onSubmitStartInput = () => {
    endInput.current?.focus()
  }
  const startInput = useRef<TextInputInstance | null>(null)
  const theme = useTheme()
  const dotColor = disabled
    ? withAlpha(theme.colors.onSurface, disabledContentOpacity)
    : theme.colors.onSurface

  const selectionColor = theme.dark
    ? theme.colors.primaryContainer
    : theme.colors.primary

  const useHorizontalAmPm =
    !is24Hour && isLandscape && inputType === inputTypes.picker

  const fieldHeight =
    inputType === inputTypes.keyboard
      ? timeInputFieldHeight
      : timeSelectorHeight

  const fieldWidth = timeSelectorFieldWidth(inputType, is24Hour, isLandscape)

  const hourLabel = getTranslation(locale, 'hour', 'Hour')
  const minuteLabel = getTranslation(locale, 'minute', 'Minute')
  const errorMessage = timePickerErrorMessage(
    error,
    errorText,
    hourInvalid || minuteInvalid,
    locale
  )
  const hourMinuteRow = (
    <View style={styles.inputContainer}>
      <TimeField width={fieldWidth}>
        <TimeInput
          ref={startInput}
          accessibilityLabel={hourLabel}
          blurOnSubmit={false}
          clockType={clockTypes.hours}
          disabled={disabled}
          error={error}
          inputFontSize={inputFontSize}
          inputType={inputType}
          is24Hour={is24Hour}
          maxFontSizeMultiplier={1.2}
          onChanged={(newHoursFromInput) => {
            onChange({
              hours: toHourOutputFormat(newHoursFromInput, hours, is24Hour),
              minutes,
            })
          }}
          onInvalidChange={setHourInvalid}
          onPress={onFocusInput}
          onSubmitEditing={onSubmitStartInput}
          pressed={focused === clockTypes.hours}
          returnKeyType={'next'}
          selectionColor={selectionColor}
          value={toHourInputFormat(hours, is24Hour)}
          width={fieldWidth}
        />
      </TimeField>
      <TimeSeparator color={dotColor} height={fieldHeight} />
      <TimeField width={fieldWidth}>
        <TimeInput
          ref={endInput}
          accessibilityLabel={minuteLabel}
          clockType={clockTypes.minutes}
          disabled={disabled}
          error={error}
          inputFontSize={inputFontSize}
          inputType={inputType}
          is24Hour={is24Hour}
          maxFontSizeMultiplier={1.2}
          onChanged={(newMinutesFromInput) => {
            onChange({
              hours,
              minutes: newMinutesFromInput,
            })
          }}
          onInvalidChange={setMinuteInvalid}
          onPress={onFocusInput}
          pressed={focused === clockTypes.minutes}
          selectionColor={selectionColor}
          value={minutes}
          width={fieldWidth}
        />
      </TimeField>
      {!is24Hour && !useHorizontalAmPm ? (
        <View style={styles.periodGap} />
      ) : null}
      {!is24Hour && !useHorizontalAmPm ? (
        <View style={styles.periodSwitcher}>
          <AmPmSwitcher
            direction="vertical"
            disabled={disabled}
            error={error}
            hours={hours}
            inputType={inputType}
            locale={locale}
            onChange={onChangeHours}
          />
        </View>
      ) : null}
    </View>
  )

  const fields = useHorizontalAmPm ? (
    <View style={styles.landscapeColumn}>
      {hourMinuteRow}
      <View style={styles.landscapeSwitcherSpacing}>
        <AmPmSwitcher
          direction="horizontal"
          disabled={disabled}
          error={error}
          hours={hours}
          inputType={inputType}
          locale={locale}
          onChange={onChangeHours}
        />
      </View>
    </View>
  ) : (
    hourMinuteRow
  )

  return (
    <View style={styles.fields}>
      {fields}
      <TimePickerSupportingText message={errorMessage} />
    </View>
  )
}

function TimeField({
  children,
  width,
}: {
  children: ReactNode
  width: number
}) {
  return <View style={[styles.column, { width }]}>{children}</View>
}

const styles = StyleSheet.create({
  column: {
    alignItems: 'center',
    flexDirection: 'column',
  },
  fields: {
    alignItems: 'flex-start',
  },
  inputContainer: {
    alignItems: 'flex-start',
    flexDirection: 'row',
  },
  landscapeColumn: {
    alignItems: 'flex-start',
    flexDirection: 'column',
  },
  landscapeSwitcherSpacing: {
    marginTop: 16,
  },
  periodGap: {
    width: periodSelectorGap,
  },
  periodSwitcher: {
    alignSelf: 'flex-start',
  },
})

export default memo(TimeInputs)
