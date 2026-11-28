import {
  forwardRef,
  type ForwardRefExoticComponent,
  type Ref,
  type RefAttributes,
  useEffect,
  useImperativeHandle,
  useRef,
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
  type TextStyle,
  View,
  type ViewInstance,
  type ViewStyle,
} from 'react-native'
import { useTheme } from 'react-native-paper'

import StateLayer from '../shared/StateLayer'
import { sharedStyles } from '../shared/styles'
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
  error?: boolean
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
    autoFocus,
    clockType,
    disabled,
    error,
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
  const theme = useTheme()
  const inputRef = useRef<TextInputInstance>(null)
  const selectorRef = useRef<ViewInstance>(null)

  const [controlledValue, setControlledValue] = useState(`${value}`)
  const [editing, setEditing] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [inputFocused, setInputFocused] = useState(false)
  const [pointerPressed, setPointerPressed] = useState(false)
  const [selectorFocused, setSelectorFocused] = useState(false)
  const [, setRejectedEdits] = useState(0)

  const formattedValue =
    !editing && controlledValue.length === 1
      ? `0${controlledValue}`
      : controlledValue

  const iosInput = Platform.OS === 'ios'
  const isPicker = inputType === inputTypes.picker

  useImperativeHandle(ref, () => {
    return {
      blur: () => {
        inputRef.current?.blur?.()
      },
      focus: () => {
        if (isPicker) {
          selectorRef.current?.focus?.()
          return
        }
        inputRef.current?.focus?.()
      },
      isFocused: () => inputRef.current?.isFocused?.() ?? false,
    } as TextInputInstance
  })

  useEffect(() => {
    if (!autoFocus || disabled) return
    if (isPicker) {
      selectorRef.current?.focus?.()
    }
  }, [autoFocus, disabled, isPicker])

  const fieldFocused = isPicker ? selectorFocused : inputFocused
  const fieldHeight = isPicker ? timeSelectorHeight : timeInputFieldHeight
  const highlighted = isPicker ? pressed : inputFocused
  const outlineWidth = 2
  const contentHeight = fieldHeight - outlineWidth * 2
  const parsedValue = Number(controlledValue)

  const invalid =
    isPicker || controlledValue === ''
      ? false
      : clockType === clockTypes.hours
        ? !isValidHourInput(parsedValue, is24Hour)
        : !isValidMinuteInput(parsedValue)

  const radius = theme.shapes.corner.large
  const innerRadius = Math.max(0, radius - outlineWidth)
  const showError = Boolean(error) || invalid

  const { backgroundColor, borderColor, color } = useInputColors(
    highlighted,
    showError,
    disabled
  )

  const fieldStyle = [
    styles.outline,
    {
      backgroundColor,
      borderColor,
      borderRadius: radius,
      height: fieldHeight,
      width,
    },
    ...(Platform.OS === 'web'
      ? [
          {
            borderWidth: 0,
            boxShadow: `inset 0 0 0 ${outlineWidth}px ${
              typeof borderColor === 'string'
                ? borderColor
                : String(borderColor)
            }`,
            padding: outlineWidth,
          } as ViewStyle,
        ]
      : []),
  ]

  const typeface = theme.fonts.displayLarge
  const fontSize = inputFontSize ?? typeface.fontSize
  const textPadding = Math.max(0, (contentHeight - fontSize) / 2)

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
              ref={inputRef}
              accessibilityLabel={accessibilityLabel}
              autoFocus={autoFocus}
              accessibilityState={disabled ? { disabled: true } : undefined}
              aria-invalid={showError || undefined}
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
                ...(Platform.OS === 'web'
                  ? [
                      {
                        borderRadius: innerRadius,
                        outlineStyle: 'none',
                        outlineWidth: 0,
                      } as unknown as TextStyle,
                    ]
                  : []),
              ]}
              textAlign="center"
              value={formattedValue}
              {...rest}
              {...(disabled
                ? {
                    'aria-disabled': true,
                    'caretHidden': true,
                    'editable': false,
                  }
                : null)}
            />
          )}
          {isPicker ? (
            <Pressable
              ref={selectorRef}
              accessibilityLabel={accessibilityLabel}
              accessibilityRole="button"
              accessibilityState={{
                disabled: disabled || undefined,
                selected: pressed,
              }}
              aria-invalid={showError || undefined}
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

const styles = StyleSheet.create({
  fill: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  frame: {
    overflow: 'visible',
  },
  input: {
    borderWidth: 0,
    outlineWidth: 0,
    paddingHorizontal: 0,
    textAlign: 'center',
    width: '100%',
  },
  outline: {
    borderWidth: 2,
  },
  value: {
    textAlign: 'center',
  },
})

const TimeInputWithRef: ForwardRefExoticComponent<
  TimeInputProps & RefAttributes<TextInputInstance>
> = forwardRef(TimeInput)

export default TimeInputWithRef
