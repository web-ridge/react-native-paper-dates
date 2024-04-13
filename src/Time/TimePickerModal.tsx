import * as React from 'react'
import {
  Modal,
  StyleSheet,
  View,
  Text,
  Animated,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
} from 'react-native'

import {
  Button,
  IconButton,
  MD2Theme,
  overlay,
  useTheme,
} from 'react-native-paper'

import TimePicker from './TimePicker'
import {
  clockTypes,
  getTimeInputTypeIcon,
  inputTypes,
  PossibleClockTypes,
  PossibleInputTypes,
  reverseInputTypes,
} from './timeUtils'

const supportedOrientations: (
  | 'portrait'
  | 'portrait-upside-down'
  | 'landscape'
  | 'landscape-left'
  | 'landscape-right'
)[] = [
  'portrait',
  'portrait-upside-down',
  'landscape',
  'landscape-left',
  'landscape-right',
]

export function TimePickerModal({
  visible,
  onDismiss,
  onConfirm,
  hours,
  minutes,
  label = 'Select time',
  uppercase: _uppercase,
  cancelLabel = 'Cancel',
  confirmLabel = 'Ok',
  animationType = 'none',
  locale,
  keyboardIcon = 'keyboard-outline',
  clockIcon = 'clock-outline',
  use24HourClock,
  inputFontSize,
  defaultInputType,
}: {
  locale?: undefined | string
  label?: string
  uppercase?: boolean
  cancelLabel?: string
  confirmLabel?: string
  hours?: number | undefined
  minutes?: number | undefined
  visible: boolean | undefined
  onDismiss: () => any
  onConfirm: (hoursAndMinutes: { hours: number; minutes: number }) => any
  animationType?: 'slide' | 'fade' | 'none'
  keyboardIcon?: string
  clockIcon?: string
  use24HourClock?: boolean
  inputFontSize?: number
  defaultInputType?: PossibleInputTypes
}) {
  const theme = useTheme()
  const defaultUppercase = !theme.isV3
  const uppercase = _uppercase ?? defaultUppercase
  let textFont
  let labelText = label

  if (theme.isV3) {
    textFont = theme.fonts.labelMedium
  } else {
    textFont = (theme as any as MD2Theme)?.fonts.medium
  }

  const [inputType, setInputType] = React.useState<PossibleInputTypes>(
    defaultInputType || inputTypes.picker
  )
  const [focused, setFocused] = React.useState<PossibleClockTypes>(
    clockTypes.hours
  )
  const [localHours, setLocalHours] = React.useState<number>(getHours(hours))
  const [localMinutes, setLocalMinutes] = React.useState<number>(
    getMinutes(minutes)
  )

  if (inputType === inputTypes.keyboard && !label) {
    labelText = 'Enter time'
  }

  React.useEffect(() => {
    setLocalHours(getHours(hours))
  }, [setLocalHours, hours])

  React.useEffect(() => {
    setLocalMinutes(getMinutes(minutes))
  }, [setLocalMinutes, minutes])

  const onFocusInput = React.useCallback(
    (type: PossibleClockTypes) => setFocused(type),
    []
  )
  const onChange = React.useCallback(
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

  let color
  if (theme.isV3) {
    color = theme.dark ? theme.colors.elevation.level3 : theme.colors.surface
  } else {
    color = theme.dark
      ? overlay(10, theme.colors.surface)
      : theme.colors.surface
  }

  return (
    <Modal
      animationType={animationType}
      transparent={true}
      visible={visible}
      onRequestClose={onDismiss}
      presentationStyle="overFullScreen"
      supportedOrientations={supportedOrientations}
      statusBarTranslucent={true}
    >
      <>
        <TouchableWithoutFeedback onPress={onDismiss}>
          <View
            style={[
              StyleSheet.absoluteFill,
              styles.modalBackground,
              { backgroundColor: theme.colors?.backdrop },
            ]}
          />
        </TouchableWithoutFeedback>
        <View
          style={[StyleSheet.absoluteFill, styles.modalRoot]}
          pointerEvents="box-none"
        >
          <KeyboardAvoidingView
            style={styles.keyboardView}
            behavior={'padding'}
          >
            <Animated.View
              style={[
                styles.modalContent,
                // eslint-disable-next-line react-native/no-inline-styles
                {
                  backgroundColor: color,
                  borderRadius: theme.isV3 ? 28 : undefined,
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
                      color: theme?.isV3
                        ? theme.colors.onSurfaceVariant
                        : (theme as any as MD2Theme).colors.text,
                    },
                  ]}
                >
                  {uppercase ? labelText.toUpperCase() : labelText}
                </Text>
              </View>
              <View style={styles.timePickerContainer}>
                <TimePicker
                  locale={locale}
                  inputType={inputType}
                  use24HourClock={use24HourClock}
                  inputFontSize={inputFontSize}
                  focused={focused}
                  hours={localHours}
                  minutes={localMinutes}
                  onChange={onChange}
                  onFocusInput={onFocusInput}
                />
              </View>
              <View style={styles.bottom}>
                <IconButton
                  icon={getTimeInputTypeIcon(inputType, {
                    keyboard: keyboardIcon,
                    picker: clockIcon,
                  })}
                  onPress={() => setInputType(reverseInputTypes[inputType])}
                  size={24}
                  style={styles.inputTypeToggle}
                  accessibilityLabel="toggle keyboard"
                />
                <View style={styles.fill} />
                <Button onPress={onDismiss} uppercase={uppercase}>
                  {cancelLabel}
                </Button>
                <Button
                  onPress={() =>
                    onConfirm({ hours: localHours, minutes: localMinutes })
                  }
                  uppercase={uppercase}
                >
                  {confirmLabel}
                </Button>
              </View>
            </Animated.View>
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
  modalRoot: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  keyboardView: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  modalBackground: {
    flex: 1,
  },
  modalContent: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.34,
    shadowRadius: 6.27,
    elevation: 3,
    minWidth: 287,
    paddingVertical: 8,
  },
  labelContainer: {
    justifyContent: 'flex-end',
    paddingLeft: 24,
    paddingRight: 24,
    paddingTop: 16,
  },
  label: {
    letterSpacing: 1,
    fontSize: 13,
  },
  timePickerContainer: {
    paddingLeft: 24,
    paddingTop: 20,
    paddingBottom: 16,
    paddingRight: 24,
  },
  bottom: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  inputTypeToggle: { margin: 4 },
  fill: { flex: 1 },
})

export default React.memo(TimePickerModal)
