import { memo, useContext, useEffect, useMemo, useState } from 'react'
import { StyleSheet, useWindowDimensions, View } from 'react-native'
import { IconButton, useTheme } from 'react-native-paper'

import { DisplayModeContext } from '../contexts/DisplayModeContext'
import { TimePickerPlacementContext } from '../contexts/TimePickerPlacementContext'
import AnalogClock from './AnalogClock'
import ScrollTimePicker from './ScrollTimePicker'
import TimeInputs from './TimeInputs'
import {
  circleSize,
  getTimeInputToggleLabel,
  inputTypes,
  periodSelectorGap,
  periodSelectorVerticalWidth,
  type PossibleClockTypes,
  type PossibleInputTypes,
  resolve24HourClock,
  type TimeChange,
  timePickerUsesLandscape,
  timeSelectorFieldWidth,
  timeSeparatorWidth,
  toHourInputFormat,
  toHourOutputFormat,
} from './timeUtils'

function TimePicker({
  autoFocus,
  clockIcon = 'clock',
  disabled,
  error,
  errorText,
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
  autoFocus?: boolean
  clockIcon?: string
  disabled?: boolean
  error?: boolean
  errorText?: string
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
  const placement = useContext(TimePickerPlacementContext)
  const theme = useTheme()

  const [displayMode, setDisplayMode] = useState<'AM' | 'PM' | undefined>(() =>
    hours >= 12 ? 'PM' : 'AM'
  )

  const [localInputType, setLocalInputType] = useState(inputType)

  const activeInputType = onToggleKeyboard ? inputType : localInputType

  const [hasShownScroll, setHasShownScroll] = useState(
    () => activeInputType === inputTypes.scroll
  )

  const displayModeValue = useMemo(
    () => ({ mode: displayMode, setMode: setDisplayMode }),
    [displayMode]
  )

  const is24Hour = resolve24HourClock(use24HourClock, locale)

  const fields = (
    <TimeInputs
      autoFocus={autoFocus}
      disabled={disabled}
      error={error}
      errorText={errorText}
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

  const isLandscape = timePickerUsesLandscape(
    dimensions.width,
    dimensions.height,
    activeInputType
  )

  const clockWidth =
    activeInputType === inputTypes.picker
      ? circleSize + (isLandscape ? 52 : 0)
      : 0

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

  const showingScroll = activeInputType === inputTypes.scroll

  const keepScrollMounted =
    showingScroll || (hasShownScroll && activeInputType === inputTypes.keyboard)

  const showReturnToPicker =
    activeInputType === inputTypes.keyboard &&
    !onToggleKeyboard &&
    inputType !== inputTypes.keyboard

  const onInnerChange: TimeChange = (params) => {
    onChange({
      ...params,
      hours: toHourOutputFormat(params.hours, hours, is24Hour),
    })
  }

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

  useEffect(() => {
    setDisplayMode(hours >= 12 ? 'PM' : 'AM')
  }, [hours])

  useEffect(() => {
    setLocalInputType(inputType)
  }, [inputType])

  useEffect(() => {
    if (activeInputType === inputTypes.scroll) {
      setHasShownScroll(true)
    } else if (activeInputType === inputTypes.picker) {
      setHasShownScroll(false)
    }
  }, [activeInputType])

  return (
    <DisplayModeContext.Provider value={displayModeValue}>
      {keepScrollMounted ? (
        <View
          accessibilityElementsHidden={!showingScroll}
          importantForAccessibility={
            showingScroll ? 'auto' : 'no-hide-descendants'
          }
          pointerEvents={showingScroll ? 'auto' : 'none'}
          style={showingScroll ? undefined : styles.hiddenScroll}
        >
          <ScrollTimePicker
            autoFocus={autoFocus}
            disabled={disabled}
            error={error}
            errorText={errorText}
            focused={focused}
            hours={hours}
            is24Hour={is24Hour}
            keyboardIcon={keyboardIcon}
            locale={locale}
            minutes={minutes}
            onChange={onChange}
            onFocusInput={onFocusInput}
            onToggleKeyboard={toggleKeyboard}
            showKeyboardToggle={
              placement === 'inline' && (!is24Hour || !onToggleKeyboard)
            }
            visible={showingScroll}
          />
        </View>
      ) : null}
      {!showingScroll ? (
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
                accessibilityLabel={getTimeInputToggleLabel(
                  locale,
                  activeInputType,
                  inputType === inputTypes.scroll
                    ? inputTypes.scroll
                    : inputTypes.picker
                )}
                disabled={disabled}
                icon={inputType === inputTypes.scroll ? scrollIcon : clockIcon}
                iconColor={theme.colors.onSurfaceVariant}
                iconSize={24}
                onPress={toggleKeyboard}
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
                !isLandscape && styles.clockSideInset,
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
      ) : null}
    </DisplayModeContext.Provider>
  )
}

const styles = StyleSheet.create({
  clockContainer: {
    paddingTop: 12,
  },
  clockContainerLandscape: {
    paddingLeft: 52,
    paddingRight: 0,
    paddingTop: 0,
  },
  clockSideInset: {
    paddingHorizontal: 12,
  },
  hiddenScroll: {
    display: 'none',
  },
  inputColumn: {
    alignItems: 'flex-start',
  },
  inputTypeToggle: {
    margin: 0,
    marginTop: 8,
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
