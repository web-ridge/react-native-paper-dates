import { Platform, StyleSheet, View } from 'react-native'
import { IconButton } from 'react-native-paper'
import DayNames, { dayNamesHeight } from './DayNames'
import type { DisableWeekDaysType } from './types'
import { centerIconOnLastWeekday } from './weekdayColumns'
import { getTranslation } from '../translations/utils'
import { sharedStyles } from '../shared/styles'
import { memo } from 'react'

const buttonContainerHeight = 56

const buttonContainerMarginBottom = 8

const buttonContainerMarginTop = 4

let cachedLayoutScrollbarWidth: number | undefined

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
        endInset
          ? [styles.datePickerHeader, { right: endInset }]
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
                accessibilityHint="Page Up"
                accessibilityLabel={getTranslation(locale, 'previous')}
                icon="chevron-left"
                onPress={onPrev}
                size={24}
                style={styles.arrowButton}
                testID="react-native-paper-dates-prev-month"
              />
              <IconButton
                accessibilityHint="Page Down"
                accessibilityLabel={getTranslation(locale, 'next')}
                icon="chevron-right"
                onPress={onNext}
                size={24}
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

export const verticalScrollbarGutter = Platform.select({
  default: 14,
  ios: 0,
  web: 0,
}) as number

export default memo(CalendarHeader)
