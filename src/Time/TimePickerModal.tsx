import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  StyleSheet,
  Text,
  View,
} from 'react-native'

import { Button, IconButton, useTheme } from 'react-native-paper'

import TimePicker from './TimePicker'
import {
  clockTypes,
  getTimeInputTypeIcon,
  inputTypes,
  type PossibleClockTypes,
  type PossibleInputTypes,
  reverseInputTypes,
  type TimeChange,
} from './timeUtils'
import { memo, useCallback, useEffect, useState } from 'react'
import { sharedStyles } from '../shared/styles'
import ModalScrim from '../shared/ModalScrim'
import { displayCase, supportedOrientations } from '../shared/utils'
import { getTranslation } from '../translations/utils'

function orNow(value: number | undefined | null, read: (date: Date) => number) {
  return value ?? read(new Date())
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
  hours?: number
  inputFontSize?: number
  keyboardIcon?: string
  label?: string
  locale?: string
  minutes?: number
  onConfirm: (hoursAndMinutes: { hours: number; minutes: number }) => void
  onDismiss: () => void
  uppercase?: boolean
  use24HourClock?: boolean
  visible: boolean | undefined
}) {
  const [focused, setFocused] = useState<PossibleClockTypes>(clockTypes.hours)
  const [inputType, setInputType] = useState<PossibleInputTypes>(
    defaultInputType || inputTypes.picker
  )
  const [localHours, setLocalHours] = useState(() =>
    orNow(hours, (date) => date.getHours())
  )
  const [localMinutes, setLocalMinutes] = useState(() =>
    orNow(minutes, (date) => date.getMinutes())
  )
  const theme = useTheme()

  useEffect(() => {
    setLocalHours(orNow(hours, (date) => date.getHours()))
    setLocalMinutes(orNow(minutes, (date) => date.getMinutes()))
  }, [hours, minutes])

  let labelText = label
  const onChange = useCallback<TimeChange>(
    (params) => {
      if (params.focused) {
        setFocused(params.focused)
      }

      setLocalHours(params.hours)
      setLocalMinutes(params.minutes)
    },
    [setFocused, setLocalHours, setLocalMinutes]
  )
  const onFocusInput = useCallback(
    (type: PossibleClockTypes) => setFocused(type),
    []
  )
  const textFont = theme.fonts.labelMedium
  const uppercase = _uppercase ?? false

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
        <ModalScrim onDismiss={onDismiss} />
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
                  {displayCase(labelText, uppercase)}
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
                  accessibilityLabel={getTranslation(
                    locale,
                    'toggleKeyboard',
                    'Toggle keyboard'
                  )}
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
                  {displayCase(cancelLabel, uppercase)}
                </Button>
                <Button
                  mode="text"
                  onPress={() =>
                    onConfirm({ hours: localHours, minutes: localMinutes })
                  }
                >
                  {displayCase(confirmLabel, uppercase)}
                </Button>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </>
    </Modal>
  )
}

export default memo(TimePickerModal)
