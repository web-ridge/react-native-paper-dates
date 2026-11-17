import { memo, type ReactNode, useEffect, useRef, useState } from 'react'
import {
  StyleSheet,
  type TextInputInstance,
  useWindowDimensions,
  View,
} from 'react-native'
import { Text, useTheme } from 'react-native-paper'

import { useLatest } from '../shared/utils'
import { getTranslation } from '../translations/utils'
import AmPmSwitcher from './AmPmSwitcher'
import TimeInput from './TimeInput'
import {
  clockTypes,
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
      focused: clockTypes.hours,
      hours: newHours,
      minutes: minutesRef.current,
    })
  }
  const onSubmitStartInput = () => {
    endInput.current?.focus()
  }
  const startInput = useRef<TextInputInstance | null>(null)
  const theme = useTheme()

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

  const hourMinuteRow = (
    <View style={styles.inputContainer}>
      <TimeField
        caption={hourLabel}
        error={hourInvalid ? invalidTime : undefined}
        inputType={inputType}
        width={fieldWidth}
      >
        <TimeInput
          ref={startInput}
          accessibilityLabel={hourLabel}
          blurOnSubmit={false}
          clockType={clockTypes.hours}
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
        <View
          style={[styles.dot, { backgroundColor: theme.colors.onSurface }]}
        />
        <View style={styles.dotGap} />
        <View
          style={[styles.dot, { backgroundColor: theme.colors.onSurface }]}
        />
      </View>
      <TimeField
        caption={minuteLabel}
        error={minuteInvalid ? invalidTime : undefined}
        inputType={inputType}
        width={fieldWidth}
      >
        <TimeInput
          ref={endInput}
          accessibilityLabel={minuteLabel}
          clockType={clockTypes.minutes}
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
            hours={hours}
            inputType={inputType}
            locale={locale}
            onChange={onChangeHours}
          />
        </View>
      ) : null}
    </View>
  )

  if (useHorizontalAmPm) {
    return (
      <View style={styles.landscapeColumn}>
        {hourMinuteRow}
        <View style={styles.landscapeSwitcherSpacing}>
          <AmPmSwitcher
            direction="horizontal"
            hours={hours}
            inputType={inputType}
            locale={locale}
            onChange={onChangeHours}
          />
        </View>
      </View>
    )
  }

  return hourMinuteRow
}

function TimeField({
  caption,
  children,
  error,
  inputType,
  width,
}: {
  caption: string
  children: ReactNode
  error?: string
  inputType: PossibleInputTypes
  width: number
}) {
  const theme = useTheme()

  return (
    <View style={[styles.column, { width }]}>
      {children}
      {inputType === inputTypes.keyboard ? (
        <Text
          {...(error ? { accessibilityLiveRegion: 'polite' as const } : null)}
          maxFontSizeMultiplier={1.5}
          style={[
            styles.supportingText,
            {
              color: error ? theme.colors.error : theme.colors.onSurfaceVariant,
            },
          ]}
          variant="bodySmall"
        >
          {error ?? caption}
        </Text>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  column: {
    alignItems: 'center',
    flexDirection: 'column',
  },
  dot: {
    borderRadius: 4,
    height: 8,
    width: 8,
  },
  dotGap: {
    height: 6,
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
    marginTop: 7,
    textAlign: 'center',
  },
})

export default memo(TimeInputs)
