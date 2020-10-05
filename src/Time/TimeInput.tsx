import * as React from 'react'
import { View, TextInput, TextInputProps, StyleSheet } from 'react-native'
import { useTheme, TouchableRipple } from 'react-native-paper'

import Color from 'color'
import {
  clockTypes,
  inputTypes,
  PossibleClockTypes,
  PossibleInputTypes,
} from './timeUtils'
import { useMemo } from 'react'

interface TimeInputProps
  extends Omit<Omit<TextInputProps, 'value'>, 'onFocus'> {
  value: number
  clockType: PossibleClockTypes
  onFocus: (type: PossibleClockTypes) => any
  focused: boolean

  inputType: PossibleInputTypes
}

export default function TimeInput({
  value,
  clockType,
  focused,
  onFocus,

  inputType,
  ...rest
}: TimeInputProps) {
  const theme = useTheme()
  let dateAndTime, formatter
  if (clockType === clockTypes.hours) {
    dateAndTime = new Date().setHours(value)
    formatter = new Intl.DateTimeFormat(undefined, { hour: '2-digit' })
  } else {
    dateAndTime = new Date().setMinutes(value)
    formatter = new Intl.DateTimeFormat(undefined, {
      minute: '2-digit',
    })
  }

  // 2-digit does not work on all devices..
  const bug = formatter!.format(dateAndTime)
  const formattedValue = bug.length === 1 ? `0${bug}` : bug
  const onInnerFocus = () => {
    onFocus(clockType)
  }

  const backgroundColor = useMemo<string>(() => {
    if (theme.dark) {
      if (focused) {
        return Color(theme.colors.primary).hex()
      }
      return Color(theme.colors.surface).lighten(1.2).hex()
    }

    if (focused) {
      return Color(theme.colors.primary).lighten(1).hex()
    }
    return Color(theme.colors.surface).darken(0.1).hex()
  }, [focused, theme])

  const color = useMemo<string>(() => {
    if (focused && !theme.dark) {
      return theme.colors.primary
    }
    return theme.colors.text
  }, [focused, theme])

  return (
    <View style={{ flex: 1, position: 'relative', height: 65 }}>
      <TextInput
        style={[
          styles.root,
          {
            color,
            backgroundColor,
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
          onPress={() => onFocus(clockType)}
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
