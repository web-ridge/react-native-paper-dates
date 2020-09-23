import * as React from 'react'
import { TextInput, TextInputProps, StyleSheet } from 'react-native'
import { useTheme } from 'react-native-paper'

import { PossibleTypes } from './TimePicker'

interface TimeInputProps
  extends Omit<Omit<TextInputProps, 'value'>, 'onFocus'> {
  value: number
  type: PossibleTypes
  onFocus: (type: PossibleTypes) => any
  focused: boolean
  focusedColor: string
}

export default function TimeInput({
  value,
  type,
  focused,
  onFocus,
  focusedColor,
  ...rest
}: TimeInputProps) {
  const theme = useTheme()
  let dateAndTime, formatter
  if (type === 'hours') {
    dateAndTime = new Date().setHours(value)
    formatter = new Intl.DateTimeFormat(undefined, { hour: '2-digit' })
  } else {
    dateAndTime = new Date().setMinutes(value)
    formatter = new Intl.DateTimeFormat(undefined, { minute: '2-digit' })
  }

  const formattedValue = formatter!.format(dateAndTime)
  const onInnerFocus = () => {
    onFocus(type)
  }
  return (
    <TextInput
      style={[
        styles.root,
        {
          color: focused ? theme.colors.primary : '#000',
          backgroundColor: focused ? focusedColor : '#E4E4E4',
          borderRadius: theme.roundness,
        },
      ]}
      value={formattedValue}
      onFocus={onInnerFocus}
      {...rest}
    />
  )
}

const styles = StyleSheet.create({
  root: {
    fontSize: 40,
    paddingTop: 12,
    paddingBottom: 12,
    textAlign: 'center',
    width: 70,
    height: 65,
  },
})
