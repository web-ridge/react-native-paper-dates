// @typescript-eslint/no-unused-vars
// WORK IN PROGRESS

import * as React from 'react'
import { View, StyleSheet } from 'react-native'
import { Text, useTheme } from 'react-native-paper'
import { useMemo } from 'react'

import {
  clockTypes,
  inputTypes,
  PossibleClockTypes,
  PossibleInputTypes,
} from './timeUtils'

import TimeInput from './TimeInput'
import Color from 'color'
import AmPmSwitcher from './AmPmSwitcher'
import AnalogClock, { circleSize } from './AnalogClock'

export default function TimePicker() {
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

  let date = new Date()

  const [inputType, setInputType] = React.useState<PossibleInputTypes>(
    inputTypes.picker
  )
  const [focused, setFocused] = React.useState<PossibleClockTypes>(
    clockTypes.hours
  )
  const [hours, setHours] = React.useState<number>(date.getHours())
  const [minutes, setMinutes] = React.useState<number>(date.getMinutes())

  const onFocusInput = (type: PossibleClockTypes) => setFocused(type)
  const onChange = React.useCallback(
    (params: {
      focused?: PossibleClockTypes | undefined
      hours: number
      minutes: number
    }) => {
      if (params.focused) {
        setFocused(params.focused)
      }

      setHours(params.hours)
      setMinutes(params.minutes)
    },
    [setFocused, setHours, setMinutes]
  )
  return (
    <View style={{ width: circleSize }}>
      <View style={styles.inputContainer}>
        <TimeInput
          placeholder={'11'}
          value={hours}
          clockType={clockTypes.hours}
          focused={focused === clockTypes.hours}
          onFocus={onFocusInput}
          inputType={inputType}
        />
        <Text selectable={false} style={styles.hoursAndMinutesSeparator}>
          :
        </Text>
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
      <AnalogClock
        hours={hours}
        minutes={minutes}
        focused={focused}
        is24Hour={is24Hour}
        onChange={onChange}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  spaceBetweenInputsAndSwitcher: { width: 12 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 35,
  },
  hoursAndMinutesSeparator: { fontSize: 40, marginLeft: 6, marginRight: 6 },
})
