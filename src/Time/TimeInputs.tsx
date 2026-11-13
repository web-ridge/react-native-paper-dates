import { StyleSheet, useWindowDimensions, View } from 'react-native'
import type { TextInputInstance } from 'react-native'
import { Text, useTheme } from 'react-native-paper'

import {
  clockTypes,
  inputTypes,
  PossibleClockTypes,
  PossibleInputTypes,
  toHourInputFormat,
  toHourOutputFormat,
} from './timeUtils'
import TimeInput from './TimeInput'
import AmPmSwitcher from './AmPmSwitcher'
import { themeColor, useLatest } from '../shared/utils'
import Color from 'color'
import { getTranslation } from '../translations/utils'
import { memo, useCallback, useRef } from 'react'
import { sharedStyles } from '../shared/styles'

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
  onChange: (hoursMinutesAndFocused: {
    focused?: undefined | PossibleClockTypes
    hours: number
    minutes: number
  }) => any
  onFocusInput: (type: PossibleClockTypes) => any
}) {
  const theme = useTheme()

  const startInput = useRef<TextInputInstance | null>(null)
  const endInput = useRef<TextInputInstance | null>(null)
  const dimensions = useWindowDimensions()
  const isLandscape = dimensions.width > dimensions.height
  const useHorizontalAmPm =
    !is24Hour && isLandscape && inputType === inputTypes.picker
  const minutesRef = useLatest(minutes)

  const onSubmitStartInput = useCallback(() => {
    if (endInput.current) {
      endInput.current.focus()
    }
  }, [endInput])

  const onSubmitEndInput = useCallback(() => {}, [])

  const onChangeHours = useCallback(
    (newHours: number) => {
      onChange({
        hours: newHours,
        minutes: minutesRef.current,
        focused: clockTypes.hours,
      })
    },
    [onChange, minutesRef]
  )

  const hourMinuteRow = (
    <View style={styles.inputContainer}>
      <View style={styles.column}>
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
          selectionColor={
            theme.dark
              ? Color(themeColor(theme.colors.primary)).darken(0.2).hex()
              : themeColor(theme.colors.primary)
          }
          value={toHourInputFormat(hours, is24Hour)}
        />
        {inputType === 'keyboard' ? (
          <Text maxFontSizeMultiplier={1.5} variant="bodySmall">
            {getTranslation(locale, 'hour', 'Hour')}
          </Text>
        ) : null}
      </View>
      <View
        style={[
          styles.hoursAndMinutesSeparator,
          // eslint-disable-next-line react-native/no-inline-styles
          { marginBottom: inputType === 'keyboard' ? 16 : 0 },
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
      <View style={styles.column}>
        <TimeInput
          clockType={clockTypes.minutes}
          inputFontSize={inputFontSize}
          inputType={inputType}
          maxFontSizeMultiplier={1.2}
          onChanged={(newMinutesFromInput) => {
            let newMinutes = newMinutesFromInput
            if (newMinutesFromInput > 59) {
              newMinutes = 59
            }
            onChange({
              hours,
              minutes: newMinutes,
            })
          }}
          onPress={onFocusInput}
          onSubmitEditing={onSubmitEndInput}
          placeholder={'00'}
          pressed={focused === clockTypes.minutes}
          ref={endInput}
          selectionColor={
            theme.dark
              ? Color(themeColor(theme.colors.primary)).darken(0.2).hex()
              : themeColor(theme.colors.primary)
          }
          value={minutes}
        />
        {inputType === 'keyboard' ? (
          <Text maxFontSizeMultiplier={1.5} variant="bodySmall">
            {getTranslation(locale, 'minute', 'Minute')}
          </Text>
        ) : null}
      </View>
      {!is24Hour && !useHorizontalAmPm ? (
        <>
          <View style={styles.spaceBetweenInputsAndSwitcher} />
          <AmPmSwitcher
            direction="vertical"
            hours={hours}
            inputType={inputType}
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
            onChange={onChangeHours}
          />
        </View>
      </View>
    )
  }

  return hourMinuteRow
}

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

export default memo(TimeInputs)
