import { useContext, useState } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import { Text, useTheme } from 'react-native-paper'

import { DisplayModeContext } from '../contexts/DisplayModeContext'
import StateLayer from '../shared/StateLayer'
import FocusRing from './FocusRing'
import { getTranslation } from '../translations/utils'
import {
  inputTypes,
  type PossibleInputTypes,
  timeSelectorWidth,
  horizontalPeriodGap,
  useSwitchColors,
} from './timeUtils'

const periodSelectorRoundRadius = 9999
const periodButtonSize = 56
const scrollPeriodButtonSize = 40
const horizontalPeriodHeight = 40

export default function AmPmSwitcher({
  direction = 'vertical',
  disabled,
  hours,
  inputType,
  locale,
  onChange,
}: {
  direction?: 'vertical' | 'horizontal'
  disabled?: boolean
  hours: number
  inputType: PossibleInputTypes
  locale?: string
  onChange: (newHours: number) => void
}) {
  const isHorizontal = direction === 'horizontal'
  const buttonSize =
    inputType === inputTypes.scroll ? scrollPeriodButtonSize : periodButtonSize
  const { mode, setMode } = useContext(DisplayModeContext)
  const isAM = mode === 'AM'
  const theme = useTheme()

  return (
    <View
      accessibilityRole="radiogroup"
      role="radiogroup"
      style={isHorizontal ? styles.rootHorizontal : styles.rootVertical}
    >
      <SwitchButton
        disabled={disabled}
        height={isHorizontal ? horizontalPeriodHeight : buttonSize}
        label={getTranslation(locale, 'am', 'AM')}
        onPress={() => {
          if (disabled || isAM) {
            return
          }
          setMode('AM')
          if (hours - 12 >= 0) {
            onChange(hours - 12)
          }
        }}
        radius={isAM ? theme.shapes.corner.medium : periodSelectorRoundRadius}
        selected={isAM}
        width={isHorizontal ? undefined : buttonSize}
      />
      <SwitchButton
        disabled={disabled}
        height={isHorizontal ? horizontalPeriodHeight : buttonSize}
        label={getTranslation(locale, 'pm', 'PM')}
        onPress={() => {
          if (disabled || !isAM) {
            return
          }
          setMode('PM')
          if (hours + 12 <= 24) {
            onChange(hours + 12)
          }
        }}
        radius={isAM ? periodSelectorRoundRadius : theme.shapes.corner.medium}
        selected={!isAM}
        width={isHorizontal ? undefined : buttonSize}
      />
    </View>
  )
}

function SwitchButton({
  disabled,
  height,
  label,
  onPress,
  radius,
  selected,
  width,
}: {
  disabled?: boolean
  height: number
  label: string
  onPress: (() => void) | undefined
  radius: number
  selected: boolean
  width?: number
}) {
  const [focused, setFocused] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [pressed, setPressed] = useState(false)
  const { backgroundColor, color } = useSwitchColors(selected, disabled)
  const theme = useTheme()
  const textFont = theme.fonts.titleMedium
  const buttonStyle = [
    styles.button,
    width === undefined ? styles.buttonFill : null,
    {
      backgroundColor,
      borderRadius: radius,
      height,
      width,
    },
  ]
  const labelStyle = {
    ...textFont,
    color,
  }
  const frameStyle = width === undefined ? styles.frameFill : { height, width }

  return (
    <View style={frameStyle}>
      <FocusRing focused={focused && !disabled} radius={radius} />
      <Pressable
        accessibilityLabel={label}
        accessibilityRole="radio"
        accessibilityState={{
          checked: selected,
          disabled: disabled || undefined,
          selected,
        }}
        disabled={disabled}
        role="radio"
        onBlur={() => setFocused(false)}
        onFocus={() => {
          if (!disabled) setFocused(true)
        }}
        onHoverIn={() => setHovered(true)}
        onHoverOut={() => setHovered(false)}
        onPress={onPress}
        onPressIn={() => {
          if (!disabled) setPressed(true)
        }}
        onPressOut={() => setPressed(false)}
        style={buttonStyle}
      >
        <StateLayer
          color={
            selected ? theme.colors.onPrimaryContainer : theme.colors.onSurface
          }
          focused={!disabled && focused}
          hovered={!disabled && hovered}
          pressed={!disabled && pressed}
        />
        <Text maxFontSizeMultiplier={1.5} selectable={false} style={labelStyle}>
          {label}
        </Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  buttonFill: {
    flex: 1,
  },
  frameFill: {
    flex: 1,
  },
  rootHorizontal: {
    flexDirection: 'row',
    gap: horizontalPeriodGap,
    height: horizontalPeriodHeight,
    width: timeSelectorWidth * 2 + horizontalPeriodGap,
  },
  rootVertical: {
    gap: 8,
  },
})
