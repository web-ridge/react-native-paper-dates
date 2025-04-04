import { StyleSheet, useWindowDimensions, View } from 'react-native'

import {
  circleSize,
  inputTypes,
  PossibleClockTypes,
  PossibleInputTypes,
  toHourInputFormat,
  toHourOutputFormat,
} from './timeUtils'

import AnalogClock from './AnalogClock'
import TimeInputs from './TimeInputs'
import { DisplayModeContext } from '../contexts/DisplayModeContext'
import { memo, useCallback, useEffect, useMemo, useState } from 'react'

type onChangeFunc = ({
  hours,
  minutes,
  focused,
}: {
  hours: number
  minutes: number
  focused?: undefined | PossibleClockTypes
}) => any

function TimePicker({
  hours,
  minutes,
  onFocusInput,
  focused,
  inputType,
  onChange,
  locale,
  use24HourClock,
  inputFontSize,
}: {
  locale?: undefined | string
  inputType: PossibleInputTypes
  focused: PossibleClockTypes
  hours: number
  minutes: number
  onFocusInput: (type: PossibleClockTypes) => any
  onChange: onChangeFunc
  use24HourClock?: boolean
  inputFontSize?: number
}) {
  const dimensions = useWindowDimensions()
  const isLandscape = dimensions.width > dimensions.height

  const [displayMode, setDisplayMode] = useState<'AM' | 'PM' | undefined>(
    undefined
  )

  // method to check whether we have 24 hours in clock or 12
  const is24Hour = useMemo(() => {
    if (use24HourClock !== undefined) {
      return use24HourClock
    }
    const formatter = new Intl.DateTimeFormat(locale, {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'UTC',
    })
    const formatted = formatter.format(new Date(Date.UTC(2020, 1, 1, 23)))
    return formatted.includes('23')
  }, [locale, use24HourClock])

  // Initialize display Mode according the hours value
  useEffect(() => {
    if (hours >= 12) {
      setDisplayMode('PM')
    } else {
      setDisplayMode('AM')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onInnerChange = useCallback<onChangeFunc>(
    (params) => {
      params.hours = toHourOutputFormat(params.hours, hours, is24Hour)
      onChange(params)
    },
    [onChange, hours, is24Hour]
  )

  return (
    <DisplayModeContext.Provider
      value={{ mode: displayMode, setMode: setDisplayMode }}
    >
      <View
        style={
          isLandscape
            ? [
                styles.rootLandscape,
                {
                  width:
                    24 * 3 +
                    96 * 2 +
                    52 +
                    (inputType === inputTypes.picker
                      ? circleSize
                      : -circleSize),
                },
              ]
            : styles.rootPortrait
        }
      >
        <TimeInputs
          inputType={inputType}
          inputFontSize={inputFontSize}
          hours={hours}
          minutes={minutes}
          is24Hour={is24Hour}
          onChange={onChange}
          onFocusInput={onFocusInput}
          focused={focused}
          locale={locale}
        />
        {inputType === inputTypes.picker ? (
          <View style={styles.clockContainer}>
            <AnalogClock
              hours={toHourInputFormat(hours, is24Hour)}
              minutes={minutes}
              focused={focused}
              is24Hour={is24Hour}
              onChange={onInnerChange}
            />
          </View>
        ) : null}
      </View>
    </DisplayModeContext.Provider>
  )
}

const styles = StyleSheet.create({
  clockContainer: {
    paddingTop: 36,
    paddingLeft: 12,
    paddingRight: 12,
  },
  rootLandscape: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rootPortrait: {
    alignItems: 'center',
    justifyContent: 'center',
  },
})

export default memo(TimePicker)
