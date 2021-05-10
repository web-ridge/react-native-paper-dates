import * as React from 'react'
import { StyleSheet, View } from 'react-native'
import { IconButton } from 'react-native-paper'
import DayNames, { dayNamesHeight } from './DayNames'
import { DisableWeekDaysType } from './dateUtils'

const buttonContainerHeight = 56
const buttonContainerMarginTop = 4
const buttonContainerMarginBottom = 8

export function getCalendarHeaderHeight(scrollMode: 'horizontal' | 'vertical') {
  if (scrollMode === 'horizontal') {
    return (
      buttonContainerHeight +
      buttonContainerMarginTop +
      buttonContainerMarginBottom +
      dayNamesHeight
    )
  }
  return dayNamesHeight
}

function CalendarHeader({
  scrollMode,
  onPrev,
  onNext,
  disableWeekDays,
  locale,
  theme,
}: {
  locale: undefined | string
  scrollMode: 'horizontal' | 'vertical'
  onPrev: () => any
  onNext: () => any
  disableWeekDays?: DisableWeekDaysType
  theme: ReactNativePaper.Theme
}) {
  const isHorizontal = scrollMode === 'horizontal'
  return (
    <View style={styles.datePickerHeader} pointerEvents={'box-none'}>
      {isHorizontal ? (
        <View style={styles.buttonContainer} pointerEvents={'box-none'}>
          <View style={styles.spacer} pointerEvents={'box-none'} />
          <View
            style={[
              styles.buttonWrapper,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <IconButton icon="chevron-left" onPress={onPrev} theme={theme} />
          </View>

          <View
            style={[
              styles.buttonWrapper,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <IconButton icon="chevron-right" onPress={onNext} theme={theme} />
          </View>
        </View>
      ) : null}
      <DayNames
        disableWeekDays={disableWeekDays}
        locale={locale}
        theme={theme}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  datePickerHeader: {
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
    zIndex: 10,
  },
  buttonContainer: {
    height: buttonContainerHeight,
    marginTop: buttonContainerMarginTop,
    marginBottom: buttonContainerMarginBottom,
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonWrapper: {},
  spacer: { flex: 1 },
})

export default React.memo(CalendarHeader)
