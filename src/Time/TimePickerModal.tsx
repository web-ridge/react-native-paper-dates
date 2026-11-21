import { memo, useEffect, useState } from 'react'
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native'
import { Button, IconButton, Surface, useTheme } from 'react-native-paper'

import { TimePickerPlacementContext } from '../contexts/TimePickerPlacementContext'
import { dialogCardRadius } from '../shared/ElevatedCard'
import ModalScrim from '../shared/ModalScrim'
import { useModalAnimation } from '../shared/motion'
import { sharedStyles } from '../shared/styles'
import { displayCase, supportedOrientations } from '../shared/utils'
import TimePicker from './TimePicker'
import {
  clockTypes,
  getTimeInputToggleLabel,
  getTimeInputTypeIcon,
  inputTypes,
  type PickerInputType,
  type PossibleClockTypes,
  type PossibleInputTypes,
  resolve24HourClock,
  type TimeChange,
  timeDialFits,
  timePickerActionsGap,
  timePickerHorizontalPadding,
  timePickerModalMinWidth,
  timePickerPadding,
  timePickerUsesLandscape,
} from './timeUtils'

export function TimePickerModal({
  animationType,
  cancelLabel = 'Cancel',
  clockIcon = 'clock',
  confirmLabel = 'OK',
  defaultInputType,
  disabled,
  hours,
  inputFontSize,
  keyboardIcon = 'keyboard',
  label,
  locale,
  minutes,
  onConfirm,
  onDismiss,
  scrollIcon = 'gesture-swipe-vertical',
  uppercase = false,
  use24HourClock,
  visible,
}: {
  animationType?: 'slide' | 'fade' | 'none'
  cancelLabel?: string
  clockIcon?: string
  confirmLabel?: string
  defaultInputType?: PossibleInputTypes
  disabled?: boolean
  hours?: number
  inputFontSize?: number
  keyboardIcon?: string
  label?: string
  locale?: string
  minutes?: number
  onConfirm: (hoursAndMinutes: { hours: number; minutes: number }) => void
  onDismiss: () => void
  scrollIcon?: string
  uppercase?: boolean
  use24HourClock?: boolean
  visible: boolean | undefined
}) {
  const [focused, setFocused] = useState<PossibleClockTypes>(clockTypes.hours)
  const [inputInvalid, setInputInvalid] = useState(false)
  const [inputType, setInputType] = useState<PossibleInputTypes>(
    defaultInputType || inputTypes.picker
  )
  const [pickerMode, setPickerMode] = useState<PickerInputType>(
    defaultInputType === inputTypes.scroll
      ? inputTypes.scroll
      : inputTypes.picker
  )
  const [localHours, setLocalHours] = useState(() =>
    orNow(hours, (date) => date.getHours())
  )
  const [localMinutes, setLocalMinutes] = useState(() =>
    orNow(minutes, (date) => date.getMinutes())
  )
  const theme = useTheme()
  const { height, width } = useWindowDimensions()
  const is24Hour = resolve24HourClock(use24HourClock, locale)
  const canShowDial = timeDialFits(width, height)
  const displayedInputType =
    inputType === inputTypes.picker && !canShowDial
      ? inputTypes.scroll
      : inputType
  const storedMode: PickerInputType =
    inputType === inputTypes.scroll ? inputTypes.scroll : pickerMode
  const iconMode: PickerInputType =
    storedMode === inputTypes.picker && !canShowDial
      ? inputTypes.scroll
      : storedMode

  useEffect(() => {
    setLocalHours(orNow(hours, (date) => date.getHours()))
    setLocalMinutes(orNow(minutes, (date) => date.getMinutes()))
  }, [hours, minutes])

  useEffect(() => {
    if (!visible) {
      setInputInvalid(false)
    }
  }, [visible])

  const animation = useModalAnimation(
    animationType,
    Platform.OS === 'web' ? 'none' : 'fade'
  )
  const onChange: TimeChange = (params) => {
    if (params.focused) {
      setFocused(params.focused)
    }

    setLocalHours(params.hours)
    setLocalMinutes(params.minutes)
  }
  const onFocusInput = (type: PossibleClockTypes) => setFocused(type)
  const textFont = theme.fonts.labelMedium
  const toggleInputType = () => {
    if (disabled) return
    Keyboard.dismiss()
    if (displayedInputType === inputTypes.keyboard) {
      setInputType(storedMode)
      return
    }
    setPickerMode(
      inputType === inputTypes.scroll ? inputTypes.scroll : inputTypes.picker
    )
    setInputType(inputTypes.keyboard)
  }

  const horizontalDial =
    displayedInputType === inputTypes.picker &&
    timePickerUsesLandscape(width, height, displayedInputType)
  const framePadding = horizontalDial
    ? timePickerHorizontalPadding
    : timePickerPadding
  const actionsGap = horizontalDial
    ? timePickerHorizontalPadding
    : displayedInputType === inputTypes.picker
      ? timePickerPadding
      : timePickerActionsGap
  const color = theme.colors.surfaceContainer

  return (
    <Modal
      animationType={animation}
      onRequestClose={onDismiss}
      presentationStyle="overFullScreen"
      statusBarTranslucent={true}
      supportedOrientations={supportedOrientations}
      transparent={true}
      visible={visible}
    >
      <ModalScrim onDismiss={onDismiss} />
      <View
        pointerEvents="box-none"
        style={[StyleSheet.absoluteFill, styles.center]}
      >
        <KeyboardAvoidingView behavior="padding" style={styles.center}>
          <Surface
            backgroundColor={color}
            borderRadius={dialogCardRadius}
            elevation={3}
            style={[
              styles.modalContent,
              {
                minWidth: timePickerModalMinWidth(
                  is24Hour,
                  displayedInputType === inputTypes.picker
                ),
              },
            ]}
          >
            {label ? (
              <View
                style={[
                  styles.labelContainer,
                  {
                    paddingLeft: framePadding,
                    paddingRight: framePadding,
                    paddingTop: framePadding,
                  },
                ]}
              >
                <Text
                  maxFontSizeMultiplier={1.5}
                  style={{
                    ...textFont,
                    color: theme.colors.onSurfaceVariant,
                  }}
                >
                  {displayCase(label, uppercase)}
                </Text>
              </View>
            ) : null}
            <View
              style={[
                styles.timePickerContainer,
                {
                  paddingHorizontal: framePadding,
                  paddingTop: framePadding,
                },
              ]}
            >
              <TimePickerPlacementContext.Provider value="modal">
                <TimePicker
                  clockIcon={clockIcon}
                  disabled={disabled}
                  focused={focused}
                  hours={localHours}
                  inputFontSize={inputFontSize}
                  inputType={displayedInputType}
                  keyboardIcon={keyboardIcon}
                  locale={locale}
                  minutes={localMinutes}
                  onChange={onChange}
                  onFocusInput={onFocusInput}
                  onInputInvalidChange={setInputInvalid}
                  onToggleKeyboard={toggleInputType}
                  scrollIcon={scrollIcon}
                  use24HourClock={use24HourClock}
                />
              </TimePickerPlacementContext.Provider>
            </View>
            <View
              style={[
                styles.bottom,
                {
                  paddingBottom: framePadding,
                  paddingHorizontal: framePadding,
                  paddingTop: actionsGap,
                },
              ]}
            >
              <IconButton
                accessibilityLabel={getTimeInputToggleLabel(
                  locale,
                  displayedInputType,
                  iconMode
                )}
                disabled={disabled}
                icon={
                  getTimeInputTypeIcon(
                    displayedInputType,
                    {
                      keyboard: keyboardIcon,
                      picker: clockIcon,
                      scroll: scrollIcon,
                    },
                    iconMode
                  ) ?? keyboardIcon
                }
                iconColor={theme.colors.onSurfaceVariant}
                onPress={toggleInputType}
                size={24}
                style={styles.inputTypeToggle}
              />
              <View style={sharedStyles.root} />
              <Button mode="text" onPress={onDismiss}>
                {displayCase(cancelLabel, uppercase)}
              </Button>
              <Button
                disabled={disabled || inputInvalid}
                mode="text"
                onPress={() => {
                  if (disabled || inputInvalid) return
                  onConfirm({ hours: localHours, minutes: localMinutes })
                }}
              >
                {displayCase(confirmLabel, uppercase)}
              </Button>
            </View>
          </Surface>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  )
}

function orNow(value: number | undefined | null, read: (date: Date) => number) {
  return value ?? read(new Date())
}

const styles = StyleSheet.create({
  bottom: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  center: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  inputTypeToggle: {
    margin: 0,
  },
  labelContainer: {
    justifyContent: 'flex-end',
  },
  modalContent: {
    justifyContent: 'space-between',
  },
  timePickerContainer: {
    paddingBottom: 0,
  },
})

export default memo(TimePickerModal)
