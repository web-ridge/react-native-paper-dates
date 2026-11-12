import { StyleSheet, View } from 'react-native'
import { Text, TouchableRipple, useTheme } from 'react-native-paper'
import { useContext } from 'react'
import { inputTypes, PossibleInputTypes, useSwitchColors } from './timeUtils'
import { DisplayModeContext } from '../contexts/DisplayModeContext'
import { sharedStyles } from '../shared/styles'

export default function AmPmSwitcher({
  direction = 'vertical',
  hours,
  inputType,
  onChange,
}: {
  direction?: 'vertical' | 'horizontal'
  hours: number
  inputType: PossibleInputTypes
  onChange: (newHours: number) => any
}) {
  const theme = useTheme()

  const { setMode, mode } = useContext(DisplayModeContext)

  const backgroundColor = theme.colors.outline
  const isHorizontal = direction === 'horizontal'
  const isAM = mode === 'AM'

  const height = isHorizontal ? 38 : inputType === inputTypes.keyboard ? 72 : 80

  return (
    <View
      style={[
        isHorizontal ? styles.rootHorizontal : styles.rootVertical,
        // eslint-disable-next-line react-native/no-inline-styles
        {
          borderColor: backgroundColor,
          borderRadius: theme.shapes.corner.small,
          height,
          marginBottom:
            !isHorizontal && inputType === inputTypes.keyboard ? 16 : 0,
        },
      ]}
    >
      <SwitchButton
        disabled={isAM}
        label="AM"
        onPress={() => {
          setMode('AM')
          if (hours - 12 >= 0) {
            onChange(hours - 12)
          }
        }}
        selected={isAM}
      />
      <View
        style={[
          isHorizontal ? styles.separatorHorizontal : styles.separatorVertical,
          { backgroundColor },
        ]}
      />
      <SwitchButton
        disabled={!isAM}
        label="PM"
        onPress={() => {
          setMode('PM')
          if (hours + 12 <= 24) {
            onChange(hours + 12)
          }
        }}
        selected={!isAM}
      />
    </View>
  )
}

function SwitchButton({
  disabled,
  label,
  onPress,
  selected,
}: {
  disabled: boolean
  label: string
  onPress: (() => any) | undefined
  selected: boolean
}) {
  const theme = useTheme()

  const { backgroundColor, color } = useSwitchColors(selected)

  const textFont = theme.fonts.titleMedium

  return (
    <TouchableRipple
      // @ts-ignore old React Native versions
      accessibilityComponentType="button"
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      // @ts-ignore old React Native versions
      accessibilityTraits={disabled ? ['button', 'disabled'] : 'button'}
      disabled={disabled}
      onPress={onPress}
      style={sharedStyles.root}
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
  rootHorizontal: {
    borderWidth: 1,
    flexDirection: 'row',
    overflow: 'hidden',
    width: 216,
  },
  rootVertical: {
    borderWidth: 1,
    overflow: 'hidden',
    width: 52,
  },
  separatorHorizontal: {
    alignSelf: 'stretch',
    width: 1,
  },
  separatorVertical: {
    height: 1,
    width: 52,
  },
  switchButtonInner: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
})
