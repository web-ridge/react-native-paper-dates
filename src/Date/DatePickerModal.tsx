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
import { memo, useCallback, useMemo, useState } from 'react'
import { sharedStyles } from '../shared/styles'
import {
  scrimColor,
  supportedOrientations,
  useIsLargeScreen,
} from '../shared/utils'

interface DatePickerModalProps {
  visible: boolean
  animationType?: 'slide' | 'fade' | 'none'
  disableStatusBar?: boolean
  disableStatusBarPadding?: boolean
  inputEnabled?: boolean
  presentationStyle?: 'pageSheet' | 'formSheet' | 'overFullScreen'
}

export interface DatePickerModalSingleProps
  extends DatePickerModalContentSingleProps, DatePickerModalProps {}

export interface DatePickerModalMultiProps
  extends DatePickerModalContentMultiProps, DatePickerModalProps {}

export interface DatePickerModalRangeProps
  extends DatePickerModalContentRangeProps, DatePickerModalProps {}

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

  // The calendar unmounts when the modal closes. Keep its size from the last
  // open, so the next open draws the month on the first frame instead of
  // waiting for the calendar to measure itself. Only reused for the same window
  // size, since rotating or resizing changes the layout.
  const { width: windowWidth, height: windowHeight } = useWindowDimensions()
  const windowKey = `${windowWidth}x${windowHeight}`
  const [lastCalendarLayout, setLastCalendarLayout] = useState<{
    windowKey: string
    width: number
    height: number
  } | null>(null)
  const onCalendarLayout = useCallback(
    ({ width, height }: { width: number; height: number }) => {
      setLastCalendarLayout((prev) =>
        prev &&
        prev.windowKey === windowKey &&
        prev.width === width &&
        prev.height === height
          ? prev
          : { windowKey, width, height }
      )
    },
    [windowKey]
  )
  const rememberedCalendarLayout = useMemo(
    () =>
      lastCalendarLayout && lastCalendarLayout.windowKey === windowKey
        ? { width: lastCalendarLayout.width, height: lastCalendarLayout.height }
        : undefined,
    [lastCalendarLayout, windowKey]
  )

  const theme = useTheme()
  const isLargeScreen = useIsLargeScreen()
  const shouldUseSheet =
    Platform.OS === 'ios' &&
    (presentationStyle === 'pageSheet' || presentationStyle === 'formSheet')
  const useFormSheet = shouldUseSheet && isLargeScreen
  const isSheet = shouldUseSheet

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Modal
        animationType={animationTypeCalculated}
        transparent={!isSheet}
        visible={visible}
        onRequestClose={rest.onDismiss}
        presentationStyle={
          useFormSheet
            ? 'formSheet'
            : shouldUseSheet
              ? 'pageSheet'
              : 'overFullScreen'
        }
        supportedOrientations={supportedOrientations}
        statusBarTranslucent={!disableStatusBar}
      >
        <TouchableWithoutFeedback onPress={rest.onDismiss}>
          <View
            style={[
              StyleSheet.absoluteFill,
              sharedStyles.root,
              { backgroundColor: scrimColor(theme.colors.scrim) },
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
              { backgroundColor: theme.colors.elevation.level3 },
              isLargeScreen
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
              initialLayout={rest.initialLayout ?? rememberedCalendarLayout}
              onCalendarLayout={onCalendarLayout}
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
    minHeight: 0,
    width: '100%',
  },
  modalContentBig: {
    borderRadius: 28,
    maxHeight: 600,
    maxWidth: 400,
    overflow: 'hidden',
    width: '100%',
  },
  modalContentFormSheet: {
    borderRadius: 28,
    maxHeight: 600,
    maxWidth: 520,
    overflow: 'hidden',
    width: '100%',
  },
  modalRoot: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
})

export default memo(DatePickerModal)
