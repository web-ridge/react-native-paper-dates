import * as React from 'react'

import { IconButton } from 'react-native-paper'
import { StyleSheet } from 'react-native'
import DatePickerModal from './DatePickerModal'
import { useLatest } from '../utils'
import type { DatePickerInputProps } from './DatePickerInput.shared'
import DatePickerInputWithoutModal from './DatePickerInputWithoutModal'

function DatePickerInput(
  {
    withModal = true,
    calendarIcon = 'calendar',
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
      inputButtons={
        withModal ? (
          <IconButton
            size={24}
            style={styles.calendarButton}
            icon={calendarIcon}
            disabled={rest.disabled}
            onPress={() => setVisible(true)}
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
            uppercase={uppercase ?? true}
            startYear={startYear ?? 1800}
            endYear={endYear ?? 2200}
            inputEnabled={inputEnabled}
          />
        ) : null
      }
    />
  )
}

const styles = StyleSheet.create({
  calendarButton: { position: 'absolute', right: 0, zIndex: 10 },
})

export default React.forwardRef(DatePickerInput)
