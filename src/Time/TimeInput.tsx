import * as React from 'react'
import { View, TextInput, TextInputProps, StyleSheet } from 'react-native'
import { useTheme, TouchableRipple } from 'react-native-paper'

import { inputTypes, PossibleInputTypes, PossibleTypes } from './TimePicker'
import Color from 'color'

interface TimeInputProps
  extends Omit<Omit<TextInputProps, 'value'>, 'onFocus'> {
  value: number
  type: PossibleTypes
  onFocus: (type: PossibleTypes) => any
  focused: boolean
  focusedColor: string
  inputType: PossibleInputTypes
}

export default function TimeInput({
  value,
  type,
  focused,
  onFocus,
  focusedColor,
  inputType,
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
    <View style={{ flex: 1, position: 'relative', height: 65 }}>
      <TextInput
        style={[
          styles.root,
          {
            // color: focused ? theme.colors.primary : '#000',
            // backgroundColor: focused ? focusedColor : '#E4E4E4',
            color: theme.dark ? '#fff' : '#000',
            backgroundColor: theme.dark
              ? Color(theme.colors.surface).lighten(1.2).hex()
              : Color(theme.colors.surface).darken(0.1).hex(),
            borderRadius: theme.roundness,
          },
        ]}
        value={formattedValue}
        onFocus={onInnerFocus}
        {...rest}
      />
      {inputType === inputTypes.picker ? (
        <TouchableRipple
          style={[
            StyleSheet.absoluteFill,
            {
              // backgroundColor: 'blue',
              borderRadius: theme.roundness,
              overflow: 'hidden',
            },
          ]}
          onPress={() => onFocus(type)}
        >
          <View />
        </TouchableRipple>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    fontSize: 40,
    paddingTop: 12,
    paddingBottom: 12,
    textAlign: 'center',
    flex: 1,
    height: 65,
  },
})
