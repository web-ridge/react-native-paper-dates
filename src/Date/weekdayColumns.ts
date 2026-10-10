import { I18nManager, type DimensionValue, type ViewStyle } from 'react-native'
import { showWeekDay, type DisableWeekDaysType } from './dateUtils'

const compactTextButtonPadding = 8
const iconButtonPadding = 8
const iconButtonSize = 24 + 2 * iconButtonPadding
const letterHalfWidth = 4

export function alignIconToFirstWeekday(
  disableWeekDays?: DisableWeekDaysType
): ViewStyle {
  return alignToFirstColumn(
    disableWeekDays,
    letterHalfWidth + iconButtonPadding
  )
}

export function alignTextToFirstWeekday(
  disableWeekDays?: DisableWeekDaysType
): ViewStyle {
  return alignToFirstColumn(disableWeekDays, letterHalfWidth)
}

export function alignTextToLastWeekday(
  disableWeekDays?: DisableWeekDaysType
): ViewStyle {
  return alignToLastColumn(
    disableWeekDays,
    letterHalfWidth + compactTextButtonPadding
  )
}

function alignToFirstColumn(
  disableWeekDays: DisableWeekDaysType | undefined,
  nudge: number
): ViewStyle {
  return {
    marginStart: columnCentreInset(disableWeekDays),
    transform: [{ translateX: I18nManager.isRTL ? nudge : -nudge }],
  }
}

function alignToLastColumn(
  disableWeekDays: DisableWeekDaysType | undefined,
  nudge: number
): ViewStyle {
  return {
    marginEnd: columnCentreInset(disableWeekDays),
    transform: [{ translateX: I18nManager.isRTL ? -nudge : nudge }],
  }
}

export function centerIconOnLastWeekday(
  disableWeekDays?: DisableWeekDaysType
): ViewStyle {
  return alignToLastColumn(disableWeekDays, iconButtonSize / 2)
}

function columnCentreInset(
  disableWeekDays: DisableWeekDaysType | undefined
): DimensionValue {
  const visibleColumns = [0, 1, 2, 3, 4, 5, 6].filter((dayIndex) =>
    showWeekDay(dayIndex, disableWeekDays)
  ).length
  return `${50 / (visibleColumns || 7)}%`
}

export function weekdaySpan(disableWeekDays?: DisableWeekDaysType): ViewStyle {
  const inset = columnCentreInset(disableWeekDays)
  return { marginStart: inset, marginEnd: inset }
}

export const weekdaySpanOvershoot: ViewStyle = {
  marginHorizontal: -letterHalfWidth,
}
