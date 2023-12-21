import * as React from 'react'
import {
  Modal,
  StyleSheet,
  TouchableWithoutFeedback,
  useWindowDimensions,
  View,
  Platform,
} from 'react-native'
import { useTheme } from 'react-native-paper'
import DatePickerModalContent, {
  DatePickerModalContentMultiProps,
  DatePickerModalContentRangeProps,
  DatePickerModalContentSingleProps,
} from './DatePickerModalContent'

interface DatePickerModalProps {
  visible: boolean
  animationType?: 'slide' | 'fade' | 'none'
  disableStatusBar?: boolean
  disableStatusBarPadding?: boolean
  inputEnabled?: boolean
  presentationStyle?: 'pageSheet' | 'overFullScreen'
}

export interface DatePickerModalSingleProps
  extends DatePickerModalContentSingleProps,
    DatePickerModalProps {}

export interface DatePickerModalMultiProps
  extends DatePickerModalContentMultiProps,
    DatePickerModalProps {}

export interface DatePickerModalRangeProps
  extends DatePickerModalContentRangeProps,
    DatePickerModalProps {}

export function DatePickerModal(
  props:
    | DatePickerModalRangeProps
    | DatePickerModalSingleProps
    | DatePickerModalMultiProps
) {
  const theme = useTheme()
  const dimensions = useWindowDimensions()
  const {
    visible,
    animationType,
    disableStatusBar,
    disableStatusBarPadding,
    inputEnabled,
    presentationStyle,
    statusBarOnTopOfBackdrop,
    ...rest
  } = props
  const animationTypeCalculated =
    animationType ||
    Platform.select({
      web: 'none',
      default: 'slide',
    })

  const isPageSheet = presentationStyle === 'pageSheet' && Platform.OS === 'ios'

  return (
    <View style={[StyleSheet.absoluteFill]} pointerEvents="box-none">
      <Modal
        animationType={animationTypeCalculated}
        transparent={!isPageSheet}
        visible={visible}
        onRequestClose={rest.onDismiss}
        presentationStyle={isPageSheet ? 'pageSheet' : 'overFullScreen'}
        supportedOrientations={supportedOrientations}
        statusBarTranslucent={true}
      >
        <TouchableWithoutFeedback onPress={rest.onDismiss}>
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
          <View
            style={[
              styles.modalContent,
              { backgroundColor: theme.colors.surface },
              dimensions.width > 650 ? styles.modalContentBig : null,
            ]}
          >
            <DatePickerModalContent
              {...rest}
              inputEnabled={inputEnabled}
              disableSafeTop={disableStatusBarPadding}
              disableStatusBar={disableStatusBar}
              statusBarOnTopOfBackdrop={isPageSheet || statusBarOnTopOfBackdrop}
            />
          </View>
        </View>
      </Modal>
    </View>
  )
}

const supportedOrientations: any = [
  'portrait',
  'portrait-upside-down',
  'landscape',
  'landscape-left',
  'landscape-right',
]

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
    flex: 1,
    width: '100%',
  },
  modalContentBig: {
    maxWidth: 600,
    maxHeight: 800,
    borderRadius: 10,
    width: '100%',
    overflow: 'hidden',
  },
})

export default React.memo(DatePickerModal)
