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
  focused,
  hours,
  minutes,
}: {
  focused?: undefined | PossibleClockTypes
  hours: number
  minutes: number
}) => any

function TimePicker({
  focused,
  hours,
  inputFontSize,
  inputType,
  locale,
  minutes,
  onChange,
  onFocusInput,
  use24HourClock,
}: {
  focused: PossibleClockTypes
  hours: number
  inputFontSize?: number
  inputType: PossibleInputTypes
  locale?: undefined | string
  minutes: number
  onChange: onChangeFunc
  onFocusInput: (type: PossibleClockTypes) => any
  use24HourClock?: boolean
}) {
  const dimensions = useWindowDimensions()
  const isLandscape = dimensions.width > dimensions.height

  const [displayMode, setDisplayMode] = useState<'AM' | 'PM' | undefined>(
    undefined
  )

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

  const inputsWidth =
    96 * 2 +
    24 +
    (is24Hour || (isLandscape && inputType === inputTypes.picker) ? 0 : 12 + 52)

  const clockWidth =
    inputType === inputTypes.picker ? circleSize + (isLandscape ? 64 : 0) : 0

  const displayModeValue = useMemo(
    () => ({ mode: displayMode, setMode: setDisplayMode }),
    [displayMode]
  )

  return (
    <DisplayModeContext.Provider value={displayModeValue}>
      <View
        style={
          isLandscape
            ? [styles.rootLandscape, { width: inputsWidth + clockWidth }]
            : styles.rootPortrait
        }
      >
        <TimeInputs
          focused={focused}
          hours={hours}
          inputFontSize={inputFontSize}
          inputType={inputType}
          is24Hour={is24Hour}
          locale={locale}
          minutes={minutes}
          onChange={onChange}
          onFocusInput={onFocusInput}
        />
        {inputType === inputTypes.picker ? (
          <View
            style={[
              styles.clockContainer,
              isLandscape && styles.clockContainerLandscape,
            ]}
          >
            <AnalogClock
              focused={focused}
              hours={toHourInputFormat(hours, is24Hour)}
              is24Hour={is24Hour}
              minutes={minutes}
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
    paddingLeft: 12,
    paddingRight: 12,
    paddingTop: 36,
  },
  clockContainerLandscape: {
    paddingLeft: 64,
    paddingRight: 0,
    paddingTop: 0,
  },
  rootLandscape: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  rootPortrait: {
    alignItems: 'center',
    justifyContent: 'center',
  },
})

export default memo(TimePicker)
