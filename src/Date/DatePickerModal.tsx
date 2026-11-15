import {
  Modal,
  Platform,
  StyleSheet,
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
import ModalScrim from '../shared/ModalScrim'
import {
  rememberLayout,
  supportedOrientations,
  useIsLargeScreen,
} from '../shared/utils'

export function DatePickerModal(
  props:
    | DatePickerModalRangeProps
    | DatePickerModalSingleProps
    | DatePickerModalMultiProps
) {
  const {
    animationType,
    disableStatusBar,
    disableStatusBarPadding,
    inputEnabled,
    presentationStyle,
    statusBarOnTopOfBackdrop,
    visible,
    ...rest
  } = props
  const animationTypeCalculated =
    animationType ||
    Platform.select({
      default: 'slide',
      web: 'none',
    })
  const isLargeScreen = useIsLargeScreen()
  const [lastCalendarLayout, setLastCalendarLayout] = useState<{
    height: number
    width: number
    windowKey: string
  } | null>(null)
  const shouldUseSheet =
    Platform.OS === 'ios' &&
    (presentationStyle === 'pageSheet' || presentationStyle === 'formSheet')
  const isSheet = shouldUseSheet
  const centeredCard = isLargeScreen && !isSheet
  const theme = useTheme()
  const useFormSheet = shouldUseSheet && isLargeScreen
  const { height: windowHeight, width: windowWidth } = useWindowDimensions()
  const windowKey = `${windowWidth}x${windowHeight}`
  const onCalendarLayout = useCallback(
    ({ height, width }: { height: number; width: number }) => {
      setLastCalendarLayout((prev) =>
        rememberLayout(prev, { height, width, windowKey })
      )
    },
    [windowKey]
  )
  const rememberedCalendarLayout = useMemo(
    () =>
      lastCalendarLayout && lastCalendarLayout.windowKey === windowKey
        ? { height: lastCalendarLayout.height, width: lastCalendarLayout.width }
        : undefined,
    [lastCalendarLayout, windowKey]
  )

  return (
    <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
      <Modal
        animationType={animationTypeCalculated}
        onRequestClose={rest.onDismiss}
        presentationStyle={
          useFormSheet
            ? 'formSheet'
            : shouldUseSheet
              ? 'pageSheet'
              : 'overFullScreen'
        }
        statusBarTranslucent={!disableStatusBar}
        supportedOrientations={supportedOrientations}
        transparent={!isSheet}
        visible={visible}
      >
        <ModalScrim onDismiss={rest.onDismiss} />
        <View
          pointerEvents="box-none"
          style={[StyleSheet.absoluteFill, styles.modalRoot]}
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
              disableSafeTop={Boolean(disableStatusBarPadding) || centeredCard}
              disableStatusBar={disableStatusBar}
              initialLayout={rest.initialLayout ?? rememberedCalendarLayout}
              inputEnabled={inputEnabled}
              onCalendarLayout={onCalendarLayout}
              placeholder={props.placeholder}
              statusBarOnTopOfBackdrop={isSheet || statusBarOnTopOfBackdrop}
              withDateFormatInLabel={props.withDateFormatInLabel}
            />
          </View>
        </View>
      </Modal>
    </View>
  )
}

interface DatePickerModalProps {
  animationType?: 'slide' | 'fade' | 'none'
  disableStatusBar?: boolean
  disableStatusBarPadding?: boolean
  inputEnabled?: boolean
  presentationStyle?: 'pageSheet' | 'formSheet' | 'overFullScreen'
  visible: boolean
}

export interface DatePickerModalMultiProps
  extends DatePickerModalContentMultiProps, DatePickerModalProps {}

export interface DatePickerModalRangeProps
  extends DatePickerModalContentRangeProps, DatePickerModalProps {}

export interface DatePickerModalSingleProps
  extends DatePickerModalContentSingleProps, DatePickerModalProps {}

const styles = StyleSheet.create({
  modalContent: {
    flex: 1,
    minHeight: 0,
    width: '100%',
  },
  modalContentBig: {
    borderRadius: 28,
    maxHeight: 568,
    maxWidth: 360,
    overflow: 'hidden',
    width: '100%',
  },
  modalContentFormSheet: {
    borderRadius: 28,
    maxHeight: 568,
    maxWidth: 360,
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
