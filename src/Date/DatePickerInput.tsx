import * as React from 'react'

import { TextInput } from 'react-native-paper'
import DatePickerModal from './DatePickerModal'
import { useLatest } from '../utils'
import type { DatePickerInputProps } from './DatePickerInput.shared'
import DatePickerInputWithoutModal from './DatePickerInputWithoutModal'
import { Platform, StyleProp, ViewStyle } from 'react-native'

function DatePickerInput(
  {
    withModal = true,
    calendarIcon = 'calendar',
    animationType = Platform.select({ web: 'none', default: 'slide' }),
    presentationStyle = 'overFullScreen',
    ...rest
  }: DatePickerInputProps,
  ref: any
) {
  const [visible, setVisible] = React.useState<boolean>(false)
  const onDismiss = React.useCallback(() => {
    setVisible(false)
  }, [setVisible])
  const onChangeRef = useLatest(rest.onChange)
  const onInnerConfirm = React.useCallback(
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
            disabled={rest.disabled}
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
            startYear={startYear ?? 1800}
            endYear={endYear ?? 2200}
            inputEnabled={inputEnabled}
            disableStatusBarPadding={disableStatusBarPadding ?? false}
            animationType={animationType}
            presentationStyle={presentationStyle}
            label={rest.label as any}
            startWeekOnMonday={startWeekOnMonday}
          />
        ) : null
      }
    />
  )
}

export default React.forwardRef(DatePickerInput)
