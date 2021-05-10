import * as React from 'react'
import { useMemo } from 'react'
import {
  Modal,
  Platform,
  StatusBar,
  StyleSheet,
  TouchableWithoutFeedback,
  useWindowDimensions,
  View,
} from 'react-native'

import { withTheme } from 'react-native-paper'
import DatePickerModalContent, {
  DatePickerModalContentMultiProps,
  DatePickerModalContentRangeProps,
  DatePickerModalContentSingleProps,
} from './DatePickerModalContent'
import Color from 'color'
import { useHeaderColorIsLight } from '../utils'

interface DatePickerModalProps {
  visible: boolean
  animationType?: 'slide' | 'fade' | 'none'
  disableStatusBar?: boolean
  disableStatusBarPadding?: boolean
  theme: ReactNativePaper.Theme
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
  const dimensions = useWindowDimensions()
  const {
    visible,
    animationType,
    disableStatusBar,
    disableStatusBarPadding,
    theme,
    ...rest
  } = props
  const animationTypeCalculated =
    animationType ||
    Platform.select({
      web: 'none',
      default: 'slide',
    })

  const isLight = useHeaderColorIsLight(theme)
  const statusBarColor = useMemo<string>(
    () => Color(theme.colors.primary).darken(0.2).hex(),
    [theme]
  )

  return (
    <View style={[StyleSheet.absoluteFill]} pointerEvents="box-none">
      <Modal
        animationType={animationTypeCalculated}
        transparent={true}
        visible={visible}
        onRequestClose={rest.onDismiss}
        presentationStyle="overFullScreen"
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
              {disableStatusBar ? null : (
                <StatusBar
                  translucent={true}
                  barStyle={isLight ? 'dark-content' : 'light-content'}
                />
              )}
              {disableStatusBarPadding ? null : (
                <View
                  style={[
                    {
                      height: StatusBar.currentHeight,
                      backgroundColor: statusBarColor,
                    },
                  ]}
                />
              )}
              <DatePickerModalContent
                {...rest}
                disableSafeTop={disableStatusBar}
                theme={theme}
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

export default withTheme(React.memo(DatePickerModal))
