import * as React from 'react'
import { useMemo } from 'react'
import { StyleSheet, View } from 'react-native'
import { Text, TouchableRipple } from 'react-native-paper'
import Color from 'color'
import { getHourType, hourTypes, useSwitchColors } from './timeUtils'

export default function AmPmSwitcher({
  hours,
  onChange,
  theme,
}: {
  hours: number
  onChange: (hours: number) => any
  theme: ReactNativePaper.Theme
}) {
  const backgroundColor = useMemo<string>(() => {
    if (theme.dark) {
      return Color(theme.colors.surface).lighten(1.2).hex()
    }
    return Color(theme.colors.surface).darken(0.1).hex()
  }, [theme])

  const hourType = getHourType(hours)
  const isAM = hourType === hourTypes.am
  const isPM = hourType === hourTypes.pm

  return (
    <View
      style={[
        styles.root,
        {
          borderColor: backgroundColor,
          borderRadius: theme.roundness,
        },
      ]}
    >
      <SwitchButton
        label="AM"
        onPress={isAM ? undefined : () => onChange(hours - 12)}
        selected={isAM}
        disabled={isAM}
        theme={theme}
      />
      <View style={[styles.switchSeparator, { backgroundColor }]} />
      <SwitchButton
        label="PM"
        onPress={isPM ? undefined : () => onChange(hours + 12)}
        selected={isPM}
        disabled={isPM}
        theme={theme}
      />
    </View>
  )
}

function SwitchButton({
  label,
  onPress,
  selected,
  disabled,
  theme,
}: {
  label: string
  onPress: (() => any) | undefined
  selected: boolean
  disabled: boolean
  theme: ReactNativePaper.Theme
}) {
  const { backgroundColor, color } = useSwitchColors(theme, selected)

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
          selectable={false}
          style={[
            {
              ...theme.fonts.medium,
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
    width: 50,
    height: 80,
    borderWidth: 1,
    overflow: 'hidden',
  },
  switchSeparator: {
    height: 1,
    width: 48,
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
