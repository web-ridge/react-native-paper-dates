import * as React from 'react'
import { View, TextInput, TextInputProps, StyleSheet } from 'react-native'
import { useTheme, TouchableRipple } from 'react-native-paper'

import Color from 'color'
import { inputTypes, PossibleClockTypes, PossibleInputTypes } from './timeUtils'
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

  // 2-digit does not work on all devices..

  const formattedValue = `${value}`.length === 1 ? `0${value}` : `${value}`
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
    <View style={styles.root}>
      <TextInput
        style={[
          styles.input,
          {
            color,
            backgroundColor,
            borderRadius: theme.roundness,
          },
        ]}
        value={formattedValue}
        maxLength={2}
        onFocus={onInnerFocus}
        keyboardAppearance={theme.dark ? 'dark' : 'default'}
        keyboardType="number-pad"
        {...rest}
      />
      {inputType === inputTypes.picker ? (
        <TouchableRipple
          style={[
            StyleSheet.absoluteFill,
            styles.buttonOverlay,
            {
              // backgroundColor: 'blue',
              borderRadius: theme.roundness,
            },
          ]}
          rippleColor={Color(theme.colors.primary).fade(0.7).hex()}
          onPress={() => onFocus(clockType)}
        >
          <View />
        </TouchableRipple>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  root: { position: 'relative', height: 80, width: 96 },
  input: {
    fontSize: 50,
    textAlign: 'center',
    textAlignVertical: 'center',
    width: 96,
    height: 80,
  },
  buttonOverlay: { overflow: 'hidden' },
})
