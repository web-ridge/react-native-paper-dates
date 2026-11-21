import { memo, useState } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import { Icon, Text, useTheme } from 'react-native-paper'

import StateLayer from '../shared/StateLayer'

export const selectionMenuItemHeight = 48

function SelectionMenuItem({
  label,
  onPress,
  selected,
}: {
  label: string
  onPress: () => void
  selected: boolean
}) {
  const theme = useTheme()
  const [focused, setFocused] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [pressed, setPressed] = useState(false)
  const engaged = focused || hovered || pressed

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
    >
      <View
        style={[
          styles.item,
          selected ? { backgroundColor: theme.colors.surfaceVariant } : null,
        ]}
      >
        <StateLayer
          color={theme.colors.onSurface}
          focused={focused}
          hovered={hovered}
          pressed={pressed}
        />
        <View style={styles.check}>
          {selected ? (
            <Icon
              color={
                engaged ? theme.colors.onSurfaceVariant : theme.colors.onSurface
              }
              size={24}
              source="check"
            />
          ) : null}
        </View>
        <Text
          maxFontSizeMultiplier={1.5}
          selectable={false}
          style={{ color: theme.colors.onSurface }}
          variant="bodyLarge"
        >
          {label}
        </Text>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  check: {
    width: 24,
  },
  item: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 16,
    minHeight: selectionMenuItemHeight,
    overflow: 'hidden',
    paddingHorizontal: 16,
    width: '100%',
  },
})

export default memo(SelectionMenuItem)
