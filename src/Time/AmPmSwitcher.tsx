import { useContext, useState } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import { Text, useTheme } from 'react-native-paper'

import { DisplayModeContext } from '../contexts/DisplayModeContext'
import StateLayer from '../shared/StateLayer'
import { sharedStyles } from '../shared/styles'
import { getTranslation } from '../translations/utils'
import {
  inputTypes,
  type PossibleInputTypes,
  useSwitchColors,
} from './timeUtils'

export default function AmPmSwitcher({
  direction = 'vertical',
  hours,
  inputType,
  locale,
  onChange,
}: {
  direction?: 'vertical' | 'horizontal'
  hours: number
  inputType: PossibleInputTypes
  locale?: string
  onChange: (newHours: number) => void
}) {
  const isHorizontal = direction === 'horizontal'

  const height = isHorizontal ? 38 : inputType === inputTypes.keyboard ? 72 : 80

  const { mode, setMode } = useContext(DisplayModeContext)

  const isAM = mode === 'AM'

  const theme = useTheme()

  const backgroundColor = theme.colors.outline

  return (
    <View
      style={[
        isHorizontal ? styles.rootHorizontal : styles.rootVertical,
        {
          borderColor: backgroundColor,
          borderRadius: theme.shapes.corner.small,
          height,
        },
      ]}
    >
      <SwitchButton
        label={getTranslation(locale, 'am', 'AM')}
        onPress={() => {
          if (isAM) {
            return
          }
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
        label={getTranslation(locale, 'pm', 'PM')}
        onPress={() => {
          if (!isAM) {
            return
          }
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
  label,
  onPress,
  selected,
}: {
  label: string
  onPress: (() => void) | undefined
  selected: boolean
}) {
  const [focused, setFocused] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [pressed, setPressed] = useState(false)
  const { backgroundColor, color } = useSwitchColors(selected)
  const theme = useTheme()

  const textFont = theme.fonts.titleMedium

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onBlur={() => setFocused(false)}
      onFocus={() => setFocused(true)}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={sharedStyles.root}
    >
      <View style={[styles.switchButtonInner, { backgroundColor }]}>
        <StateLayer
          color={color}
          focused={focused}
          hovered={hovered}
          pressed={pressed}
        />
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
    </Pressable>
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
