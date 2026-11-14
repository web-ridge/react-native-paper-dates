import { StyleSheet, useWindowDimensions, View } from 'react-native'
import type { TextInputInstance } from 'react-native'
import { Text, useTheme } from 'react-native-paper'

import {
  clockTypes,
  inputTypes,
  type PossibleClockTypes,
  type PossibleInputTypes,
  type TimeChange,
  toHourInputFormat,
  toHourOutputFormat,
} from './timeUtils'
import TimeInput from './TimeInput'
import AmPmSwitcher from './AmPmSwitcher'
import { darkenColor, themeColor, useLatest } from '../shared/utils'
import { getTranslation } from '../translations/utils'
import { memo, type ReactNode, useCallback, useRef } from 'react'
import { sharedStyles } from '../shared/styles'

const styles = StyleSheet.create({
  betweenDot: {
    height: 12,
  },
  column: {
    flexDirection: 'column',
  },
  dot: {
    borderRadius: 7 / 2,
    height: 7,
    width: 7,
  },
  hoursAndMinutesSeparator: {
    alignItems: 'center',
    fontSize: 65,
    width: 24,
  },
  inputContainer: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  landscapeColumn: {
    alignItems: 'flex-start',
    flexDirection: 'column',
  },
  landscapeSwitcherSpacing: {
    marginTop: 16,
  },
  spaceBetweenInputsAndSwitcher: {
    width: 12,
  },
})

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
}) {
  const dimensions = useWindowDimensions()

  const endInput = useRef<TextInputInstance | null>(null)

  const isLandscape = dimensions.width > dimensions.height

  const minutesRef = useLatest(minutes)

  const onChangeHours = useCallback(
    (newHours: number) => {
      onChange({
        focused: clockTypes.hours,
        hours: newHours,
        minutes: minutesRef.current,
      })
    },
    [onChange, minutesRef]
  )

  const onSubmitStartInput = useCallback(() => {
    endInput.current?.focus()
  }, [endInput])

  const startInput = useRef<TextInputInstance | null>(null)

  const theme = useTheme()

  const selectionColor = theme.dark
    ? darkenColor(themeColor(theme.colors.primary), 0.2)
    : themeColor(theme.colors.primary)

  const useHorizontalAmPm =
    !is24Hour && isLandscape && inputType === inputTypes.picker

  const hourMinuteRow = (
    <View style={styles.inputContainer}>
      <TimeField
        caption={getTranslation(locale, 'hour', 'Hour')}
        inputType={inputType}
      >
        <TimeInput
          blurOnSubmit={false}
          clockType={clockTypes.hours}
          inputFontSize={inputFontSize}
          inputType={inputType}
          maxFontSizeMultiplier={1.2}
          onChanged={(newHoursFromInput) => {
            let newHours = toHourOutputFormat(
              newHoursFromInput,
              hours,
              is24Hour
            )
            if (newHoursFromInput > 24) {
              newHours = 24
            }
            onChange({
              hours: newHours,
              minutes,
            })
          }}
          onPress={onFocusInput}
          onSubmitEditing={onSubmitStartInput}
          placeholder={'00'}
          pressed={focused === clockTypes.hours}
          ref={startInput}
          returnKeyType={'next'}
          selectionColor={selectionColor}
          value={toHourInputFormat(hours, is24Hour)}
        />
      </TimeField>
      <View
        style={[
          styles.hoursAndMinutesSeparator,
          // eslint-disable-next-line react-native/no-inline-styles
          { marginBottom: inputType === inputTypes.keyboard ? 16 : 0 },
        ]}
      >
        <View style={sharedStyles.root} />
        <View
          style={[
            styles.dot,
            {
              backgroundColor: theme.colors.onSurface,
            },
          ]}
        />
        <View style={styles.betweenDot} />
        <View
          style={[
            styles.dot,
            {
              backgroundColor: theme.colors.onSurface,
            },
          ]}
        />
        <View style={sharedStyles.root} />
      </View>
      <TimeField
        caption={getTranslation(locale, 'minute', 'Minute')}
        inputType={inputType}
      >
        <TimeInput
          clockType={clockTypes.minutes}
          inputFontSize={inputFontSize}
          inputType={inputType}
          maxFontSizeMultiplier={1.2}
          onChanged={(newMinutesFromInput) => {
            onChange({
              hours,
              minutes: Math.min(newMinutesFromInput, 59),
            })
          }}
          onPress={onFocusInput}
          placeholder={'00'}
          pressed={focused === clockTypes.minutes}
          ref={endInput}
          selectionColor={selectionColor}
          value={minutes}
        />
      </TimeField>
      {!is24Hour && !useHorizontalAmPm ? (
        <>
          <View style={styles.spaceBetweenInputsAndSwitcher} />
          <AmPmSwitcher
            direction="vertical"
            hours={hours}
            inputType={inputType}
            locale={locale}
            onChange={onChangeHours}
          />
        </>
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
  inputType,
}: {
  caption: string
  children: ReactNode
  inputType: PossibleInputTypes
}) {
  return (
    <View style={styles.column}>
      {children}
      {inputType === inputTypes.keyboard ? (
        <Text maxFontSizeMultiplier={1.5} variant="bodySmall">
          {caption}
        </Text>
      ) : null}
    </View>
  )
}

export default memo(TimeInputs)
