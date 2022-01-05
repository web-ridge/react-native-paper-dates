import * as React from 'react'
import { Animated, StyleSheet, SafeAreaView } from 'react-native'
import { Appbar, Button } from 'react-native-paper'

import { useHeaderTextColor } from '../utils'
import { getTranslation } from '../translations/utils'

export interface DatePickerModalHeaderProps {
  disableSafeTop?: boolean
  saveLabel?: string
  uppercase?: boolean
  onDismiss: () => void
  onSave: () => void
  locale: string | undefined
}

export default function DatePickerModalHeader(
  props: DatePickerModalHeaderProps
) {
  const { disableSafeTop, locale } = props
  const saveLabel = props.saveLabel || getTranslation(locale, 'save')
  const color = useHeaderTextColor()
  return (
    <>
      <Animated.View style={styles.animated}>
        <SafeAreaView
          style={[
            styles.safeContent,
            disableSafeTop && styles.safeContentNoTop,
          ]}
        >
          <Appbar style={styles.appbarHeader}>
            <Appbar.Action
              icon="close"
              accessibilityLabel={getTranslation(locale, 'close')}
              onPress={props.onDismiss}
              color={color}
              testID="react-native-paper-dates-close"
            />
            <Appbar.Content title={''} />
            <Button
              color={color}
              onPress={props.onSave}
              uppercase={props.uppercase ?? true}
              testID="react-native-paper-dates-save"
            >
              {saveLabel}
            </Button>
          </Appbar>
        </SafeAreaView>
      </Animated.View>
    </>
  )
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  animated: {
    paddingBottom: 0,
    elevation: 4,
  },
  safeContent: {
    paddingBottom: 0,
  },
  safeContentNoTop: {
    paddingTop: 0,
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
    // alignItems:'center'
  },
})
