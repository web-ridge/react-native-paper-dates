import { memo, useEffect, useState } from 'react'
import { StyleSheet, useWindowDimensions, View } from 'react-native'
import { IconButton, useTheme } from 'react-native-paper'

import { DisplayModeContext } from '../contexts/DisplayModeContext'
import { getTranslation } from '../translations/utils'
import AnalogClock from './AnalogClock'
import ScrollTimePicker from './ScrollTimePicker'
import TimeInputs from './TimeInputs'
import {
  circleSize,
  inputTypes,
  periodSelectorGap,
  periodSelectorVerticalWidth,
  type PossibleClockTypes,
  type PossibleInputTypes,
  type TimeChange,
  resolve24HourClock,
  timePickerUsesLandscape,
  timeSelectorFieldWidth,
  timeSeparatorWidth,
  toHourInputFormat,
  toHourOutputFormat,
} from './timeUtils'

function TimePicker({
  clockIcon = 'clock',
  disabled,
  focused,
  hours,
  inputFontSize,
  inputType,
  keyboardIcon = 'keyboard',
  locale,
  minutes,
  onChange,
  onFocusInput,
  onInputInvalidChange,
  onToggleKeyboard,
  scrollIcon = 'gesture-swipe-vertical',
  use24HourClock,
}: {
  clockIcon?: string
  disabled?: boolean
  focused: PossibleClockTypes
  hours: number
  inputFontSize?: number
  inputType: PossibleInputTypes
  keyboardIcon?: string
  locale?: string
  minutes: number
  onChange: TimeChange
  onFocusInput: (type: PossibleClockTypes) => void
  onInputInvalidChange?: (invalid: boolean) => void
  onToggleKeyboard?: () => void
  scrollIcon?: string
  use24HourClock?: boolean
}) {
  const dimensions = useWindowDimensions()
  const theme = useTheme()
  const [displayMode, setDisplayMode] = useState<'AM' | 'PM' | undefined>(() =>
    hours >= 12 ? 'PM' : 'AM'
  )
  const [localInputType, setLocalInputType] = useState(inputType)
  const is24Hour = resolve24HourClock(use24HourClock, locale)
  const activeInputType = onToggleKeyboard ? inputType : localInputType

  const isLandscape = timePickerUsesLandscape(
    dimensions.width,
    dimensions.height,
    activeInputType
  )

  useEffect(() => {
    setDisplayMode(hours >= 12 ? 'PM' : 'AM')
  }, [hours])

  useEffect(() => {
    setLocalInputType(inputType)
  }, [inputType])

  const clockWidth =
    activeInputType === inputTypes.picker
      ? circleSize + (isLandscape ? 52 : 0)
      : 0

  const displayModeValue = { mode: displayMode, setMode: setDisplayMode }
  const toggleKeyboard = () => {
    if (disabled) return
    if (onToggleKeyboard) {
      onToggleKeyboard()
      return
    }
    setLocalInputType((current) =>
      current === inputTypes.keyboard ? inputType : inputTypes.keyboard
    )
  }

  if (activeInputType === inputTypes.scroll) {
    return (
      <DisplayModeContext.Provider value={displayModeValue}>
        <ScrollTimePicker
          disabled={disabled}
          focused={focused}
          hours={hours}
          is24Hour={is24Hour}
          keyboardIcon={keyboardIcon}
          locale={locale}
          minutes={minutes}
          onChange={onChange}
          onFocusInput={onFocusInput}
          onToggleKeyboard={toggleKeyboard}
        />
      </DisplayModeContext.Provider>
    )
  }

  const fieldWidth = timeSelectorFieldWidth(
    activeInputType,
    is24Hour,
    isLandscape
  )
  const inputsWidth =
    fieldWidth * 2 +
    timeSeparatorWidth +
    (is24Hour || (isLandscape && activeInputType === inputTypes.picker)
      ? 0
      : periodSelectorGap + periodSelectorVerticalWidth)

  const onInnerChange: TimeChange = (params) => {
    onChange({
      ...params,
      hours: toHourOutputFormat(params.hours, hours, is24Hour),
    })
  }
  const showReturnToPicker =
    activeInputType === inputTypes.keyboard &&
    !onToggleKeyboard &&
    inputType !== inputTypes.keyboard
  const fields = (
    <TimeInputs
      disabled={disabled}
      focused={focused}
      hours={hours}
      inputFontSize={inputFontSize}
      inputType={activeInputType}
      is24Hour={is24Hour}
      locale={locale}
      minutes={minutes}
      onChange={onChange}
      onFocusInput={onFocusInput}
      onInputInvalidChange={onInputInvalidChange}
    />
  )

  return (
    <DisplayModeContext.Provider value={displayModeValue}>
      <View
        style={
          isLandscape && activeInputType === inputTypes.picker
            ? [styles.rootLandscape, { width: inputsWidth + clockWidth }]
            : styles.rootPortrait
        }
      >
        {showReturnToPicker ? (
          <View style={styles.inputColumn}>
            {fields}
            <IconButton
              accessibilityLabel={getTranslation(
                locale,
                inputType === inputTypes.scroll
                  ? 'toggleScroll'
                  : 'toggleClock',
                inputType === inputTypes.scroll
                  ? 'Toggle scroll picker'
                  : 'Toggle dial picker'
              )}
              disabled={disabled}
              icon={inputType === inputTypes.scroll ? scrollIcon : clockIcon}
              iconColor={theme.colors.onSurfaceVariant}
              onPress={toggleKeyboard}
              size={24}
              style={styles.inputTypeToggle}
            />
          </View>
        ) : (
          fields
        )}
        {activeInputType === inputTypes.picker ? (
          <View
            style={[
              styles.clockContainer,
              !is24Hour && !isLandscape && styles.clockSideInset,
              isLandscape && styles.clockContainerLandscape,
            ]}
          >
            <AnalogClock
              disabled={disabled}
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
  inputColumn: {
    alignItems: 'flex-start',
  },
  inputTypeToggle: {
    margin: 0,
    marginTop: 8,
  },
  clockContainer: {
    paddingTop: 12,
  },
  clockSideInset: {
    paddingHorizontal: 12,
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
