import { memo, useCallback, useMemo, useState } from 'react'
import {
  Modal,
  Platform,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native'
import { useTheme } from 'react-native-paper'

import ElevatedCard from '../shared/ElevatedCard'
import ModalScrim from '../shared/ModalScrim'
import { useModalAnimation } from '../shared/motion'
import {
  rememberLayout,
  supportedOrientations,
  useIsLargeScreen,
} from '../shared/utils'
import {
  dateInputMaxHeight,
  datePickerRangeMaxHeight,
  datePickerSingleMaxHeight,
} from './dateUtils'
import { dateInputCardWidth } from './DatePickerInputForm'
import DatePickerModalContent, {
  DatePickerModalContentMultiProps,
  DatePickerModalContentRangeProps,
  DatePickerModalContentSingleProps,
} from './DatePickerModalContent'

export interface DatePickerModalMultiProps
  extends DatePickerModalContentMultiProps, DatePickerModalProps {}
interface DatePickerModalProps {
  animationType?: 'slide' | 'fade' | 'none'
  disableStatusBar?: boolean
  disableStatusBarPadding?: boolean
  inputEnabled?: boolean
  presentationStyle?: 'pageSheet' | 'formSheet' | 'overFullScreen'
  visible: boolean
}
export interface DatePickerModalRangeProps
  extends DatePickerModalContentRangeProps, DatePickerModalProps {}
export interface DatePickerModalSingleProps
  extends DatePickerModalContentSingleProps, DatePickerModalProps {}

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
  const animationTypeCalculated = useModalAnimation(
    animationType,
    Platform.OS === 'web' ? 'none' : 'slide'
  )
  const [inputMode, setInputMode] = useState(
    () => props.mode !== 'multiple' && props.displayMode === 'input'
  )
  const onDisplayModeChange = useCallback((next: 'calendar' | 'input') => {
    setInputMode(next === 'input')
  }, [])
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
  const inputWidth = dateInputCardWidth(windowWidth)
  const singleCard = props.mode === 'single' && !inputMode
  const specMaxHeight = inputMode
    ? dateInputMaxHeight
    : props.mode === 'single'
      ? datePickerSingleMaxHeight
      : datePickerRangeMaxHeight
  const cardMaxHeight = Math.min(specMaxHeight, Math.max(windowHeight - 32, 0))
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

  const cardStyle = [
    inputMode && isLargeScreen && !useFormSheet
      ? styles.inputCard
      : singleCard && isLargeScreen
        ? styles.singleCard
        : styles.modalContent,
    inputMode && isLargeScreen && !useFormSheet
      ? { maxHeight: cardMaxHeight, width: inputWidth }
      : isLargeScreen
        ? [
            useFormSheet
              ? styles.modalContentFormSheet
              : singleCard
                ? styles.singleCard
                : styles.modalContentBig,
            { maxHeight: cardMaxHeight },
          ]
        : null,
  ]
  const content = (
    <DatePickerModalContent
      {...rest}
      disableSafeTop={Boolean(disableStatusBarPadding) || centeredCard}
      disableStatusBar={disableStatusBar}
      initialLayout={rest.initialLayout ?? rememberedCalendarLayout}
      inputEnabled={inputEnabled}
      onCalendarLayout={onCalendarLayout}
      onDisplayModeChange={onDisplayModeChange}
      placeholder={props.placeholder}
      statusBarOnTopOfBackdrop={isSheet || statusBarOnTopOfBackdrop}
      withDateFormatInLabel={props.withDateFormatInLabel}
    />
  )

  return (
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
        {centeredCard ? (
          <ElevatedCard style={cardStyle}>{content}</ElevatedCard>
        ) : (
          <View
            style={[
              cardStyle,
              { backgroundColor: theme.colors.surfaceContainerHigh },
            ]}
          >
            {content}
          </View>
        )}
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  inputCard: {
    flexGrow: 0,
    maxHeight: dateInputMaxHeight,
    maxWidth: 328,
  },
  modalContent: {
    flex: 1,
    minHeight: 0,
    width: '100%',
  },
  modalContentBig: {
    maxWidth: 360,
    width: '100%',
  },
  modalContentFormSheet: {
    borderRadius: 28,
    maxWidth: 360,
    overflow: 'hidden',
    width: '100%',
  },
  singleCard: {
    flexGrow: 0,
    maxWidth: 360,
    width: '100%',
  },
  modalRoot: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
})

export default memo(DatePickerModal)
