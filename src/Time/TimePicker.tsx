import { memo, useEffect, useState } from 'react'
import { StyleSheet, useWindowDimensions, View } from 'react-native'

import { DisplayModeContext } from '../contexts/DisplayModeContext'
import { dateTimeFormat } from '../shared/intl'
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
  onInputInvalidChange,
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
  onInputInvalidChange?: (invalid: boolean) => void
  use24HourClock?: boolean
}) {
  const dimensions = useWindowDimensions()
  const [displayMode, setDisplayMode] = useState<'AM' | 'PM' | undefined>(() =>
    hours >= 12 ? 'PM' : 'AM'
  )
  let is24Hour = use24HourClock
  if (is24Hour === undefined) {
    const formatter = dateTimeFormat(locale, {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'UTC',
    })
    is24Hour = formatter
      .format(new Date(Date.UTC(2020, 1, 1, 23)))
      .includes('23')
  }

  const isLandscape = timePickerUsesLandscape(
    dimensions.width,
    dimensions.height,
    inputType
  )

  useEffect(() => {
    setDisplayMode(hours >= 12 ? 'PM' : 'AM')
  }, [hours])

  const clockWidth =
    inputType === inputTypes.picker ? circleSize + (isLandscape ? 52 : 0) : 0

  const displayModeValue = { mode: displayMode, setMode: setDisplayMode }

  const fieldWidth = timeSelectorFieldWidth(inputType, is24Hour, isLandscape)
  const inputsWidth =
    fieldWidth * 2 +
    timeSeparatorWidth +
    (is24Hour || (isLandscape && inputType === inputTypes.picker)
      ? 0
      : periodSelectorGap + periodSelectorVerticalWidth)

  const onInnerChange: TimeChange = (params) => {
    onChange({
      ...params,
      hours: toHourOutputFormat(params.hours, hours, is24Hour),
    })
  }

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
          onInputInvalidChange={onInputInvalidChange}
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
    paddingLeft: 52,
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
