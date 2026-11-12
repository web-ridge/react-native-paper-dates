import {
  Platform,
  StyleSheet,
  TextInput,
  TextInputProps,
  View,
} from 'react-native'
import { themeColor } from '../shared/utils'
import { TouchableRipple, useTheme } from 'react-native-paper'

import Color from 'color'
import {
  inputTypes,
  PossibleClockTypes,
  PossibleInputTypes,
  useInputColors,
} from './timeUtils'
import { forwardRef, useEffect, useState } from 'react'
import { sharedStyles } from '../shared/styles'

interface TimeInputProps extends Omit<
  Omit<Omit<TextInputProps, 'value'>, 'onFocus'>,
  'onPress'
> {
  clockType: PossibleClockTypes
  inputFontSize?: number
  inputType: PossibleInputTypes
  onChanged: (n: number) => any
  onPress?: (type: PossibleClockTypes) => any
  pressed: boolean
  value: number
}

function TimeInput(
  {
    clockType,
    inputFontSize = 57,
    inputType,
    onChanged,
    onPress,
    pressed,
    value,
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
          borderColor: highlighted
            ? theme.colors.onPrimaryContainer
            : undefined,
          borderRadius: theme.shapes.corner.small,
          borderWidth: highlighted ? 2 : 0,
          height: inputType === inputTypes.keyboard ? 72 : 80,
        },
      ]}
    >
      <TextInput
        keyboardAppearance={theme.dark ? 'dark' : 'default'}
        keyboardType="number-pad"
        maxFontSizeMultiplier={1.5}
        maxLength={2}
        onBlur={() => setInputFocused(false)}
        onChangeText={(e) => onInnerChange(Number(e))}
        onFocus={() => setInputFocused(true)}
        ref={ref}
        style={[
          styles.input,
          // eslint-disable-next-line react-native/no-inline-styles
          {
            color,
            fontFamily: theme.fonts.titleMedium.fontFamily,
            fontSize: inputFontSize,
            lineHeight:
              Platform.OS === 'android'
                ? Math.max(inputFontSize, 48)
                : undefined,
            paddingBottom: Platform.OS === 'android' ? 0 : undefined,
            paddingTop: Platform.OS === 'android' ? 0 : undefined,
            textAlign: 'center',
          },
        ]}
        textAlign="center"
        value={formattedValue}
        {...rest}
      />
      {onPress && inputType === inputTypes.picker ? (
        <TouchableRipple
          borderless={true}
          onPress={() => onPress(clockType)}
          rippleColor={
            Platform.OS !== 'ios'
              ? Color(themeColor(theme.colors.onSurface)).fade(0.7).hex()
              : undefined
          }
          style={[
            StyleSheet.absoluteFill,
            sharedStyles.overflowHidden,
            {
              borderRadius: theme.shapes.corner.extraSmall,
            },
          ]}
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
