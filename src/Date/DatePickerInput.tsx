import { TextInput, type TextInputHandles } from 'react-native-paper'
import DatePickerModal from './DatePickerModal'
import { useLatest } from '../shared/utils'
import type { DatePickerInputProps } from './DatePickerInput.shared'
import DatePickerInputWithoutModal from './DatePickerInputWithoutModal'
import { Platform, StyleProp, ViewStyle } from 'react-native'
import { forwardRef, type Ref, useCallback, useState } from 'react'
import type { CalendarDate } from './types'
import { defaultEndYear, defaultStartYear } from './dateUtils'

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
  const onChangeRef = useLatest(rest.onChange)

  const [visible, setVisible] = useState(false)

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

  return (
    <DatePickerInputWithoutModal
      ref={ref}
      {...rest}
      inputEnabled={inputEnabled}
      inputMode={inputMode}
      label={label}
      locale={locale}
      placeholder={placeholder}
      validRange={validRange}
      value={value}
      withDateFormatInLabel={withDateFormatInLabel}
      inputButton={
        withModal ? (
          <TextInput.Icon
            disabled={rest.disabled || disableCalendarIcon}
            error={false}
            icon={calendarIcon}
            iconColor={rest.iconColor ?? undefined}
            multiline={false}
            onPress={() => setVisible(true)}
            size={rest.iconSize ?? 24}
            style={rest.iconStyle as StyleProp<ViewStyle>}
            testID={`${rest.testID || 'date-picker'}-icon-button`}
          />
        ) : null
      }
      modal={
        withModal ? (
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
    />
  )
}

export default forwardRef(DatePickerInput)
