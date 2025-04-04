import {
  StyleSheet,
  TextInput as TextInputNative,
  useWindowDimensions,
  View,
} from 'react-native'
import { MD2Theme, Text, useTheme } from 'react-native-paper'

import {
  clockTypes,
  PossibleClockTypes,
  PossibleInputTypes,
  toHourInputFormat,
  toHourOutputFormat,
} from './timeUtils'
import TimeInput from './TimeInput'
import AmPmSwitcher from './AmPmSwitcher'
import { useLatest } from '../shared/utils'
import Color from 'color'
import { getTranslation } from '../translations/utils'
import { memo, useCallback, useRef } from 'react'
import { sharedStyles } from '../shared/styles'

function TimeInputs({
  hours,
  minutes,
  onFocusInput,
  focused,
  inputType,
  onChange,
  is24Hour,
  inputFontSize,
  locale,
}: {
  inputType: PossibleInputTypes
  focused: PossibleClockTypes
  hours: number
  minutes: number
  onFocusInput: (type: PossibleClockTypes) => any
  onChange: (hoursMinutesAndFocused: {
    hours: number
    minutes: number
    focused?: undefined | PossibleClockTypes
  }) => any
  is24Hour: boolean
  inputFontSize?: number
  locale?: string
}) {
  const theme = useTheme()

  const startInput = useRef<TextInputNative | null>(null)
  const endInput = useRef<TextInputNative | null>(null)
  const dimensions = useWindowDimensions()
  const isLandscape = dimensions.width > dimensions.height
  const minutesRef = useLatest(minutes)

  const onSubmitStartInput = useCallback(() => {
    if (endInput.current) {
      endInput.current.focus()
    }
  }, [endInput])

  const onSubmitEndInput = useCallback(() => {
    // TODO: close modal and persist time
  }, [])

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

  return (
    <View style={[styles.inputContainer, isLandscape && sharedStyles.root]}>
      <View style={styles.column}>
        <TimeInput
          ref={startInput}
          inputFontSize={inputFontSize}
          placeholder={'00'}
          value={toHourInputFormat(hours, is24Hour)}
          clockType={clockTypes.hours}
          pressed={focused === clockTypes.hours}
          onPress={onFocusInput}
          inputType={inputType}
          maxFontSizeMultiplier={1.2}
          selectionColor={
            theme.dark
              ? Color(theme.colors.primary).darken(0.2).hex()
              : theme.colors.primary
          }
          returnKeyType={'next'}
          onSubmitEditing={onSubmitStartInput}
          blurOnSubmit={false}
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
              backgroundColor: theme?.isV3
                ? theme.colors.onSurface
                : (theme as any as MD2Theme).colors.text,
            },
          ]}
        />
        <View style={styles.betweenDot} />
        <View
          style={[
            styles.dot,
            {
              backgroundColor: theme?.isV3
                ? theme.colors.onSurface
                : (theme as any as MD2Theme).colors.text,
            },
          ]}
        />
        <View style={sharedStyles.root} />
      </View>
      <View style={styles.column}>
        <TimeInput
          ref={endInput}
          inputFontSize={inputFontSize}
          placeholder={'00'}
          value={minutes}
          clockType={clockTypes.minutes}
          pressed={focused === clockTypes.minutes}
          onPress={onFocusInput}
          inputType={inputType}
          maxFontSizeMultiplier={1.2}
          selectionColor={
            theme.dark
              ? Color(theme.colors.primary).darken(0.2).hex()
              : theme.colors.primary
          }
          onSubmitEditing={onSubmitEndInput}
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
        />
        {inputType === 'keyboard' ? (
          <Text maxFontSizeMultiplier={1.5} variant="bodySmall">
            {getTranslation(locale, 'minute', 'Minute')}
          </Text>
        ) : null}
      </View>
      {!is24Hour && (
        <>
          <View style={styles.spaceBetweenInputsAndSwitcher} />
          <AmPmSwitcher
            hours={hours}
            onChange={onChangeHours}
            inputType={inputType}
          />
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  betweenDot: {
    height: 12,
  },
  column: {
    flexDirection: 'column',
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 7 / 2,
  },
  hoursAndMinutesSeparator: {
    fontSize: 65,
    width: 24,
    alignItems: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spaceBetweenInputsAndSwitcher: {
    width: 12,
  },
})

export default memo(TimeInputs)
