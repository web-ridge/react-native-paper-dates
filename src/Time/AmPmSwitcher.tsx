import * as React from 'react'
import { View, StyleSheet } from 'react-native'
import { MD2Theme, Text, TouchableRipple, useTheme } from 'react-native-paper'
import { useMemo } from 'react'
import Color from 'color'
import { inputTypes, PossibleInputTypes, useSwitchColors } from './timeUtils'
import { DisplayModeContext } from '../contexts/DisplayModeContext'

export default function AmPmSwitcher({
  onChange,
  hours,
  inputType,
}: {
  hours: number
  onChange: (newHours: number) => any
  inputType: PossibleInputTypes
}) {
  const { setMode, mode } = React.useContext(DisplayModeContext)
  const theme = useTheme()
  const backgroundColor = useMemo<string>(() => {
    if (theme.isV3) {
      return theme.colors.outline
    }
    return Color(
      theme.dark
        ? Color(theme.colors.surface).lighten(1.2).hex()
        : theme.colors.surface
    )
      .darken(0.1)
      .hex()
  }, [theme])

  const isAM = mode === 'AM'
  return (
    <View
      style={[
        styles.root,
        // eslint-disable-next-line react-native/no-inline-styles
        {
          borderColor: backgroundColor,
          borderRadius: theme.roundness * 2,
          height: inputType === inputTypes.keyboard ? 72 : 80,
          marginBottom: inputType === 'keyboard' ? 24 : 0,
        },
      ]}
    >
      <SwitchButton
        label="AM"
        onPress={() => {
          setMode('AM')
          if (hours - 12 >= 0) {
            onChange(hours - 12)
          }
        }}
        selected={isAM}
        disabled={isAM}
      />
      <View style={[styles.switchSeparator, { backgroundColor }]} />
      <SwitchButton
        label="PM"
        onPress={() => {
          setMode('PM')
          if (hours + 12 <= 24) {
            onChange(hours + 12)
          }
        }}
        selected={!isAM}
        disabled={!isAM}
      />
    </View>
  )
}

function SwitchButton({
  label,
  onPress,
  selected,
  disabled,
}: {
  label: string
  onPress: (() => any) | undefined
  selected: boolean
  disabled: boolean
}) {
  const theme = useTheme()
  const { backgroundColor, color } = useSwitchColors(selected)

  let textFont = theme?.isV3
    ? theme.fonts.titleMedium
    : (theme as any as MD2Theme).fonts.medium

  return (
    <TouchableRipple
      onPress={onPress}
      style={styles.switchButton}
      accessibilityLabel={label}
      // @ts-ignore old React Native versions
      accessibilityTraits={disabled ? ['button', 'disabled'] : 'button'}
      // @ts-ignore old React Native versions
      accessibilityComponentType="button"
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
    >
      <View style={[styles.switchButtonInner, { backgroundColor }]}>
        <Text
          maxFontSizeMultiplier={1.5}
          selectable={false}
          style={[
            {
              ...textFont,
              color: color,
            },
          ]}
        >
          {label}
        </Text>
      </View>
    </TouchableRipple>
  )
}

const styles = StyleSheet.create({
  root: {
    width: 52,
    borderWidth: 1,
    overflow: 'hidden',
  },
  switchSeparator: {
    height: 1,
    width: 52,
  },
  switchButton: {
    flex: 1,
  },
  switchButtonInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
