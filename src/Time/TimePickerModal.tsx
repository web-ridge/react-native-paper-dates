import { memo, useCallback, useEffect, useState } from 'react'
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
import { Button, IconButton, useTheme } from 'react-native-paper'

import ModalScrim from '../shared/ModalScrim'
import { sharedStyles } from '../shared/styles'
import { displayCase, supportedOrientations } from '../shared/utils'
import { getTranslation } from '../translations/utils'
import TimePicker from './TimePicker'
import {
  clockTypes,
  getTimeInputTypeIcon,
  inputTypes,
  type PossibleClockTypes,
  type PossibleInputTypes,
  reverseInputTypes,
  type TimeChange,
  timeDialFits,
} from './timeUtils'

export function TimePickerModal({
  animationType,
  cancelLabel = 'Cancel',
  clockIcon = 'clock-outline',
  confirmLabel = 'OK',
  defaultInputType,
  hours,
  inputFontSize,
  keyboardIcon = 'keyboard-outline',
  label,
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
  const { height, width } = useWindowDimensions()
  const canShowDial = timeDialFits(width, height)
  const displayedInputType = canShowDial ? inputType : inputTypes.keyboard

  useEffect(() => {
    setLocalHours(orNow(hours, (date) => date.getHours()))
    setLocalMinutes(orNow(minutes, (date) => date.getMinutes()))
  }, [hours, minutes])

  const animation =
    animationType ||
    Platform.select({
      default: 'slide',
      web: 'none',
    })
  const headline =
    label ||
    (displayedInputType === inputTypes.keyboard ? 'Enter time' : 'Select time')
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

  const color = theme.colors.elevation.level3

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
                displayedInputType === inputTypes.keyboard
                  ? styles.keyboardModal
                  : styles.pickerModal,
                { backgroundColor: color },
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
                  {displayCase(headline, uppercase)}
                </Text>
              </View>
              <View style={styles.timePickerContainer}>
                <TimePicker
                  focused={focused}
                  hours={localHours}
                  inputFontSize={inputFontSize}
                  inputType={displayedInputType}
                  locale={locale}
                  minutes={localMinutes}
                  onChange={onChange}
                  onFocusInput={onFocusInput}
                  use24HourClock={use24HourClock}
                />
              </View>
              <View style={styles.bottom}>
                {canShowDial ? (
                  <IconButton
                    accessibilityLabel={
                      inputType === inputTypes.picker
                        ? getTranslation(
                            locale,
                            'toggleKeyboard',
                            'Toggle keyboard'
                          )
                        : getTranslation(locale, 'toggleClock', 'Toggle clock')
                    }
                    icon={getTimeInputTypeIcon(inputType, {
                      keyboard: keyboardIcon,
                      picker: clockIcon,
                    })}
                    iconColor={theme.colors.onSurfaceVariant}
                    onPress={() => {
                      Keyboard.dismiss()
                      setInputType(reverseInputTypes[inputType])
                    }}
                    size={24}
                    style={styles.inputTypeToggle}
                  />
                ) : null}
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

function orNow(value: number | undefined | null, read: (date: Date) => number) {
  return value ?? read(new Date())
}

const styles = StyleSheet.create({
  bottom: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingBottom: 16,
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  center: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  inputTypeToggle: {
    margin: 0,
  },
  keyboardModal: {
    height: 252,
    minWidth: 280,
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
    borderRadius: 28,
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
  pickerModal: {
    minWidth: 328,
  },
  timePickerContainer: {
    paddingBottom: 16,
    paddingLeft: 24,
    paddingRight: 24,
    paddingTop: 20,
  },
})

export default memo(TimePickerModal)
