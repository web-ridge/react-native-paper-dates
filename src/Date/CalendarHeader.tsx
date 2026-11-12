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
  disableWeekDays,
  endInset = 0,
  locale,
  onNext,
  onPrev,
  scrollMode,
  startWeekOnMonday,
}: {
  disableWeekDays?: DisableWeekDaysType
  /** Shrink from the trailing edge so week names do not cover a vertical scrollbar. */
  endInset?: number
  locale: undefined | string
  onNext: () => any
  onPrev: () => any
  scrollMode: 'horizontal' | 'vertical'
  startWeekOnMonday: boolean
}) {
  const isHorizontal = scrollMode === 'horizontal'
  const theme = useTheme()

  return (
    <View
      pointerEvents={'box-none'}
      style={
        endInset
          ? [styles.datePickerHeader, { right: endInset }]
          : styles.datePickerHeader
      }
    >
      {isHorizontal ? (
        <View pointerEvents={'box-none'} style={styles.buttonContainer}>
          <View pointerEvents={'box-none'} style={sharedStyles.root} />
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
              accessibilityLabel={getTranslation(locale, 'previous')}
              icon="chevron-left"
              onPress={onPrev}
              style={styles.arrowButton}
              testID="react-native-paper-dates-prev-month"
            />
            <IconButton
              accessibilityLabel={getTranslation(locale, 'next')}
              icon="chevron-right"
              onPress={onNext}
              style={styles.arrowButton}
              testID="react-native-paper-dates-next-month"
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
  arrowButton: {
    margin: 0,
  },
  arrowGroup: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  buttonContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    height: buttonContainerHeight,
    marginBottom: buttonContainerMarginBottom,
    marginTop: buttonContainerMarginTop,
  },
  datePickerHeader: {
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 10,
  },
})

export default memo(CalendarHeader)
