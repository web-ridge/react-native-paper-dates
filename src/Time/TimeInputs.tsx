// @typescript-eslint/no-unused-vars
// WORK IN PROGRESS

import * as React from 'react'
import {
  StyleSheet,
  TextInput as TextInputNative,
  useWindowDimensions,
  View,
} from 'react-native'

import {
  clockTypes,
  PossibleClockTypes,
  PossibleInputTypes,
  toHourInputFormat,
  toHourOutputFormat,
} from './timeUtils'
import TimeInput from './TimeInput'
import AmPmSwitcher from './AmPmSwitcher'
import { useLatest } from '../utils'

function TimeInputs({
  hours,
  minutes,
  onFocusInput,
  focused,
  inputType,
  onChange,
  is24Hour,
  theme,
}: {
  inputType: PossibleInputTypes
  focused: PossibleClockTypes
  hours: number
  minutes: number
  onFocusInput: (type: PossibleClockTypes) => any
  onChange: ({
    hours,
    minutes,
    focused,
  }: {
    hours: number
    minutes: number
    focused?: undefined | PossibleClockTypes
  }) => any
  is24Hour: boolean
  theme: ReactNativePaper.Theme
}) {
  const startInput = React.useRef<TextInputNative | null>(null)
  const endInput = React.useRef<TextInputNative | null>(null)
  const dimensions = useWindowDimensions()
  const isLandscape = dimensions.width > dimensions.height

  const onSubmitStartInput = React.useCallback(() => {
    if (endInput.current) {
      endInput.current.focus()
    }
  }, [endInput])

  const onSubmitEndInput = React.useCallback(() => {
    // TODO: close modal and persist time
  }, [])

  const minutesRef = useLatest(minutes)
  const onChangeHours = React.useCallback(
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
    <View
      style={[
        styles.inputContainer,
        isLandscape && styles.inputContainerLandscape,
      ]}
    >
      <TimeInput
        ref={startInput}
        placeholder={'00'}
        value={toHourInputFormat(hours, is24Hour)}
        clockType={clockTypes.hours}
        pressed={focused === clockTypes.hours}
        onPress={onFocusInput}
        inputType={inputType}
        returnKeyType={'next'}
        onSubmitEditing={onSubmitStartInput}
        blurOnSubmit={false}
        onChanged={(newHoursFromInput) => {
          let newHours = toHourOutputFormat(newHoursFromInput, hours, is24Hour)
          if (newHoursFromInput > 24) {
            newHours = 24
          }
          onChange({
            hours: newHours,
            minutes,
          })
        }}
        theme={theme}
        // onChangeText={onChangeStartInput}
      />
      <View style={styles.hoursAndMinutesSeparator}>
        <View style={styles.spaceDot} />
        <View style={[styles.dot, { backgroundColor: theme.colors.text }]} />
        <View style={styles.betweenDot} />
        <View style={[styles.dot, { backgroundColor: theme.colors.text }]} />
        <View style={styles.spaceDot} />
      </View>
      <TimeInput
        ref={endInput}
        placeholder={'00'}
        value={minutes}
        clockType={clockTypes.minutes}
        pressed={focused === clockTypes.minutes}
        onPress={onFocusInput}
        inputType={inputType}
        onSubmitEditing={onSubmitEndInput}
        onChanged={(newMinutesFromInput) => {
          let newMinutes = newMinutesFromInput
          if (newMinutesFromInput > 60) {
            newMinutes = 60
          }
          onChange({
            hours,
            minutes: newMinutes,
          })
        }}
        theme={theme}
      />
      {!is24Hour && (
        <>
          <View style={styles.spaceBetweenInputsAndSwitcher} />
          <AmPmSwitcher hours={hours} onChange={onChangeHours} theme={theme} />
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  spaceBetweenInputsAndSwitcher: { width: 12 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputContainerLandscape: {
    flex: 1,
  },
  hoursAndMinutesSeparator: {
    fontSize: 65,
    width: 24,
    alignItems: 'center',
  },
  spaceDot: {
    flex: 1,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 7 / 2,
  },
  betweenDot: {
    height: 12,
  },
})

export default React.memo(TimeInputs)
