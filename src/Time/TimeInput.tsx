import {
  forwardRef,
  type ForwardRefExoticComponent,
  type Ref,
  type RefAttributes,
  useEffect,
  useState,
} from 'react'
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  type TextInputInstance,
  type TextInputProps,
  View,
} from 'react-native'
import { useTheme } from 'react-native-paper'

import { sharedStyles } from '../shared/styles'
import StateLayer from '../shared/StateLayer'
import FocusRing from './FocusRing'
import {
  clockTypes,
  inputTypes,
  isValidHourInput,
  isValidMinuteInput,
  type PossibleClockTypes,
  type PossibleInputTypes,
  timeInputFieldHeight,
  timeSelectorHeight,
  timeSelectorWidth,
  useInputColors,
} from './timeUtils'

interface TimeInputProps extends Omit<
  Omit<Omit<TextInputProps, 'value'>, 'onFocus'>,
  'onPress'
> {
  accessibilityLabel?: string
  clockType: PossibleClockTypes
  disabled?: boolean
  inputFontSize?: number
  inputType: PossibleInputTypes
  is24Hour?: boolean
  onChanged: (n: number) => void
  onInvalidChange?: (invalid: boolean) => void
  onPress?: (type: PossibleClockTypes) => void
  pressed: boolean
  value: number
  width?: number
}

function TimeInput(
  {
    accessibilityLabel,
    clockType,
    disabled,
    inputFontSize,
    inputType,
    is24Hour = false,
    onChanged,
    onInvalidChange,
    onPress,
    pressed,
    value,
    width = timeSelectorWidth,
    ...rest
  }: TimeInputProps,
  ref: Ref<TextInputInstance>
) {
  const [controlledValue, setControlledValue] = useState(`${value}`)
  const [editing, setEditing] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [inputFocused, setInputFocused] = useState(false)
  const [pointerPressed, setPointerPressed] = useState(false)
  const [, setRejectedEdits] = useState(0)
  const [selectorFocused, setSelectorFocused] = useState(false)

  const isPicker = inputType === inputTypes.picker

  const highlighted = isPicker ? pressed : inputFocused

  const parsedValue = Number(controlledValue)

  const invalid =
    isPicker || controlledValue === ''
      ? false
      : clockType === clockTypes.hours
        ? !isValidHourInput(parsedValue, is24Hour)
        : !isValidMinuteInput(parsedValue)

  const { backgroundColor, borderColor, color } = useInputColors(
    highlighted,
    invalid,
    disabled
  )
  const theme = useTheme()

  const typeface = theme.fonts.displayLarge

  const fontSize = inputFontSize ?? typeface.fontSize

  useEffect(() => {
    setControlledValue((current) => {
      if (current === '' || Number(current) === value) {
        return current
      }
      return `${value}`
    })
  }, [value])

  useEffect(() => {
    onInvalidChange?.(invalid)
  }, [invalid, onInvalidChange])

  const onInnerChange = (text: string) => {
    if (disabled) return
    if (text !== '' && !/^\d{1,2}$/.test(text)) {
      setRejectedEdits((count) => count + 1)
      return
    }
    setEditing(true)
    setControlledValue(text)
    if (text === '') {
      return
    }
    const number = Number(text)
    if (
      clockType === clockTypes.hours
        ? isValidHourInput(number, is24Hour)
        : isValidMinuteInput(number)
    ) {
      onChanged(number)
    }
  }

  const formattedValue =
    !editing && controlledValue.length === 1
      ? `0${controlledValue}`
      : controlledValue

  const fieldHeight = isPicker ? timeSelectorHeight : timeInputFieldHeight
  const outlineWidth = 2
  const radius = theme.shapes.corner.large
  // Clipping the outlined box cuts the stroke off at the corner, so the
  // inner edge looks sharper than the focus ring. Clip the fill instead,
  // on the stroke's inner radius.
  const innerRadius = Math.max(0, radius - outlineWidth)

  const contentHeight = fieldHeight - outlineWidth * 2
  const textPadding = Math.max(0, (contentHeight - fontSize) / 2)
  // A line box locked to the font size clips the last glyph on iOS and
  // draws the caret through it. UITextField centers the text itself.
  const iosInput = Platform.OS === 'ios'

  const fieldFocused = isPicker ? selectorFocused : inputFocused
  const fieldStyle = [
    styles.outline,
    {
      backgroundColor,
      borderColor,
      borderRadius: radius,
      height: fieldHeight,
      width,
    },
  ]

  return (
    <View style={styles.frame}>
      <FocusRing focused={fieldFocused && !disabled} radius={radius} />
      <View
        {...(isPicker
          ? null
          : {
              onMouseEnter: () => setHovered(true),
              onMouseLeave: () => {
                setHovered(false)
                setPointerPressed(false)
              },
              onPointerCancel: () => setPointerPressed(false),
              onPointerDown: () => setPointerPressed(true),
              onPointerUp: () => setPointerPressed(false),
            })}
        style={fieldStyle}
      >
        <View style={[styles.fill, { borderRadius: innerRadius }]}>
          <StateLayer
            color={theme.colors.onSurface}
            focused={!disabled && fieldFocused}
            hovered={!disabled && hovered}
            pressed={!disabled && pointerPressed}
          />
          {isPicker ? (
            <Text
              maxFontSizeMultiplier={1.5}
              selectable={false}
              style={[
                styles.value,
                {
                  ...typeface,
                  color,
                  fontSize,
                },
              ]}
            >
              {formattedValue}
            </Text>
          ) : (
            <TextInput
              ref={ref}
              accessibilityLabel={accessibilityLabel}
              keyboardAppearance={theme.dark ? 'dark' : 'default'}
              keyboardType="number-pad"
              maxFontSizeMultiplier={1.5}
              maxLength={2}
              multiline={false}
              numberOfLines={1}
              onBlur={() => {
                setEditing(false)
                setInputFocused(false)
              }}
              onChangeText={onInnerChange}
              onFocus={() => {
                if (disabled) return
                setEditing(false)
                setInputFocused(true)
              }}
              selectTextOnFocus
              style={[
                styles.input,
                {
                  color,
                  fontFamily: typeface.fontFamily,
                  fontSize,
                  fontWeight: typeface.fontWeight,
                  height: contentHeight,
                  ...(iosInput
                    ? { paddingBottom: 0, paddingTop: 0 }
                    : {
                        lineHeight: fontSize,
                        paddingBottom: textPadding,
                        paddingTop: textPadding,
                      }),
                },
              ]}
              textAlign="center"
              value={formattedValue}
              {...rest}
              {...(disabled
                ? {
                    'aria-disabled': true,
                    'accessibilityState': { disabled: true },
                    'caretHidden': true,
                    'editable': false,
                  }
                : null)}
            />
          )}
          {isPicker ? (
            <Pressable
              accessibilityLabel={accessibilityLabel}
              accessibilityRole="button"
              accessibilityState={{
                disabled: disabled || undefined,
                selected: pressed,
              }}
              disabled={disabled}
              onBlur={() => setSelectorFocused(false)}
              onFocus={() => {
                if (!disabled) setSelectorFocused(true)
              }}
              onHoverIn={() => setHovered(true)}
              onHoverOut={() => setHovered(false)}
              onPress={() => {
                if (!disabled) onPress?.(clockType)
              }}
              onPressIn={() => setPointerPressed(true)}
              onPressOut={() => setPointerPressed(false)}
              style={[
                StyleSheet.absoluteFill,
                sharedStyles.overflowHidden,
                {
                  borderRadius: innerRadius,
                },
              ]}
            />
          ) : null}
        </View>
      </View>
    </View>
  )
}

const TimeInputWithRef: ForwardRefExoticComponent<
  TimeInputProps & RefAttributes<TextInputInstance>
> = forwardRef(TimeInput)

const styles = StyleSheet.create({
  input: {
    borderWidth: 0,
    outlineWidth: 0,
    paddingHorizontal: 0,
    textAlign: 'center',
    width: '100%',
  },
  fill: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  frame: {
    overflow: 'visible',
  },
  outline: {
    borderWidth: 2,
  },
  value: {
    textAlign: 'center',
  },
})

export default TimeInputWithRef
