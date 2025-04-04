import {
  Platform,
  StyleSheet,
  TextInput,
  TextInputProps,
  View,
} from 'react-native'
import { MD2Theme, TouchableRipple, useTheme } from 'react-native-paper'

import Color from 'color'
import {
  inputTypes,
  PossibleClockTypes,
  PossibleInputTypes,
  useInputColors,
} from './timeUtils'
import { forwardRef, useEffect, useState } from 'react'
import { sharedStyles } from '../shared/styles'

interface TimeInputProps
  extends Omit<Omit<Omit<TextInputProps, 'value'>, 'onFocus'>, 'onPress'> {
  value: number
  clockType: PossibleClockTypes
  onPress?: (type: PossibleClockTypes) => any
  pressed: boolean
  onChanged: (n: number) => any
  inputType: PossibleInputTypes
  inputFontSize?: number
}

function TimeInput(
  {
    value,
    clockType,
    pressed,
    onPress,
    onChanged,
    inputType,
    inputFontSize = 57,
    ...rest
  }: TimeInputProps,
  ref: any
) {
  const theme = useTheme()
  const [inputFocused, setInputFocused] = useState<boolean>(false)

  const [controlledValue, setControlledValue] = useState(`${value}`)

  const highlighted = inputType === inputTypes.picker ? pressed : inputFocused

  const { color, backgroundColor } = useInputColors(highlighted)

  useEffect(() => {
    setControlledValue(`${value}`)
  }, [value])

  const onInnerChange = (number: number) => {
    setControlledValue(`${number}`)
    if (number >= 0) {
      onChanged(Number(number))
    }
  }

  let formattedValue = controlledValue
  if (!inputFocused) {
    formattedValue =
      controlledValue.length === 1
        ? `0${controlledValue}`
        : `${controlledValue}`
  }

  return (
    <View
      style={[
        styles.root,
        // eslint-disable-next-line react-native/no-inline-styles
        {
          backgroundColor,
          borderRadius: theme.roundness * 2,
          borderColor:
            theme.isV3 && highlighted
              ? theme.colors.onPrimaryContainer
              : undefined,
          borderWidth: theme.isV3 && highlighted ? 2 : 0,
          height: inputType === inputTypes.keyboard ? 72 : 80,
        },
      ]}
    >
      <TextInput
        ref={ref}
        textAlign="center"
        style={[
          styles.input,
          // eslint-disable-next-line react-native/no-inline-styles
          {
            color,
            fontFamily: theme?.isV3
              ? theme.fonts.titleMedium.fontFamily
              : (theme as any as MD2Theme).fonts.medium.fontFamily,
            fontSize: inputFontSize,
            lineHeight:
              Platform.OS === 'android'
                ? Math.max(inputFontSize, 48)
                : undefined,
            paddingTop: Platform.OS === 'android' ? 10 : undefined,
            paddingBottom: Platform.OS === 'android' ? 0 : undefined,
            textAlign: 'center',
          },
        ]}
        maxFontSizeMultiplier={1.5}
        value={formattedValue}
        maxLength={2}
        onFocus={() => setInputFocused(true)}
        onBlur={() => setInputFocused(false)}
        keyboardAppearance={theme.dark ? 'dark' : 'default'}
        keyboardType="number-pad"
        onChangeText={(e) => onInnerChange(Number(e))}
        {...rest}
      />
      {onPress && inputType === inputTypes.picker ? (
        <TouchableRipple
          style={[
            StyleSheet.absoluteFill,
            sharedStyles.overflowHidden,
            {
              borderRadius: theme.roundness,
            },
          ]}
          rippleColor={
            Platform.OS !== 'ios'
              ? Color(theme.colors.onSurface).fade(0.7).hex()
              : undefined
          }
          onPress={() => onPress(clockType)}
          borderless={true}
        >
          <View />
        </TouchableRipple>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 96,
  },
  input: {
    width: 96,
  },
})

export default forwardRef(TimeInput)
