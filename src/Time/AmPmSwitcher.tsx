import * as React from 'react'
import { View, StyleSheet } from 'react-native'
import { Text, TouchableRipple, useTheme } from 'react-native-paper'

export default function AmPmSwitcher() {
  const theme = useTheme()
  return (
    <View
      style={[
        styles.root,
        {
          borderColor: theme.colors.backdrop,
          borderRadius: theme.roundness,
        },
      ]}
    >
      <SwitchButton label="AM" onPress={() => {}} />
      <View
        style={[
          styles.switchSeparator,
          { backgroundColor: theme.colors.backdrop },
        ]}
      />
      <SwitchButton label="PM" onPress={() => {}} />
    </View>
  )
}

function SwitchButton({
  label,
  onPress,
}: {
  label: string
  onPress: () => any
}) {
  const theme = useTheme()
  return (
    <TouchableRipple onPress={onPress} style={styles.switchButton}>
      <Text selectable={false} style={{ ...theme.fonts.medium }}>
        {label}
      </Text>
    </TouchableRipple>
  )
}

const styles = StyleSheet.create({
  root: {
    width: 50,
    height: 96,
    borderWidth: 1,
  },
  switchSeparator: {
    height: 1,
    width: 41,
  },
  switchButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
