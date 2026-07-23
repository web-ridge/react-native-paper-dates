import { StyleSheet, View } from 'react-native'
import { Text, TouchableRipple, useTheme } from 'react-native-paper'
import { useContext } from 'react'
import { inputTypes, PossibleInputTypes, useSwitchColors } from './timeUtils'
import { DisplayModeContext } from '../contexts/DisplayModeContext'
import { sharedStyles } from '../shared/styles'

export default function AmPmSwitcher({
  onChange,
  hours,
  inputType,
  direction = 'vertical',
}: {
  hours: number
  onChange: (newHours: number) => any
  inputType: PossibleInputTypes
  direction?: 'vertical' | 'horizontal'
}) {
  const theme = useTheme()

  const { setMode, mode } = useContext(DisplayModeContext)

  const backgroundColor = theme.colors.outline
  const isHorizontal = direction === 'horizontal'
  const isAM = mode === 'AM'

  const height = isHorizontal
    ? 38
    : inputType === inputTypes.keyboard
      ? 72
      : 80

  return (
    <View
      style={[
        isHorizontal ? styles.rootHorizontal : styles.rootVertical,
        // eslint-disable-next-line react-native/no-inline-styles
        {
          borderColor: backgroundColor,
          borderRadius: theme.roundness * 2,
          height,
          marginBottom:
            !isHorizontal && inputType === inputTypes.keyboard ? 16 : 0,
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
      <View
        style={[
          isHorizontal ? styles.separatorHorizontal : styles.separatorVertical,
          { backgroundColor },
        ]}
      />
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

  const textFont = theme.fonts.titleMedium

  return (
    <TouchableRipple
      onPress={onPress}
      style={sharedStyles.root}
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
  rootVertical: {
    width: 52,
    borderWidth: 1,
    overflow: 'hidden',
  },
  rootHorizontal: {
    width: 216,
    flexDirection: 'row',
    borderWidth: 1,
    overflow: 'hidden',
  },
  separatorVertical: {
    height: 1,
    width: 52,
  },
  separatorHorizontal: {
    width: 1,
    alignSelf: 'stretch',
  },
  switchButtonInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
