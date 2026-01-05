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
  presentationStyle?: 'pageSheet' | 'formSheet' | 'overFullScreen'
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

  const theme = useTheme()
  const dimensions = useWindowDimensions()

  // Automatically use formSheet on iPad for better fit
  // iPad detection: width > 650 AND height > 650 (works in both orientations)
  // - iPad portrait: 744x1133, landscape: 1133x744 (both > 650)
  // - iPhone landscape: 932x430 (height < 650, so excluded)
  // pageSheet on iPad is ~540pt wide, but calendar is max 400pt, causing centering
  // formSheet at ~540x620pt provides a better fit for the date picker
  const shouldUseSheet =
    Platform.OS === 'ios' &&
    (presentationStyle === 'pageSheet' || presentationStyle === 'formSheet')
  const useFormSheet =
    shouldUseSheet && dimensions.width > 650 && dimensions.height > 650
  const isSheet = shouldUseSheet

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Modal
        animationType={animationTypeCalculated}
        transparent={!isSheet}
        visible={visible}
        onRequestClose={rest.onDismiss}
        presentationStyle={
          useFormSheet ? 'formSheet' : shouldUseSheet ? 'pageSheet' : 'overFullScreen'
        }
        supportedOrientations={supportedOrientations}
        statusBarTranslucent={!disableStatusBar}
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
              dimensions.width > 650
                ? useFormSheet
                  ? styles.modalContentFormSheet
                  : styles.modalContentBig
                : null,
            ]}
          >
            <DatePickerModalContent
              {...rest}
              inputEnabled={inputEnabled}
              disableSafeTop={disableStatusBarPadding}
              disableStatusBar={disableStatusBar}
              statusBarOnTopOfBackdrop={isSheet || statusBarOnTopOfBackdrop}
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
  modalContentFormSheet: {
    maxWidth: 520,
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
