import { Platform, StyleSheet, View } from 'react-native'
import { IconButton, useTheme } from 'react-native-paper'
import DayNames, { dayNamesHeight } from './DayNames'
import type { DisableWeekDaysType } from './dateUtils'
import { centerIconOnLastWeekday } from './weekdayColumns'
import { getTranslation } from '../translations/utils'
import { sharedStyles } from '../shared/styles'
import { memo } from 'react'

/** Space reserved so an overlay header does not paint over a vertical scrollbar. */
export const verticalScrollbarGutter = Platform.select({
  ios: 0,
  web: 16,
  default: 14,
}) as number

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
  endInset = 0,
}: {
  locale: undefined | string
  scrollMode: 'horizontal' | 'vertical'
  onPrev: () => any
  onNext: () => any
  disableWeekDays?: DisableWeekDaysType
  startWeekOnMonday: boolean
  /** Shrink from the trailing edge so week names do not cover a vertical scrollbar. */
  endInset?: number
}) {
  const isHorizontal = scrollMode === 'horizontal'
  const theme = useTheme()

  return (
    <View
      style={
        endInset
          ? [styles.datePickerHeader, { right: endInset }]
          : styles.datePickerHeader
      }
      pointerEvents={'box-none'}
    >
      {isHorizontal ? (
        <View style={styles.buttonContainer} pointerEvents={'box-none'}>
          <View style={sharedStyles.root} pointerEvents={'box-none'} />
          <View
            style={[
              styles.arrowGroup,
              {
                backgroundColor: theme.colors.elevation.level3,
              },
              centerIconOnLastWeekday(disableWeekDays),
            ]}
          >
            <IconButton
              icon="chevron-left"
              accessibilityLabel={getTranslation(locale, 'previous')}
              onPress={onPrev}
              testID="react-native-paper-dates-prev-month"
              style={styles.arrowButton}
            />
            <IconButton
              icon="chevron-right"
              accessibilityLabel={getTranslation(locale, 'next')}
              onPress={onNext}
              testID="react-native-paper-dates-next-month"
              style={styles.arrowButton}
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
  arrowGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  arrowButton: {
    margin: 0,
  },
})

export default memo(CalendarHeader)
