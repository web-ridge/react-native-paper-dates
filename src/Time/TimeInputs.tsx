import { memo, type ReactNode, useEffect, useRef, useState } from 'react'
import {
  StyleSheet,
  type TextInputInstance,
  useWindowDimensions,
  View,
} from 'react-native'
import { Text, useTheme } from 'react-native-paper'

import { useLatest, withAlpha } from '../shared/utils'
import { getTranslation } from '../translations/utils'
import AmPmSwitcher from './AmPmSwitcher'
import TimeInput from './TimeInput'
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
  timeSeparatorWidth,
  toHourInputFormat,
  toHourOutputFormat,
} from './timeUtils'

function TimeInputs({
  disabled,
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
    // Keep the focused field; switching AM/PM only changes hours.
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
  const invalidTime = getTranslation(locale, 'invalidTime', 'Invalid time')
  const minuteLabel = getTranslation(locale, 'minute', 'Minute')

  const error = hourInvalid || minuteInvalid ? invalidTime : undefined
  const hourMinuteRow = (
    <View style={styles.inputContainer}>
      <TimeField width={fieldWidth}>
        <TimeInput
          ref={startInput}
          accessibilityLabel={hourLabel}
          blurOnSubmit={false}
          clockType={clockTypes.hours}
          disabled={disabled}
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
      <View style={[styles.separator, { height: fieldHeight }]}>
        <Text
          accessible={false}
          importantForAccessibility="no"
          maxFontSizeMultiplier={1.2}
          style={[theme.fonts.displayLarge, styles.colon, { color: dotColor }]}
        >
          :
        </Text>
      </View>
      <TimeField width={fieldWidth}>
        <TimeInput
          ref={endInput}
          accessibilityLabel={minuteLabel}
          clockType={clockTypes.minutes}
          disabled={disabled}
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
      {error ? (
        <Text
          accessibilityLiveRegion="polite"
          maxFontSizeMultiplier={1.5}
          style={[styles.supportingText, { color: theme.colors.error }]}
          variant="bodySmall"
        >
          {error}
        </Text>
      ) : null}
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
  colon: {
    textAlign: 'center',
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
  separator: {
    alignItems: 'center',
    justifyContent: 'center',
    width: timeSeparatorWidth,
  },
  supportingText: {
    alignSelf: 'stretch',
    marginTop: 7,
    textAlign: 'center',
  },
})

export default memo(TimeInputs)
