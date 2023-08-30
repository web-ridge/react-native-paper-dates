import * as React from 'react'
import {
  Modal,
  StyleSheet,
  TouchableWithoutFeedback,
  useWindowDimensions,
  View,
  Platform,
  StatusBar,
} from 'react-native'
import { useTheme } from 'react-native-paper'
import DatePickerModalContent, {
  DatePickerModalContentMultiProps,
  DatePickerModalContentRangeProps,
  DatePickerModalContentSingleProps,
} from './DatePickerModalContent'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useHeaderBackgroundColor } from '../utils'

interface DatePickerModalProps {
  visible: boolean
  animationType?: 'slide' | 'fade' | 'none'
  disableStatusBar?: boolean
  disableStatusBarPadding?: boolean
  inputEnabled?: boolean
  presentationStyle?:
    | 'fullScreen'
    | 'pageSheet'
    | 'formSheet'
    | 'overFullScreen'
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
    ...rest
  } = props
  const animationTypeCalculated =
    animationType ||
    Platform.select({
      web: 'none',
      default: 'slide',
    })

  const isTransparent = presentationStyle === 'pageSheet' ? false : true
  const headerBackgroundColor = useHeaderBackgroundColor()
  const insets = useSafeAreaInsets()

  return (
    <View style={[StyleSheet.absoluteFill]} pointerEvents="box-none">
      <Modal
        animationType={animationTypeCalculated}
        transparent={isTransparent}
        visible={visible}
        onRequestClose={rest.onDismiss}
        presentationStyle={presentationStyle || 'overFullScreen'}
        supportedOrientations={supportedOrientations}
        //@ts-ignore
        statusBarTranslucent={true}
      >
        <>
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
              {disableStatusBarPadding ? null : (
                <View
                  style={[
                    {
                      height: Platform.select({
                        ios: StatusBar.currentHeight,
                        android: StatusBar.currentHeight,
                        web: insets.top,
                      }),
                      backgroundColor: Platform.select({
                        ios: theme.colors.primary,
                        android: theme.colors.primary,
                        web: headerBackgroundColor,
                      }),
                    },
                  ]}
                />
              )}
              <DatePickerModalContent
                {...rest}
                inputEnabled={inputEnabled}
                disableSafeTop={disableStatusBar}
              />
            </View>
          </View>
        </>
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
