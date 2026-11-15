import {
  Modal,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native'
import {
  Button,
  Divider,
  Icon,
  IconButton,
  Surface,
  Text,
  useTheme,
} from 'react-native-paper'
import { memo, useCallback, useEffect, useRef, useState } from 'react'
import Month from './Month'
import MonthMenu from './MonthMenu'
import YearPicker from './YearPicker'
import DayNames from './DayNames'
import { useDatePickerKeys } from './datePickerKeys'
import {
  addMonths,
  dayCellSize,
  defaultEndYear,
  defaultStartYear,
  getEndOfDay,
  getInitialIndex,
} from './dateUtils'
import type {
  CalendarDate,
  DisableWeekDaysType,
  SingleChange,
  ValidRangeType,
} from './types'
import {
  displayCase,
  supportedOrientations,
  themeColor,
  useLatest,
} from '../shared/utils'
import { getTranslation, translate } from '../translations/utils'

const cardWidth = 360

const screenInset = 8

const anchorGap = 8

const headerRowHeight = 24

const headerPaddingTop = 20

const headerPaddingBottom = 30

const menuDividerOffset = 20

const dayHeaderInset = 12

const stepperGap = 8

const menuButtonPadding = 12

const menuIconGap = 8

const menuLabelInset = 16 + 24 + 16

const weekdayRowHeight = 24

const actionHeight = 36

const actionPaddingTop = 8

const actionPaddingBottom = 12

const menuHeight =
  weekdayRowHeight +
  dayCellSize * 6 +
  actionPaddingTop +
  actionHeight +
  actionPaddingBottom

export function placeDockedCard({
  anchor,
  cardHeight,
  cardWidth: width,
  windowHeight,
  windowWidth,
}: {
  anchor: DatePickerAnchor
  cardHeight: number
  cardWidth: number
  windowHeight: number
  windowWidth: number
}) {
  const maxLeft = Math.max(screenInset, windowWidth - width - screenInset)
  let left = anchor.x
  if (left + width > windowWidth - screenInset) {
    left = anchor.x + anchor.width - width
  }
  left = Math.min(Math.max(screenInset, left), maxLeft)
  const below = anchor.y + anchor.height + anchorGap
  const above = anchor.y - cardHeight - anchorGap
  const top =
    below + cardHeight > windowHeight - screenInset && above >= screenInset
      ? above
      : below
  return { left, top }
}

export type DatePickerAnchor = {
  height: number
  width: number
  x: number
  y: number
}

export type DatePickerDockedProps = {
  anchor?: DatePickerAnchor | null
  date?: CalendarDate
  dateMode?: 'start' | 'end'
  disableWeekDays?: DisableWeekDaysType
  endYear?: number
  locale: string
  onConfirm: SingleChange
  onDismiss: () => void
  saveLabel?: string
  saveLabelDisabled?: boolean
  startWeekOnMonday?: boolean
  startYear?: number
  uppercase?: boolean
  validRange?: ValidRangeType
  visible: boolean
}

function DatePickerDocked({
  anchor,
  date,
  dateMode,
  disableWeekDays,
  endYear,
  locale,
  onConfirm,
  onDismiss,
  saveLabel,
  saveLabelDisabled,
  startWeekOnMonday,
  startYear,
  uppercase,
  validRange,
  visible,
}: DatePickerDockedProps) {
  const theme = useTheme()
  const { height: windowHeight, width: windowWidth } = useWindowDimensions()
  const [cardHeight, setCardHeight] = useState(480)
  const [draft, setDraft] = useState<CalendarDate>(date)
  const [focusedDate, setFocusedDate] = useState<Date | undefined>(date)
  const [menu, setMenu] = useState<'day' | 'month' | 'year'>('day')
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const initial = date ?? new Date()
    return new Date(initial.getFullYear(), initial.getMonth(), 1)
  })
  const wasVisible = useRef(false)
  const onConfirmRef = useLatest(onConfirm)
  const resolvedEndYear = endYear ?? defaultEndYear
  const resolvedStartYear = startYear ?? defaultStartYear
  const monday = startWeekOnMonday ?? false

  useEffect(() => {
    if (visible && !wasVisible.current) {
      const initial = date ?? new Date()
      setDraft(date)
      setFocusedDate(date)
      setMenu('day')
      setVisibleMonth(new Date(initial.getFullYear(), initial.getMonth(), 1))
    }
    wasVisible.current = visible
  }, [date, visible])

  const showMonth = useCallback((next: Date) => {
    setFocusedDate(next)
    setVisibleMonth(new Date(next.getFullYear(), next.getMonth(), 1))
  }, [])

  const commitDate = useCallback(
    (next: Date) => {
      const normalized = dateMode === 'end' ? getEndOfDay(next) : next
      setDraft(normalized)
      showMonth(next)
    },
    [dateMode, showMonth]
  )

  const moveMonth = useCallback(
    (delta: number) => {
      setVisibleMonth((current) => {
        const next = addMonths(current, delta)
        const year = next.getFullYear()
        if (year < resolvedStartYear || year > resolvedEndYear) return current
        return new Date(next.getFullYear(), next.getMonth(), 1)
      })
    },
    [resolvedEndYear, resolvedStartYear]
  )

  const moveYear = useCallback(
    (delta: number) => {
      setVisibleMonth((current) => {
        const year = current.getFullYear() + delta
        if (year < resolvedStartYear || year > resolvedEndYear) return current
        return new Date(year, current.getMonth(), 1)
      })
    },
    [resolvedEndYear, resolvedStartYear]
  )

  const confirm = useCallback(() => {
    const next = focusedDate
      ? dateMode === 'end'
        ? getEndOfDay(focusedDate)
        : focusedDate
      : draft
    onConfirmRef.current({ date: next })
  }, [dateMode, draft, focusedDate, onConfirmRef])

  useDatePickerKeys(visible && menu === 'day', {
    getVisibleMonth: () => visibleMonth,
    onConfirm: confirm,
    onFocusDate: showMonth,
    onMoveFocus: (delta) => {
      const base = focusedDate || draft || visibleMonth
      const next = addMonths(base, delta)
      if (
        next.getFullYear() < resolvedStartYear ||
        next.getFullYear() > resolvedEndYear
      ) {
        return
      }
      showMonth(next)
    },
    onMoveMonth: moveMonth,
    onOpenMonthMenu: () =>
      setMenu((current) => (current === 'month' ? 'day' : 'month')),
    onOpenYearMenu: () =>
      setMenu((current) => (current === 'year' ? 'day' : 'year')),
  })

  if (!visible) return null

  const width = Math.min(cardWidth, Math.max(windowWidth - 16, 0))
  const anchorBox = anchor ?? { height: 0, width: 0, x: 8, y: 8 }
  const { left, top } = placeDockedCard({
    anchor: anchorBox,
    cardHeight,
    cardWidth: width,
    windowHeight,
    windowWidth,
  })
  const monthLabel = new Intl.DateTimeFormat(locale, { month: 'short' }).format(
    visibleMonth
  )
  const actionColor = themeColor(theme.colors.primary)
  const radius = theme.shapes.corner.large
  const index = getInitialIndex(
    visibleMonth,
    resolvedStartYear,
    resolvedEndYear
  )
  const confirmLabel = displayCase(
    saveLabel || translate(locale, 'confirm', 'OK'),
    !!uppercase
  )
  const cancelLabel = displayCase(
    translate(locale, 'cancel', 'Cancel'),
    !!uppercase
  )

  return (
    <Modal
      animationType="none"
      onRequestClose={onDismiss}
      supportedOrientations={supportedOrientations}
      transparent
      visible
    >
      <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
        <Pressable
          accessibilityLabel={getTranslation(locale, 'close')}
          onPress={onDismiss}
          style={StyleSheet.absoluteFill}
        />
        <Surface
          backgroundColor={theme.colors.surfaceContainerHigh}
          borderRadius={radius}
          elevation={3}
          onLayout={(event) => {
            const next = event.nativeEvent.layout.height
            if (next > 0 && Math.abs(next - cardHeight) > 1) setCardHeight(next)
          }}
          style={[styles.card, { left, top, width }]}
          testID="react-native-paper-dates-docked-surface"
        >
          <View style={[styles.clip, { borderRadius: radius }]}>
            <View
              style={[
                styles.toolbar,
                menu === 'day' ? styles.toolbarDay : styles.toolbarMenu,
              ]}
            >
              <View style={menu === 'day' ? null : styles.menuMonth}>
                <DockedStepper
                  disabled={menu === 'year'}
                  hint="Shift+M"
                  label={monthLabel}
                  onNext={() => moveMonth(1)}
                  onOpen={() =>
                    setMenu((current) =>
                      current === 'month' ? 'day' : 'month'
                    )
                  }
                  onPrev={() => moveMonth(-1)}
                  open={menu === 'month'}
                  testID="react-native-paper-dates-docked-month"
                />
              </View>
              {menu === 'day' ? <View style={styles.spacer} /> : null}
              <View style={menu === 'day' ? null : styles.menuYear}>
                <DockedStepper
                  disabled={menu === 'month'}
                  hint="Shift+Y"
                  label={String(visibleMonth.getFullYear())}
                  onNext={() => moveYear(1)}
                  onOpen={() =>
                    setMenu((current) => (current === 'year' ? 'day' : 'year'))
                  }
                  onPrev={() => moveYear(-1)}
                  open={menu === 'year'}
                  testID="react-native-paper-dates-docked-year"
                />
              </View>
            </View>
            {menu === 'day' ? null : (
              <Divider
                bold
                style={{ backgroundColor: theme.colors.outlineVariant }}
                testID="react-native-paper-dates-docked-divider"
              />
            )}
            {menu === 'month' ? (
              <View style={styles.menu}>
                <MonthMenu
                  embedded
                  locale={locale}
                  onPressMonth={(month) => {
                    setVisibleMonth(
                      new Date(visibleMonth.getFullYear(), month, 1)
                    )
                    setMenu('day')
                  }}
                  selectedMonth={visibleMonth.getMonth()}
                />
              </View>
            ) : null}
            {menu === 'year' ? (
              <View style={styles.menu}>
                <YearPicker
                  embedded
                  endYear={resolvedEndYear}
                  onPressYear={(year) => {
                    setVisibleMonth(new Date(year, visibleMonth.getMonth(), 1))
                    setMenu('day')
                  }}
                  selectedYear={visibleMonth.getFullYear()}
                  selectingYear
                  startYear={resolvedStartYear}
                  variant="menu"
                />
              </View>
            ) : null}
            {menu === 'day' ? (
              <View style={styles.grid}>
                <DayNames
                  backgroundColor="transparent"
                  disableWeekDays={disableWeekDays}
                  height={weekdayRowHeight}
                  locale={locale}
                  startWeekOnMonday={monday}
                />
                <Month
                  date={draft}
                  disableWeekDays={disableWeekDays}
                  endYear={resolvedEndYear}
                  focusedDate={focusedDate}
                  hideHeader
                  index={index}
                  locale={locale}
                  mode="single"
                  onPressDate={commitDate}
                  onPressYear={() => setMenu('year')}
                  primaryColor={themeColor(theme.colors.primary)}
                  roundness={theme.shapes.corner.extraSmall}
                  scrollMode="horizontal"
                  selectColor={themeColor(theme.colors.secondaryContainer)}
                  selectingYear={false}
                  showOutsideDays
                  startWeekOnMonday={monday}
                  startYear={resolvedStartYear}
                  validRange={validRange}
                />
              </View>
            ) : null}
            {menu === 'day' ? (
              <View style={styles.actions}>
                <Button
                  contentStyle={styles.actionContent}
                  labelStyle={styles.actionLabel}
                  mode="text"
                  onPress={onDismiss}
                  style={styles.action}
                  testID="react-native-paper-dates-docked-cancel"
                  textColor={actionColor}
                >
                  {cancelLabel}
                </Button>
                <Button
                  contentStyle={styles.actionContent}
                  disabled={saveLabelDisabled ?? false}
                  labelStyle={styles.actionLabel}
                  mode="text"
                  onPress={confirm}
                  style={styles.action}
                  testID="react-native-paper-dates-docked-confirm"
                  textColor={actionColor}
                >
                  {confirmLabel}
                </Button>
              </View>
            ) : null}
          </View>
        </Surface>
      </View>
    </Modal>
  )
}

function DockedStepper({
  disabled,
  hint,
  label,
  onNext,
  onOpen,
  onPrev,
  open,
  testID,
}: {
  disabled: boolean
  hint: string
  label: string
  onNext: () => void
  onOpen: () => void
  onPrev: () => void
  open: boolean
  testID: string
}) {
  const theme = useTheme()
  const labelColor = disabled
    ? theme.colors.onSurface
    : theme.colors.onSurfaceVariant
  const showArrows = !disabled && !open
  const labelText = (
    <Text
      maxFontSizeMultiplier={1.5}
      numberOfLines={1}
      style={[
        styles.menuLabel,
        { color: labelColor },
        disabled ? styles.menuLabelDisabled : null,
      ]}
      variant="labelLarge"
    >
      {label}
    </Text>
  )
  const menuControl = disabled ? (
    <View style={styles.menuButton}>{labelText}</View>
  ) : (
    <Pressable
      accessibilityHint={hint}
      accessibilityRole="button"
      accessibilityState={{ expanded: open }}
      onPress={onOpen}
      style={styles.menuButton}
      testID={testID}
    >
      {labelText}
      <Icon color={labelColor} size={18} source="menu-down" />
    </Pressable>
  )

  if (!showArrows) return menuControl

  return (
    <View style={styles.stepper}>
      <IconButton
        accessibilityHint={hint === 'Shift+M' ? 'Page Up' : 'Shift+Page Up'}
        accessibilityLabel={getTranslation(undefined, 'previous')}
        icon="chevron-left"
        iconColor={labelColor}
        onPress={onPrev}
        size={24}
        style={styles.iconButton}
        testID={
          hint === 'Shift+M'
            ? 'react-native-paper-dates-docked-prev'
            : 'react-native-paper-dates-docked-year-prev'
        }
      />
      <View style={styles.stepperLabel}>{menuControl}</View>
      <IconButton
        accessibilityHint={hint === 'Shift+M' ? 'Page Down' : 'Shift+Page Down'}
        accessibilityLabel={getTranslation(undefined, 'next')}
        icon="chevron-right"
        iconColor={labelColor}
        onPress={onNext}
        size={24}
        style={styles.iconButton}
        testID={
          hint === 'Shift+M'
            ? 'react-native-paper-dates-docked-next'
            : 'react-native-paper-dates-docked-year-next'
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  action: {
    margin: 0,
    minWidth: 48,
  },
  actionContent: {
    minHeight: actionHeight,
  },
  actionLabel: {
    marginVertical: 0,
  },
  actions: {
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'flex-end',
    paddingBottom: actionPaddingBottom,
    paddingHorizontal: 12,
    paddingTop: actionPaddingTop,
  },
  card: {
    maxWidth: cardWidth,
    position: 'absolute',
  },
  clip: {
    overflow: 'hidden',
  },
  grid: {
    paddingHorizontal: 12,
  },
  iconButton: {
    height: headerRowHeight,
    margin: 0,
    width: headerRowHeight,
  },
  menu: {
    height: menuHeight,
    marginTop: headerPaddingBottom - menuDividerOffset,
    paddingBottom: 20,
  },
  menuButton: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: menuIconGap,
    height: headerRowHeight,
  },
  menuMonth: {
    flex: 1,
    justifyContent: 'center',
    paddingLeft: menuLabelInset,
  },
  menuYear: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  menuLabel: {
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  menuLabelDisabled: {
    opacity: 0.38,
  },
  spacer: {
    flex: 1,
  },
  stepper: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: stepperGap,
  },
  stepperLabel: {
    paddingHorizontal: menuButtonPadding,
  },
  toolbar: {
    alignItems: 'center',
    flexDirection: 'row',
    height: headerRowHeight,
    marginBottom: headerPaddingBottom,
    marginTop: headerPaddingTop,
  },
  toolbarDay: {
    paddingHorizontal: dayHeaderInset,
  },
  toolbarMenu: {
    marginBottom: menuDividerOffset,
  },
})

export default memo(DatePickerDocked)
