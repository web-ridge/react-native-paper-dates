import {
  forwardRef,
  type ForwardRefExoticComponent,
  type Ref,
  type RefAttributes,
  useEffect,
  useState,
} from 'react'
import {
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

  const { backgroundColor, color } = useInputColors(highlighted, invalid)
  const theme = useTheme()

  const typeface = isPicker
    ? theme.fonts.displayLarge
    : theme.fonts.displayMedium

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

  const showOutline = !isPicker && inputFocused

  const fieldHeight = isPicker ? timeSelectorHeight : timeInputFieldHeight

  const textPadding = Math.max(
    0,
    (fieldHeight - (showOutline ? 4 : 0) - fontSize) / 2
  )

  return (
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
      style={[
        styles.root,
        showOutline ? styles.rootOutline : styles.rootBorder,
        {
          backgroundColor,
          borderColor: showOutline
            ? invalid
              ? theme.colors.error
              : theme.colors.primary
            : undefined,
          borderRadius: theme.shapes.corner.small,
          height: fieldHeight,
          width,
        },
      ]}
    >
      <StateLayer
        color={color}
        focused={isPicker && selectorFocused}
        hovered={hovered}
        pressed={pointerPressed}
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
              height: fieldHeight - (showOutline ? 4 : 0),
              lineHeight: fontSize,
              paddingBottom: textPadding,
              paddingTop: textPadding,
            },
          ]}
          textAlign="center"
          value={formattedValue}
          {...rest}
        />
      )}
      {isPicker ? (
        <Pressable
          accessibilityLabel={accessibilityLabel}
          accessibilityRole="button"
          accessibilityState={{ selected: pressed }}
          onBlur={() => setSelectorFocused(false)}
          onFocus={() => setSelectorFocused(true)}
          onHoverIn={() => setHovered(true)}
          onHoverOut={() => setHovered(false)}
          onPress={() => onPress?.(clockType)}
          onPressIn={() => setPointerPressed(true)}
          onPressOut={() => setPointerPressed(false)}
          style={[
            StyleSheet.absoluteFill,
            sharedStyles.overflowHidden,
            {
              borderRadius: theme.shapes.corner.small,
            },
          ]}
        />
      ) : null}
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
  root: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  rootBorder: {
    borderWidth: 0,
  },
  rootOutline: {
    borderWidth: 2,
  },
  value: {
    textAlign: 'center',
  },
})

export default TimeInputWithRef
