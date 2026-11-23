import {
  type ComponentRef,
  forwardRef,
  type Ref,
  useCallback,
  useRef,
  useState,
} from 'react'
import { Platform, StyleProp, View, ViewStyle } from 'react-native'
import { TextInput, type TextInputHandles } from 'react-native-paper'

import { useIsLargeScreen, useLatest } from '../shared/utils'
import { getTranslation } from '../translations/utils'
import DatePickerDocked, { type DatePickerAnchor } from './DatePickerDocked'
import type { DatePickerInputProps } from './DatePickerInput.shared'
import DatePickerInputWithoutModal from './DatePickerInputWithoutModal'
import DatePickerModal from './DatePickerModal'
import { defaultEndYear, defaultStartYear } from './dateUtils'
import type { CalendarDate } from './types'

function readAnchor(node: unknown): DatePickerAnchor | null {
  if (!node || typeof node !== 'object') return null
  const host = node as {
    getBoundingClientRect?: () => {
      height: number
      left: number
      top: number
      width: number
    }
  }
  if (typeof host.getBoundingClientRect !== 'function') return null
  const rect = host.getBoundingClientRect()
  if (rect.width <= 0 && rect.height <= 0) return null
  return {
    height: rect.height,
    width: rect.width,
    x: rect.left,
    y: rect.top,
  }
}

function DatePickerInput(
  {
    animationType = Platform.select({ default: 'slide', web: 'none' }),
    calendarIcon = 'calendar',
    disableCalendarIcon = false,
    disableStatusBar,
    disableStatusBarPadding,
    endYear,
    inputEnabled,
    inputMode,
    label,
    locale,
    placeholder,
    presentation = 'auto',
    presentationStyle = 'overFullScreen',
    saveLabel,
    saveLabelDisabled,
    startWeekOnMonday,
    startYear,
    uppercase,
    validRange,
    value,
    withDateFormatInLabel,
    withModal = true,
    ...rest
  }: DatePickerInputProps,
  ref: Ref<TextInputHandles>
) {
  const isLargeScreen = useIsLargeScreen()

  const [anchor, setAnchor] = useState<DatePickerAnchor | null>(null)
  const [visible, setVisible] = useState(false)

  const anchorRef = useRef<ComponentRef<typeof View>>(null)
  const onChangeRef = useLatest(rest.onChange)

  const docked =
    presentation === 'docked' || (presentation === 'auto' && isLargeScreen)

  const onDismiss = useCallback(() => {
    setVisible(false)
  }, [])

  const onInnerConfirm = useCallback(
    ({ date }: { date: CalendarDate }) => {
      setVisible(false)
      onChangeRef.current(date)
    },
    [onChangeRef]
  )

  const openPicker = useCallback(() => {
    const node = anchorRef.current
    const rect = readAnchor(node)
    if (rect) {
      setAnchor(rect)
      setVisible(true)
      return
    }
    setVisible(true)
    const measurable = node as {
      measureInWindow?: (
        callback: (x: number, y: number, width: number, height: number) => void
      ) => void
    } | null
    if (measurable && typeof measurable.measureInWindow === 'function') {
      measurable.measureInWindow((x, y, width, height) => {
        setAnchor({ height, width, x, y })
      })
    }
  }, [])

  const pickerProps = {
    date: value,
    dateMode: inputMode,
    endYear: endYear ?? defaultEndYear,
    locale,
    onConfirm: onInnerConfirm,
    onDismiss,
    saveLabel,
    saveLabelDisabled: saveLabelDisabled ?? false,
    startWeekOnMonday,
    startYear: startYear ?? defaultStartYear,
    uppercase,
    validRange,
    visible,
  }

  return (
    <View ref={anchorRef} collapsable={false}>
      <DatePickerInputWithoutModal
        ref={ref}
        {...rest}
        inputButton={
          withModal ? (
            <TextInput.Icon
              accessibilityLabel={getTranslation(
                locale,
                'pickDateFromCalendar'
              )}
              disabled={rest.disabled || disableCalendarIcon}
              error={false}
              icon={calendarIcon}
              iconColor={rest.iconColor ?? undefined}
              iconSize={rest.iconSize ?? 24}
              multiline={false}
              onPress={openPicker}
              style={rest.iconStyle as StyleProp<ViewStyle>}
              testID={`${rest.testID || 'date-picker'}-icon-button`}
            />
          ) : null
        }
        inputEnabled={inputEnabled}
        inputMode={inputMode}
        label={label}
        locale={locale}
        modal={
          withModal && docked ? (
            <DatePickerDocked {...pickerProps} anchor={anchor} />
          ) : withModal ? (
            <DatePickerModal
              {...pickerProps}
              animationType={animationType}
              disableStatusBar={disableStatusBar}
              disableStatusBarPadding={disableStatusBarPadding ?? false}
              inputEnabled={inputEnabled}
              label={label}
              mode="single"
              placeholder={placeholder}
              presentationStyle={presentationStyle}
              withDateFormatInLabel={withDateFormatInLabel}
            />
          ) : null
        }
        placeholder={placeholder}
        validRange={validRange}
        value={value}
        withDateFormatInLabel={withDateFormatInLabel}
      />
    </View>
  )
}

export default forwardRef(DatePickerInput)
