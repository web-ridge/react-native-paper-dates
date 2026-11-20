import { memo, useEffect, useState } from 'react'
import {
  Modal,
  Platform,
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

import { dateTimeFormat } from '../shared/intl'
import StateLayer from '../shared/StateLayer'
import { displayCase, supportedOrientations, themeColor } from '../shared/utils'
import { getTranslation, translate } from '../translations/utils'
import Calendar from './Calendar'
import type {
  CalendarDate,
  DisableWeekDaysType,
  SingleChange,
  ValidRangeType,
} from './types'

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

const actionHeight = 36
const actionPaddingBottom = 12
const actionPaddingTop = 8
const anchorGap = 8
const cardWidth = 360
const cornerRadius = 16
const dayHeaderInset = 12
// md.comp.date-picker.docked.header.height: 64dp = 8 + 48 + 8. The 48dp row
// holds the 48dp touch targets of the 40dp menu and icon buttons.
const headerPaddingTop = 8
const headerRowHeight = 48
const headerGap = 8
const iconButtonSize = 40
const minTouchTarget = 48
const iconHitSlop = (minTouchTarget - iconButtonSize) / 2
const menuButtonHeight = 40
const menuHitSlop = {
  bottom: (minTouchTarget - menuButtonHeight) / 2,
  top: (minTouchTarget - menuButtonHeight) / 2,
}
const menuButtonPadding = 8
const menuIconGap = 8
const menuLabelInset = 16 + 24 + 16 - menuButtonPadding
const screenInset = 8
const stepperGap = 0

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
  const actionColor = themeColor(theme.colors.primary)
  const cancelLabel = displayCase(
    translate(locale, 'cancel', 'Cancel'),
    !!uppercase
  )
  const confirmLabel = displayCase(
    saveLabel || translate(locale, 'confirm', 'OK'),
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
          borderRadius={cornerRadius}
          elevation={3}
          onLayout={(event) => {
            const next = event.nativeEvent.layout.height
            if (next > 0 && Math.abs(next - cardHeight) > 1) setCardHeight(next)
          }}
          style={[styles.card, { left, top, width }]}
          testID="react-native-paper-dates-docked-surface"
        >
          <View style={[styles.clip, { borderRadius: cornerRadius }]}>
            <Calendar
              date={date}
              dateMode={dateMode}
              disableWeekDays={disableWeekDays}
              endYear={endYear}
              locale={locale}
              mode="single"
              onChange={() => undefined}
              onMonthConfirm={onConfirm}
              singleMonth
              startWeekOnMonday={startWeekOnMonday}
              startYear={startYear}
              validRange={validRange}
            >
              {(nav) => (
                <>
                  <View
                    style={[
                      styles.toolbar,
                      nav.menu === 'day'
                        ? styles.toolbarDay
                        : styles.toolbarMenu,
                    ]}
                  >
                    <View
                      style={[
                        styles.toolbarSide,
                        nav.menu === 'day' ? null : styles.menuMonth,
                      ]}
                    >
                      <DockedStepper
                        disabled={nav.menu === 'year'}
                        label={dateTimeFormat(locale, {
                          month: 'short',
                        }).format(nav.visibleMonth)}
                        onNext={() => nav.moveMonth(1)}
                        onOpen={nav.toggleMonth}
                        onPrev={() => nav.moveMonth(-1)}
                        open={nav.menu === 'month'}
                        testID="react-native-paper-dates-docked-month"
                        unit="month"
                      />
                    </View>
                    {nav.menu === 'day' ? <View style={styles.spacer} /> : null}
                    <View
                      style={[
                        styles.toolbarSide,
                        nav.menu === 'day' ? null : styles.menuYear,
                      ]}
                    >
                      <DockedStepper
                        disabled={nav.menu === 'month'}
                        label={String(nav.visibleMonth.getFullYear())}
                        onNext={() => nav.moveYear(1)}
                        onOpen={nav.toggleYear}
                        onPrev={() => nav.moveYear(-1)}
                        open={nav.menu === 'year'}
                        testID="react-native-paper-dates-docked-year"
                        unit="year"
                      />
                    </View>
                  </View>
                  {nav.menu === 'day' ? null : (
                    <Divider
                      bold
                      style={{ backgroundColor: theme.colors.outlineVariant }}
                      testID="react-native-paper-dates-docked-divider"
                    />
                  )}
                  {nav.body}
                  {nav.menu === 'day' ? (
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
                        onPress={() => onConfirm({ date: nav.resolvedDate })}
                        style={styles.action}
                        testID="react-native-paper-dates-docked-confirm"
                        textColor={actionColor}
                      >
                        {confirmLabel}
                      </Button>
                    </View>
                  ) : null}
                </>
              )}
            </Calendar>
          </View>
        </Surface>
      </View>
    </Modal>
  )
}

// Show a focus state layer only after keyboard focus, so a touch or click
// that opens the month/year menu does not leave the pill highlighted when
// the menu closes. Android also restores focus to the trigger, which would
// otherwise keep the layer on.
let lastInputWasKeyboard = false
let focusVisibleListeners = 0

function onFocusVisibleKeyDown(event: Event) {
  const keyEvent = event as unknown as {
    altKey?: boolean
    ctrlKey?: boolean
    metaKey?: boolean
  }
  if (keyEvent.metaKey || keyEvent.altKey || keyEvent.ctrlKey) return
  lastInputWasKeyboard = true
}

function onFocusVisiblePointer() {
  lastInputWasKeyboard = false
}

function listenForFocusVisibleInput() {
  if (Platform.OS !== 'web' || typeof window === 'undefined') {
    return () => {}
  }
  const target = window
  if (typeof target.addEventListener !== 'function') {
    return () => {}
  }
  if (focusVisibleListeners === 0) {
    target.addEventListener('keydown', onFocusVisibleKeyDown, true)
    target.addEventListener('mousedown', onFocusVisiblePointer, true)
    target.addEventListener('pointerdown', onFocusVisiblePointer, true)
    target.addEventListener('touchstart', onFocusVisiblePointer, true)
  }
  focusVisibleListeners += 1
  return () => {
    focusVisibleListeners -= 1
    if (
      focusVisibleListeners === 0 &&
      typeof target.removeEventListener === 'function'
    ) {
      target.removeEventListener('keydown', onFocusVisibleKeyDown, true)
      target.removeEventListener('mousedown', onFocusVisiblePointer, true)
      target.removeEventListener('pointerdown', onFocusVisiblePointer, true)
      target.removeEventListener('touchstart', onFocusVisiblePointer, true)
    }
  }
}

function useMenuButtonInteraction(disabled: boolean, open: boolean) {
  const [focused, setFocused] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [pressed, setPressed] = useState(false)

  useEffect(() => listenForFocusVisibleInput(), [])

  useEffect(() => {
    setPressed(false)
    setHovered(false)
    if (Platform.OS !== 'web' || !lastInputWasKeyboard) {
      setFocused(false)
    }
  }, [disabled, open])

  return {
    focused: !disabled && Platform.OS === 'web' && focused,
    hovered: !disabled && hovered,
    onBlur: () => setFocused(false),
    onFocus: () => {
      if (Platform.OS === 'web' && lastInputWasKeyboard) {
        setFocused(true)
        return
      }
      setFocused(false)
    },
    onHoverIn: () => setHovered(true),
    onHoverOut: () => setHovered(false),
    onPress: () => {
      lastInputWasKeyboard = false
      setPressed(false)
      setHovered(false)
      setFocused(false)
    },
    onPressIn: () => {
      lastInputWasKeyboard = false
      setPressed(true)
    },
    onPressOut: () => setPressed(false),
    pressed: !disabled && pressed,
  }
}

function DockedStepper({
  disabled,
  label,
  onNext,
  onOpen,
  onPrev,
  open,
  testID,
  unit,
}: {
  disabled: boolean
  label: string
  onNext: () => void
  onOpen: () => void
  onPrev: () => void
  open: boolean
  testID: string
  unit: 'month' | 'year'
}) {
  const theme = useTheme()
  const interaction = useMenuButtonInteraction(disabled, open)
  const labelColor = disabled
    ? theme.colors.onSurface
    : theme.colors.onSurfaceVariant
  const showArrows = !disabled && !open
  const labelText = (
    <Text
      maxFontSizeMultiplier={1.5}
      numberOfLines={1}
      style={[styles.menuLabel, { color: labelColor }]}
      variant="labelLarge"
    >
      {label}
    </Text>
  )
  const menuControl = (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled, expanded: open }}
      disabled={disabled}
      onBlur={interaction.onBlur}
      onFocus={interaction.onFocus}
      onHoverIn={interaction.onHoverIn}
      onHoverOut={interaction.onHoverOut}
      onPress={() => {
        interaction.onPress()
        onOpen()
      }}
      onPressIn={interaction.onPressIn}
      onPressOut={interaction.onPressOut}
      hitSlop={menuHitSlop}
      style={[styles.menuButton, { borderRadius: menuButtonHeight / 2 }]}
      testID={testID}
    >
      <StateLayer
        color={theme.colors.onSurfaceVariant}
        focused={interaction.focused}
        hovered={interaction.hovered}
        pressed={interaction.pressed}
      />
      <View
        style={[styles.menuContent, disabled ? styles.menuLabelDisabled : null]}
      >
        {labelText}
        <Icon color={labelColor} size={18} source="menu-down" />
      </View>
    </Pressable>
  )

  if (!showArrows) return menuControl

  return (
    <View style={styles.stepper}>
      <IconButton
        accessibilityLabel={getTranslation(undefined, 'previous')}
        hitSlop={iconHitSlop}
        icon="chevron-left"
        iconColor={labelColor}
        onPress={onPrev}
        size={24}
        style={styles.iconButton}
        testID={
          unit === 'month'
            ? 'react-native-paper-dates-docked-prev'
            : 'react-native-paper-dates-docked-year-prev'
        }
      />
      {menuControl}
      <IconButton
        accessibilityLabel={getTranslation(undefined, 'next')}
        hitSlop={iconHitSlop}
        icon="chevron-right"
        iconColor={labelColor}
        onPress={onNext}
        size={24}
        style={styles.iconButton}
        testID={
          unit === 'month'
            ? 'react-native-paper-dates-docked-next'
            : 'react-native-paper-dates-docked-year-next'
        }
      />
    </View>
  )
}

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
  iconButton: {
    flexShrink: 0,
    height: iconButtonSize,
    margin: 0,
    width: iconButtonSize,
  },
  menuButton: {
    alignItems: 'center',
    flexDirection: 'row',
    flexShrink: 1,
    height: menuButtonHeight,
    justifyContent: 'center',
    minWidth: 0,
    overflow: 'hidden',
    paddingHorizontal: menuButtonPadding,
  },
  menuContent: {
    alignItems: 'center',
    flexDirection: 'row',
    flexShrink: 1,
    gap: menuIconGap,
    minWidth: 0,
  },
  menuLabel: {
    flexShrink: 1,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  menuLabelDisabled: {
    opacity: 0.38,
  },
  menuMonth: {
    alignItems: 'flex-start',
    flex: 1,
    justifyContent: 'center',
    paddingLeft: menuLabelInset,
  },
  menuYear: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  spacer: {
    flex: 1,
  },
  stepper: {
    alignItems: 'center',
    flexDirection: 'row',
    flexShrink: 1,
    gap: stepperGap,
    minWidth: 0,
  },
  toolbarSide: {
    flexShrink: 1,
    maxWidth: '100%',
    minWidth: 0,
  },
  toolbar: {
    alignItems: 'center',
    flexDirection: 'row',
    height: headerRowHeight,
    marginBottom: headerGap,
    marginTop: headerPaddingTop,
  },
  toolbarDay: {
    paddingHorizontal: dayHeaderInset,
  },
  toolbarMenu: {
    marginBottom: headerGap,
  },
})

export default memo(DatePickerDocked)
