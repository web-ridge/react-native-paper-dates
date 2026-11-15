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
import DatePickerDocked, { type DatePickerAnchor } from './DatePickerDocked'
import type { DatePickerInputProps } from './DatePickerInput.shared'
import DatePickerInputWithoutModal from './DatePickerInputWithoutModal'
import DatePickerModal from './DatePickerModal'
import { defaultEndYear, defaultStartYear } from './dateUtils'
import type { CalendarDate } from './types'

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
  const anchorRef = useRef<ComponentRef<typeof View>>(null)
  const onChangeRef = useLatest(rest.onChange)
  const isLargeScreen = useIsLargeScreen()
  const docked =
    presentation === 'docked' || (presentation === 'auto' && isLargeScreen)

  const [anchor, setAnchor] = useState<DatePickerAnchor | null>(null)
  const [visible, setVisible] = useState(false)
  const onDismiss = useCallback(() => {
    setVisible(false)
  }, [])
  const openPicker = useCallback(() => {
    const node = anchorRef.current
    const rect = readAnchor(node)
    if (rect) {
      setAnchor(rect)
      setVisible(true)
      return
    }
    // The web measurement callback is deferred. Opening first, then applying
    // that callback, left the menu at the fallback corner.
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
  const onInnerConfirm = useCallback(
    ({ date }: { date: CalendarDate }) => {
      setVisible(false)
      onChangeRef.current(date)
    },
    [onChangeRef]
  )

  return (
    <View ref={anchorRef} collapsable={false}>
      <DatePickerInputWithoutModal
        ref={ref}
        {...rest}
        inputButton={
          withModal ? (
            <TextInput.Icon
              disabled={rest.disabled || disableCalendarIcon}
              error={false}
              icon={calendarIcon}
              iconColor={rest.iconColor ?? undefined}
              multiline={false}
              onPress={openPicker}
              size={rest.iconSize ?? 24}
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
            <DatePickerDocked
              anchor={anchor}
              date={value}
              dateMode={inputMode}
              endYear={endYear ?? defaultEndYear}
              locale={locale}
              onConfirm={onInnerConfirm}
              onDismiss={onDismiss}
              saveLabel={saveLabel}
              saveLabelDisabled={saveLabelDisabled ?? false}
              startWeekOnMonday={startWeekOnMonday}
              startYear={startYear ?? defaultStartYear}
              uppercase={uppercase}
              validRange={validRange}
              visible={visible}
            />
          ) : withModal ? (
            <DatePickerModal
              animationType={animationType}
              date={value}
              dateMode={inputMode}
              disableStatusBar={disableStatusBar}
              disableStatusBarPadding={disableStatusBarPadding ?? false}
              endYear={endYear ?? defaultEndYear}
              inputEnabled={inputEnabled}
              label={label}
              locale={locale}
              mode="single"
              onConfirm={onInnerConfirm}
              onDismiss={onDismiss}
              placeholder={placeholder}
              presentationStyle={presentationStyle}
              saveLabel={saveLabel}
              saveLabelDisabled={saveLabelDisabled ?? false}
              startWeekOnMonday={startWeekOnMonday}
              startYear={startYear ?? defaultStartYear}
              uppercase={uppercase}
              validRange={validRange}
              visible={visible}
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

export default forwardRef(DatePickerInput)
