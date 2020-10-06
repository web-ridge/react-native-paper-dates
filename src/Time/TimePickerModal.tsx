import * as React from 'react'
import {
  Modal,
  StyleSheet,
  View,
  Text,
  Animated,
  TouchableWithoutFeedback,
} from 'react-native'

import { Button, IconButton, overlay, useTheme } from 'react-native-paper'
import TimePicker from './TimePicker'
import {
  clockTypes,
  inputTypeIcons,
  inputTypes,
  PossibleClockTypes,
  PossibleInputTypes,
  reverseInputTypes,
} from './timeUtils'

const supportedOrientations: any[] = [
  'portrait',
  'portrait-upside-down',
  'landscape',
  'landscape-left',
  'landscape-right',
]

export function TimePickerModal({
  visible,
  onDismiss,
}: {
  visible: boolean
  onDismiss: () => any
}) {
  const theme = useTheme()
  let date = new Date()

  const [inputType, setInputType] = React.useState<PossibleInputTypes>(
    inputTypes.picker
  )
  const [focused, setFocused] = React.useState<PossibleClockTypes>(
    clockTypes.hours
  )
  const [hours, setHours] = React.useState<number>(date.getHours())
  const [minutes, setMinutes] = React.useState<number>(date.getMinutes())
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

      setHours(params.hours)
      setMinutes(params.minutes)
    },
    [setFocused, setHours, setMinutes]
  )
  return (
    <Modal
      animationType="none"
      transparent={true}
      visible={visible}
      onRequestClose={onDismiss}
      presentationStyle="overFullScreen"
      supportedOrientations={supportedOrientations}
      //@ts-ignore
      statusBarTranslucent={true}
    >
      <>
        <TouchableWithoutFeedback onPress={onDismiss}>
          <View
            style={[
              StyleSheet.absoluteFill,
              styles.modalBackground,
              { backgroundColor: theme.colors.backdrop },
            ]}
          />
        </TouchableWithoutFeedback>
        <View
          style={[StyleSheet.absoluteFill, styles.modalRoot]}
          pointerEvents="box-none"
        >
          <Animated.View
            style={[
              styles.modalContent,
              {
                backgroundColor: theme.dark
                  ? overlay(10, theme.colors.surface)
                  : theme.colors.surface,
                borderRadius: theme.roundness,
              },
            ]}
          >
            <View style={styles.labelContainer}>
              <Text style={[styles.label, { color: theme.colors.text }]}>
                {`Select time`.toUpperCase()}
              </Text>
            </View>
            <View style={styles.timePickerContainer}>
              <TimePicker
                inputType={inputType}
                focused={focused}
                hours={hours}
                minutes={minutes}
                onChange={onChange}
                onFocusInput={onFocusInput}
              />
            </View>
            <View style={styles.bottom}>
              <IconButton
                icon={inputTypeIcons[reverseInputTypes[inputType]]}
                onPress={() => setInputType(reverseInputTypes[inputType])}
                size={24}
                style={styles.inputTypeToggle}
              />
              <View style={styles.fill} />
              <Button onPress={onDismiss}>Cancel</Button>
              <Button onPress={() => {}}>Ok</Button>
            </View>
          </Animated.View>
        </View>
      </>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalRoot: {
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
    elevation: 10,
    minWidth: 287,
  },
  labelContainer: {
    height: 28,
    justifyContent: 'flex-end',
    paddingLeft: 24,
    paddingRight: 24,
  },
  label: {
    letterSpacing: 1,
    fontSize: 13,
  },
  timePickerContainer: { padding: 24 },
  bottom: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  inputTypeToggle: { margin: 4 },
  fill: { flex: 1 },
})

export default React.memo(TimePickerModal)
