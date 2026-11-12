import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native'

import { Button, IconButton, useTheme } from 'react-native-paper'

import TimePicker from './TimePicker'
import {
  clockTypes,
  getTimeInputTypeIcon,
  inputTypes,
  PossibleClockTypes,
  PossibleInputTypes,
  reverseInputTypes,
} from './timeUtils'
import { memo, useCallback, useEffect, useState } from 'react'
import { sharedStyles } from '../shared/styles'
import { scrimColor, supportedOrientations } from '../shared/utils'

export function TimePickerModal({
  animationType = 'none',
  cancelLabel = 'Cancel',
  clockIcon = 'clock-outline',
  confirmLabel = 'Ok',
  defaultInputType,
  hours,
  inputFontSize,
  keyboardIcon = 'keyboard-outline',
  label = 'Select time',
  locale,
  minutes,
  onConfirm,
  onDismiss,
  uppercase: _uppercase,
  use24HourClock,
  visible,
}: {
  animationType?: 'slide' | 'fade' | 'none'
  cancelLabel?: string
  clockIcon?: string
  confirmLabel?: string
  defaultInputType?: PossibleInputTypes
  hours?: number | undefined
  inputFontSize?: number
  keyboardIcon?: string
  label?: string
  locale?: undefined | string
  minutes?: number | undefined
  onConfirm: (hoursAndMinutes: { hours: number; minutes: number }) => any
  onDismiss: () => any
  uppercase?: boolean
  use24HourClock?: boolean
  visible: boolean | undefined
}) {
  const theme = useTheme()

  const [inputType, setInputType] = useState<PossibleInputTypes>(
    defaultInputType || inputTypes.picker
  )
  const [focused, setFocused] = useState<PossibleClockTypes>(clockTypes.hours)
  const [localHours, setLocalHours] = useState(getHours(hours))
  const [localMinutes, setLocalMinutes] = useState(getMinutes(minutes))

  useEffect(() => {
    setLocalHours(getHours(hours))
  }, [setLocalHours, hours])

  useEffect(() => {
    setLocalMinutes(getMinutes(minutes))
  }, [setLocalMinutes, minutes])

  const onFocusInput = useCallback(
    (type: PossibleClockTypes) => setFocused(type),
    []
  )
  const onChange = useCallback(
    (params: {
      focused?: PossibleClockTypes | undefined
      hours: number
      minutes: number
    }) => {
      if (params.focused) {
        setFocused(params.focused)
      }

      setLocalHours(params.hours)
      setLocalMinutes(params.minutes)
    },
    [setFocused, setLocalHours, setLocalMinutes]
  )

  const uppercase = _uppercase ?? false
  const textFont = theme.fonts.labelMedium
  let labelText = label

  if (inputType === inputTypes.keyboard && !label) {
    labelText = 'Enter time'
  }

  const color = theme.colors.elevation.level3

  return (
    <Modal
      animationType={animationType}
      onRequestClose={onDismiss}
      presentationStyle="overFullScreen"
      statusBarTranslucent={true}
      supportedOrientations={supportedOrientations}
      transparent={true}
      visible={visible}
    >
      <>
        <TouchableWithoutFeedback onPress={onDismiss}>
          <View
            style={[
              StyleSheet.absoluteFill,
              sharedStyles.root,
              { backgroundColor: scrimColor(theme.colors.scrim) },
            ]}
          />
        </TouchableWithoutFeedback>
        <View
          pointerEvents="box-none"
          style={[StyleSheet.absoluteFill, styles.center]}
        >
          <KeyboardAvoidingView behavior="padding" style={styles.center}>
            <View
              style={[
                styles.modalContent,
                // eslint-disable-next-line react-native/no-inline-styles
                {
                  backgroundColor: color,
                  borderRadius: 28,
                  minWidth: inputType === inputTypes.picker ? 328 : 280,
                  ...(inputType === inputTypes.keyboard
                    ? { height: 252 }
                    : null),
                },
              ]}
            >
              <View style={styles.labelContainer}>
                <Text
                  maxFontSizeMultiplier={1.5}
                  style={[
                    styles.label,
                    {
                      ...textFont,
                      color: theme.colors.onSurfaceVariant,
                    },
                  ]}
                >
                  {uppercase ? labelText.toUpperCase() : labelText}
                </Text>
              </View>
              <View style={styles.timePickerContainer}>
                <TimePicker
                  focused={focused}
                  hours={localHours}
                  inputFontSize={inputFontSize}
                  inputType={inputType}
                  locale={locale}
                  minutes={localMinutes}
                  onChange={onChange}
                  onFocusInput={onFocusInput}
                  use24HourClock={use24HourClock}
                />
              </View>
              <View style={styles.bottom}>
                <IconButton
                  accessibilityLabel="toggle keyboard"
                  icon={getTimeInputTypeIcon(inputType, {
                    keyboard: keyboardIcon,
                    picker: clockIcon,
                  })}
                  iconColor={theme.colors.onSurface}
                  onPress={() => {
                    Keyboard.dismiss()
                    setInputType(reverseInputTypes[inputType])
                  }}
                  size={24}
                  style={styles.inputTypeToggle}
                />
                <View style={sharedStyles.root} />
                <Button mode="text" onPress={onDismiss}>
                  {uppercase ? cancelLabel.toUpperCase() : cancelLabel}
                </Button>
                <Button
                  mode="text"
                  onPress={() =>
                    onConfirm({ hours: localHours, minutes: localMinutes })
                  }
                >
                  {uppercase ? confirmLabel.toUpperCase() : confirmLabel}
                </Button>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </>
    </Modal>
  )
}

function getMinutes(minutes: number | undefined | null): number {
  return minutes === undefined || minutes === null
    ? new Date().getMinutes()
    : minutes
}

function getHours(hours: number | undefined | null): number {
  return hours === undefined || hours === null ? new Date().getHours() : hours
}

const styles = StyleSheet.create({
  bottom: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  center: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  inputTypeToggle: {
    margin: 0,
  },
  label: {
    fontSize: 13,
    letterSpacing: 1,
  },
  labelContainer: {
    justifyContent: 'flex-end',
    paddingLeft: 24,
    paddingRight: 24,
    paddingTop: 16,
  },
  modalContent: {
    elevation: 3,
    justifyContent: 'space-between',
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      height: 5,
      width: 0,
    },
    shadowOpacity: 0.34,
    shadowRadius: 6.27,
  },
  timePickerContainer: {
    paddingBottom: 16,
    paddingLeft: 24,
    paddingRight: 24,
    paddingTop: 20,
  },
})

export default memo(TimePickerModal)
