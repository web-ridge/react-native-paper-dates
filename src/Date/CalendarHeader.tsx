import { StyleSheet, View } from 'react-native'
import { IconButton, useTheme } from 'react-native-paper'
import DayNames, { dayNamesHeight } from './DayNames'
import type { DisableWeekDaysType } from './dateUtils'
import { getTranslation } from '../translations/utils'
import { sharedStyles } from '../shared/styles'
import { memo } from 'react'

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
  startWeekOnMonday,
}: {
  locale: undefined | string
  scrollMode: 'horizontal' | 'vertical'
  onPrev: () => any
  onNext: () => any
  disableWeekDays?: DisableWeekDaysType
  startWeekOnMonday: boolean
}) {
  const isHorizontal = scrollMode === 'horizontal'

  const theme = useTheme()

  return (
    <View style={styles.datePickerHeader} pointerEvents={'box-none'}>
      {isHorizontal ? (
        <View style={styles.buttonContainer} pointerEvents={'box-none'}>
          <View style={sharedStyles.root} pointerEvents={'box-none'} />
          <View style={{ backgroundColor: theme.colors.surface }}>
            <IconButton
              icon="chevron-left"
              accessibilityLabel={getTranslation(locale, 'previous')}
              onPress={onPrev}
            />
          </View>
          <View style={{ backgroundColor: theme.colors.surface }}>
            <IconButton
              icon="chevron-right"
              accessibilityLabel={getTranslation(locale, 'next')}
              onPress={onNext}
            />
          </View>
        </View>
      ) : null}
      <DayNames
        disableWeekDays={disableWeekDays}
        locale={locale}
        startWeekOnMonday={startWeekOnMonday}
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
})

export default memo(CalendarHeader)
