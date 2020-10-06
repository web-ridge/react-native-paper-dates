// @typescript-eslint/no-unused-vars
// WORK IN PROGRESS

import * as React from 'react'
import { View, StyleSheet, useWindowDimensions } from 'react-native'
import { useTheme } from 'react-native-paper'

import {
  clockTypes,
  inputTypes,
  PossibleClockTypes,
  PossibleInputTypes,
} from './timeUtils'
import TimeInput from './TimeInput'
import AmPmSwitcher from './AmPmSwitcher'
import AnalogClock, { circleSize } from './AnalogClock'

function TimePicker({
  hours,
  minutes,
  onFocusInput,
  focused,
  inputType,
  onChange,
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
}) {
  const dimensions = useWindowDimensions()
  const isLandscape = dimensions.width > dimensions.height
  console.log({ isLandscape })
  const theme = useTheme()
  // method to check whether we have 24 hours in clock or 12
  const is24Hour = React.useMemo(() => {
    const formatter = new Intl.DateTimeFormat(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'UTC',
    })
    const formatted = formatter.format(new Date(Date.UTC(2020, 1, 1, 23)))
    return formatted.includes('23')
  }, [])

  return (
    <View style={isLandscape ? styles.rootLandscape : styles.rootPortrait}>
      <View
        style={[
          styles.inputContainer,
          isLandscape && styles.inputContainerLandscape,
        ]}
      >
        <TimeInput
          placeholder={'11'}
          value={hours}
          clockType={clockTypes.hours}
          focused={focused === clockTypes.hours}
          onFocus={onFocusInput}
          inputType={inputType}
        />
        <View style={styles.hoursAndMinutesSeparator}>
          <View style={styles.spaceDot} />
          <View style={[styles.dot, { backgroundColor: theme.colors.text }]} />
          <View style={styles.betweenDot} />
          <View style={[styles.dot, { backgroundColor: theme.colors.text }]} />
          <View style={styles.spaceDot} />
        </View>
        <TimeInput
          placeholder={'10'}
          value={minutes}
          clockType={clockTypes.minutes}
          focused={focused === clockTypes.minutes}
          onFocus={onFocusInput}
          inputType={inputType}
        />
        {!is24Hour && (
          <>
            <View style={styles.spaceBetweenInputsAndSwitcher} />
            <AmPmSwitcher />
          </>
        )}
      </View>
      {inputType === inputTypes.picker ? (
        <View style={styles.clockContainer}>
          <AnalogClock
            hours={hours}
            minutes={minutes}
            focused={focused}
            is24Hour={is24Hour}
            onChange={onChange}
          />
        </View>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  rootLandscape: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: 24 * 3 + 96 * 2 + 52 + circleSize,
  },
  rootPortrait: {},
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
  clockContainer: { paddingTop: 36, paddingLeft: 12, paddingRight: 12 },
})

export default React.memo(TimePicker)
