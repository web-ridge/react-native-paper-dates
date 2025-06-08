import { TextInput } from 'react-native-paper'
import DatePickerModal from './DatePickerModal'
import { useLatest } from '../shared/utils'
import type { DatePickerInputProps } from './DatePickerInput.shared'
import DatePickerInputWithoutModal from './DatePickerInputWithoutModal'
import { Platform, StyleProp, ViewStyle } from 'react-native'
import { forwardRef, useCallback, useState } from 'react'
import { defaultStartYear, defaultEndYear } from './dateUtils'

function DatePickerInput(
  {
    withModal = true,
    calendarIcon = 'calendar',
    disableCalendarIcon = false,
    animationType = Platform.select({ web: 'none', default: 'slide' }),
    presentationStyle = 'overFullScreen',
    ...rest
  }: DatePickerInputProps,
  ref: any
) {
  const [visible, setVisible] = useState(false)

  const onChangeRef = useLatest(rest.onChange)

  const onDismiss = useCallback(() => {
    setVisible(false)
  }, [setVisible])

  const onInnerConfirm = useCallback(
    ({ date }: any) => {
      setVisible(false)
      onChangeRef.current(date)
    },
    [setVisible, onChangeRef]
  )

  return (
    <DatePickerInputWithoutModal
      ref={ref}
      {...rest}
      inputButton={
        withModal ? (
          <TextInput.Icon
            size={rest.iconSize ?? 24}
            icon={calendarIcon}
            color={rest.iconColor ?? undefined}
            forceTextInputFocus={false}
            disabled={rest.disabled || disableCalendarIcon}
            onPress={() => setVisible(true)}
            style={rest.iconStyle as StyleProp<ViewStyle>}
            testID={`${rest.testID || 'date-picker'}-icon-button`}
          />
        ) : null
      }
      // eslint-disable-next-line react/no-unstable-nested-components
      modal={({
        value,
        locale,
        inputMode,
        validRange,
        saveLabel,
        saveLabelDisabled,
        uppercase,
        startYear,
        endYear,
        inputEnabled,
        disableStatusBarPadding,
        startWeekOnMonday,
      }) =>
        withModal ? (
          <DatePickerModal
            date={value}
            mode="single"
            visible={visible}
            onDismiss={onDismiss}
            onConfirm={onInnerConfirm}
            locale={locale}
            dateMode={inputMode}
            validRange={validRange}
            saveLabel={saveLabel}
            saveLabelDisabled={saveLabelDisabled ?? false}
            uppercase={uppercase}
            startYear={startYear ?? defaultStartYear}
            endYear={endYear ?? defaultEndYear}
            inputEnabled={inputEnabled}
            disableStatusBarPadding={disableStatusBarPadding ?? false}
            animationType={animationType}
            presentationStyle={presentationStyle}
            label={rest.label as any}
            startWeekOnMonday={startWeekOnMonday}
            withDateFormatInLabel={rest.withDateFormatInLabel}
            placeholder={rest.placeholder}
          />
        ) : null
      }
    />
  )
}

export default forwardRef(DatePickerInput)
