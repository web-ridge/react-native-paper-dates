import * as React from 'react'
import { Animated, StyleSheet } from 'react-native'
import { Appbar, Button, useTheme } from 'react-native-paper'

import { useHeaderTextColor } from '../utils'
import { getTranslation } from '../translations/utils'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export interface DatePickerModalHeaderProps {
  saveLabel?: string
  saveLabelDisabled?: boolean
  uppercase?: boolean
  onDismiss: () => void
  onSave: () => void
  locale: string | undefined
  closeIcon?: string
}

export default function DatePickerModalHeader(
  props: DatePickerModalHeaderProps
) {
  const theme = useTheme()
  const { locale, closeIcon = 'close' } = props
  const saveLabel = props.saveLabel || getTranslation(locale, 'save')
  const color = useHeaderTextColor()
  const insets = useSafeAreaInsets()

  return (
    <>
      <Animated.View
        style={[
          styles.animated,
          {
            paddingLeft: insets.left,
            paddingRight: insets.right,
          },
        ]}
      >
        <Appbar style={styles.appbarHeader}>
          <Appbar.Action
            icon={closeIcon}
            accessibilityLabel={getTranslation(locale, 'close')}
            onPress={props.onDismiss}
            color={color}
            testID="react-native-paper-dates-close"
          />
          <Appbar.Content title={''} />
          <Button
            textColor={theme.isV3 ? theme.colors.primary : color}
            onPress={props.onSave}
            disabled={props.saveLabelDisabled ?? false}
            uppercase={props.uppercase ?? true}
            testID="react-native-paper-dates-save"
          >
            {saveLabel}
          </Button>
        </Appbar>
      </Animated.View>
    </>
  )
}

const styles = StyleSheet.create({
  animated: {
    elevation: 4,
  },
  header: {
    height: 75,
    alignItems: 'center',
    flexDirection: 'row',
    paddingLeft: 24,
    paddingRight: 12,
  },
  headerContentContainer: { marginTop: 5, flexDirection: 'row' },
  label: { color: '#fff', letterSpacing: 1, fontSize: 13 },
  singleHeaderText: { color: '#fff', fontSize: 25 },
  rangeHeaderText: { color: '#fff', fontSize: 25 },
  headerTextFilled: { color: 'rgba(255,255,255,1)' },
  headerTextEmpty: { color: 'rgba(255,255,255,0.5)' },
  headerSeparator: {
    color: 'rgba(255,255,255,1)',
    fontSize: 25,
    paddingLeft: 6,
    paddingRight: 6,
  },
  appbarHeader: {
    elevation: 0,
    backgroundColor: 'transparent',
  },
})
