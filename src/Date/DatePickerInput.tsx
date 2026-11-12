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
    animationType = Platform.select({ web: 'none', default: 'slide' }),
    calendarIcon = 'calendar',
    disableCalendarIcon = false,
    presentationStyle = 'overFullScreen',
    withModal = true,
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
      // eslint-disable-next-line react/no-unstable-nested-components
      modal={({
        disableStatusBar,
        disableStatusBarPadding,
        endYear,
        inputEnabled,
        inputMode,
        locale,
        saveLabel,
        saveLabelDisabled,
        startWeekOnMonday,
        startYear,
        uppercase,
        validRange,
        value,
      }) =>
        withModal ? (
          <DatePickerModal
            animationType={animationType}
            date={value}
            dateMode={inputMode}
            disableStatusBar={disableStatusBar}
            disableStatusBarPadding={disableStatusBarPadding ?? false}
            endYear={endYear ?? defaultEndYear}
            inputEnabled={inputEnabled}
            label={rest.label as any}
            locale={locale}
            mode="single"
            onConfirm={onInnerConfirm}
            onDismiss={onDismiss}
            placeholder={rest.placeholder}
            presentationStyle={presentationStyle}
            saveLabel={saveLabel}
            saveLabelDisabled={saveLabelDisabled ?? false}
            startWeekOnMonday={startWeekOnMonday}
            startYear={startYear ?? defaultStartYear}
            uppercase={uppercase}
            validRange={validRange}
            visible={visible}
            withDateFormatInLabel={rest.withDateFormatInLabel}
          />
        ) : null
      }
    />
  )
}

export default forwardRef(DatePickerInput)
