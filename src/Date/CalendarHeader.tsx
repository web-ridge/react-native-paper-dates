import { memo } from 'react'
import { StyleSheet, View } from 'react-native'
import { IconButton } from 'react-native-paper'

import { sharedStyles } from '../shared/styles'
import { getTranslation } from '../translations/utils'
import DayNames, { dayNamesHeight } from './DayNames'
import type { DisableWeekDaysType } from './types'
import { centerIconOnLastWeekday } from './weekdayColumns'

export const calendarArrowSize = 48
const buttonContainerHeight = calendarArrowSize
export const calendarControlInset = 4
export const calendarControlHeight = calendarControlInset + calendarArrowSize
const overlayScrollbarWidth = 15

let cachedLayoutScrollbarWidth: number | undefined

export function getCalendarHeaderHeight(scrollMode: 'horizontal' | 'vertical') {
  if (scrollMode === 'horizontal') {
    return calendarControlInset + buttonContainerHeight + dayNamesHeight
  }
  return dayNamesHeight
}

export function layoutScrollbarWidth(): number {
  if (cachedLayoutScrollbarWidth !== undefined) {
    return cachedLayoutScrollbarWidth
  }
  if (typeof document === 'undefined' || !document.body) {
    return 0
  }
  const probe = document.createElement('div')
  probe.style.cssText =
    'position:absolute;top:-9999px;width:100px;height:100px;overflow:scroll;visibility:hidden'
  document.body.appendChild(probe)
  const width = probe.offsetWidth - probe.clientWidth
  probe.remove()
  return (cachedLayoutScrollbarWidth = width > 0 ? width : 0)
}

export function overlayScrollbarPadding(): number {
  return layoutScrollbarWidth() > 0 ? 0 : overlayScrollbarWidth
}

export function weekdayScrollbarInset(): number {
  const measured = layoutScrollbarWidth()
  return measured > 0 ? measured : overlayScrollbarWidth
}

function CalendarHeader({
  disableWeekDays,
  endInset = 0,
  locale,
  onNext,
  onPrev,
  scrollMode,
  selectingYear = false,
  startWeekOnMonday,
}: {
  disableWeekDays?: DisableWeekDaysType
  endInset?: number
  locale: string | undefined
  onNext: () => void
  onPrev: () => void
  scrollMode: 'horizontal' | 'vertical'
  selectingYear?: boolean
  startWeekOnMonday: boolean
}) {
  const isHorizontal = scrollMode === 'horizontal'

  return (
    <View
      pointerEvents={'box-none'}
      style={
        isHorizontal || endInset
          ? [
              styles.datePickerHeader,
              isHorizontal ? { top: calendarControlInset } : null,
              endInset ? { right: endInset } : null,
            ]
          : styles.datePickerHeader
      }
    >
      {isHorizontal ? (
        <View pointerEvents={'box-none'} style={styles.buttonContainer}>
          <View pointerEvents={'box-none'} style={sharedStyles.root} />
          {selectingYear ? null : (
            <View
              style={[
                styles.arrowGroup,
                centerIconOnLastWeekday(disableWeekDays),
              ]}
            >
              <IconButton
                accessibilityLabel={getTranslation(locale, 'previous')}
                icon="chevron-left"
                iconSize={24}
                onPress={onPrev}
                style={styles.arrowButton}
                testID="react-native-paper-dates-prev-month"
              />
              <IconButton
                accessibilityLabel={getTranslation(locale, 'next')}
                icon="chevron-right"
                iconSize={24}
                onPress={onNext}
                style={styles.arrowButton}
                testID="react-native-paper-dates-next-month"
              />
            </View>
          )}
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
    height: 48,
    margin: 0,
    width: 48,
  },
  arrowGroup: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  buttonContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    height: buttonContainerHeight,
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
