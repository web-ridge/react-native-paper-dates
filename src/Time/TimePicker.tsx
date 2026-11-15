import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { StyleSheet, useWindowDimensions, View } from 'react-native'

import { DisplayModeContext } from '../contexts/DisplayModeContext'
import AnalogClock from './AnalogClock'
import TimeInputs from './TimeInputs'
import {
  circleSize,
  inputTypes,
  periodSelectorGap,
  periodSelectorVerticalWidth,
  type PossibleClockTypes,
  type PossibleInputTypes,
  type TimeChange,
  timePickerUsesLandscape,
  timeSelectorFieldWidth,
  timeSeparatorWidth,
  toHourInputFormat,
  toHourOutputFormat,
} from './timeUtils'

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
  locale?: string
  minutes: number
  onChange: TimeChange
  onFocusInput: (type: PossibleClockTypes) => void
  use24HourClock?: boolean
}) {
  const dimensions = useWindowDimensions()
  const [displayMode, setDisplayMode] = useState<'AM' | 'PM' | undefined>(() =>
    hours >= 12 ? 'PM' : 'AM'
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

  const isLandscape = timePickerUsesLandscape(
    dimensions.width,
    dimensions.height,
    inputType
  )

  useEffect(() => {
    setDisplayMode(hours >= 12 ? 'PM' : 'AM')
  }, [hours])

  const clockWidth =
    inputType === inputTypes.picker ? circleSize + (isLandscape ? 64 : 0) : 0

  const displayModeValue = useMemo(
    () => ({ mode: displayMode, setMode: setDisplayMode }),
    [displayMode]
  )

  const fieldWidth = timeSelectorFieldWidth(inputType, is24Hour, isLandscape)
  const inputsWidth =
    fieldWidth * 2 +
    timeSeparatorWidth +
    (is24Hour || (isLandscape && inputType === inputTypes.picker)
      ? 0
      : periodSelectorGap + periodSelectorVerticalWidth)

  const onInnerChange = useCallback<TimeChange>(
    (params) => {
      onChange({
        ...params,
        hours: toHourOutputFormat(params.hours, hours, is24Hour),
      })
    },
    [onChange, hours, is24Hour]
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
              locale={locale}
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
