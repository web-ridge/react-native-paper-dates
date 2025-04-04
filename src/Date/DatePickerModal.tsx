import {
  Modal,
  Platform,
  StyleSheet,
  TouchableWithoutFeedback,
  useWindowDimensions,
  View,
} from 'react-native'
import { useTheme } from 'react-native-paper'
import DatePickerModalContent, {
  DatePickerModalContentMultiProps,
  DatePickerModalContentRangeProps,
  DatePickerModalContentSingleProps,
} from './DatePickerModalContent'
import { memo } from 'react'
import { sharedStyles } from '../shared/styles'
import { supportedOrientations } from '../shared/utils'

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

  const theme = useTheme()
  const dimensions = useWindowDimensions()

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
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
              sharedStyles.root,
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
              withDateFormatInLabel={props.withDateFormatInLabel}
              placeholder={props.placeholder}
            />
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  modalContent: {
    flex: 1,
    width: '100%',
  },
  modalContentBig: {
    maxWidth: 400,
    maxHeight: 600,
    borderRadius: 10,
    width: '100%',
    overflow: 'hidden',
  },
  modalRoot: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
})

export default memo(DatePickerModal)
