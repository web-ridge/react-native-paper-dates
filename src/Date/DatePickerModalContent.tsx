import { memo, useCallback, useEffect, useState } from 'react'
import { LayoutChangeEvent, Platform, StyleSheet, View } from 'react-native'
import { Button, Divider, useTheme } from 'react-native-paper'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { sharedStyles } from '../shared/styles'
import {
  displayCase,
  themeColor,
  useIsLargeScreen,
  useLatest,
} from '../shared/utils'
import { translate } from '../translations/utils'
import AnimatedCrossView from './AnimatedCrossView'
import Calendar, { type BaseCalendarProps } from './Calendar'
import DatePickerInputForm from './DatePickerInputForm'
import DatePickerModalContentHeader, {
  HeaderPickProps,
} from './DatePickerModalContentHeader'
import DatePickerModalHeader from './DatePickerModalHeader'
import DatePickerModalHeaderBackground from './DatePickerModalHeaderBackground'
import DatePickerModalStatusBar from './DatePickerModalStatusBar'
import { areDatesOnSameDay } from './dateUtils'
import { confirmDates } from './selection'
import type {
  CalendarDate,
  CalendarDates,
  MultiChange,
  MultiConfirm,
  RangeCalendarMode,
  RangeChange,
  SingleChange,
} from './types'

interface DatePickerModalContentBaseProps {
  disableSafeTop?: boolean
  disableStatusBar?: boolean
  displayMode?: 'calendar' | 'input'
  inputEnabled?: boolean
  inputFormat?: string
  layout?: 'card'
  locale: string
  onCalendarLayout?: (layout: { height: number; width: number }) => void
  onDismiss: () => void
  onDisplayModeChange?: (mode: 'calendar' | 'input') => void
  onRequestInput?: () => void
  saveLabelDisabled?: boolean
  statusBarOnTopOfBackdrop?: boolean
  uppercase?: boolean
}
export interface DatePickerModalContentMultiProps
  extends HeaderPickProps, BaseCalendarProps, DatePickerModalContentBaseProps {
  mode: 'multiple'
  onChange?: MultiChange
  onConfirm: MultiConfirm
}
export type DatePickerModalContentRangeProps = HeaderPickProps &
  BaseCalendarProps &
  DatePickerModalContentBaseProps &
  RangeCalendarMode & {
    onChange?: RangeChange
    onConfirm: RangeChange
  }
export interface DatePickerModalContentSingleProps
  extends HeaderPickProps, BaseCalendarProps, DatePickerModalContentBaseProps {
  dateMode?: 'start' | 'end'
  mode: 'single'
  onChange?: SingleChange
  onConfirm: SingleChange
}
export type LocalState = {
  date: CalendarDate
  dates: CalendarDates
  endDate: CalendarDate
  startDate: CalendarDate
}

export function DatePickerModalContent(
  props:
    | DatePickerModalContentRangeProps
    | DatePickerModalContentSingleProps
    | DatePickerModalContentMultiProps
) {
  const [collapsed, setCollapsed] = useState(
    () => props.mode === 'multiple' || props.displayMode !== 'input'
  )
  const [focusOnInput, setFocusOnInput] = useState(false)
  const [inputValid, setInputValid] = useState(true)
  const [selectingYear, setSelectingYear] = useState(false)
  const {
    date,
    dateMode,
    dates,
    dayContent,
    dayContentPosition,
    dayContentStyle,
    disableSafeTop,
    disableStatusBar,
    disableWeekDays,
    displayMode,
    endDate,
    endYear,
    initialLayout,
    layout,
    locale,
    mode,
    onCalendarLayout,
    onChange,
    onConfirm,
    onDismiss,
    onDisplayModeChange,
    onRequestInput,
    startDate,
    startWeekOnMonday,
    startYear,
    statusBarOnTopOfBackdrop,
    validRange,
  } = props
  const defaultUppercase = false
  const cardLayout = layout === 'card'
  const insets = useSafeAreaInsets()
  const isLargeScreen = useIsLargeScreen()
  const fillYearList = mode === 'single' && selectingYear && !isLargeScreen
  const hugCalendar = mode === 'single' && !fillYearList
  const showFooter = isLargeScreen || cardLayout
  const showSheetHeader = !isLargeScreen && !cardLayout
  const theme = useTheme()
  const actionColor = themeColor(theme.colors.primary)
  const uppercase = props.uppercase ?? defaultUppercase
  const confirmLabel = displayCase(
    props.saveLabel || translate(locale, 'confirm', 'OK'),
    uppercase
  )
  const cancelLabel = displayCase(
    translate(locale, 'cancel', 'Cancel'),
    uppercase
  )
  const [state, setState] = useState<LocalState>({
    date,
    dates,
    endDate,
    startDate,
  })
  useEffect(() => {
    setState({
      date,
      dates,
      endDate,
      startDate,
    })
  }, [date, startDate, endDate, dates])
  const onDisplayModeChangeRef = useLatest(onDisplayModeChange)
  const reportDisplayMode = useCallback(
    (nextCollapsed: boolean) => {
      onDisplayModeChangeRef.current?.(
        !nextCollapsed && mode !== 'multiple' ? 'input' : 'calendar'
      )
    },
    [mode, onDisplayModeChangeRef]
  )
  useEffect(() => {
    const nextCollapsed = mode === 'multiple' || displayMode !== 'input'
    setCollapsed(nextCollapsed)
    reportDisplayMode(nextCollapsed)
  }, [displayMode, mode, reportDisplayMode])
  const horizontalInset = showSheetHeader
    ? { paddingLeft: insets.left, paddingRight: insets.right }
    : null
  const onCalendarContainerLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const { height, width } = event.nativeEvent.layout
      const inset = showSheetHeader ? insets.left + insets.right : 0
      const calendarWidth = width - inset
      if (onCalendarLayout && calendarWidth > 0 && height > 0) {
        onCalendarLayout({ height, width: calendarWidth })
      }
    },
    [insets.left, insets.right, onCalendarLayout, showSheetHeader]
  )
  const onInnerChange = useCallback(
    (params: Partial<LocalState>) => {
      if (onChange) {
        ;(onChange as (next: Partial<LocalState>) => void)(params)
      }
      setState((prev) => ({ ...prev, ...params }))
    },
    [onChange]
  )
  const sameDayRange =
    mode === 'range' &&
    !!state.startDate &&
    !!state.endDate &&
    areDatesOnSameDay(state.startDate, state.endDate)
  const onInnerConfirm = useCallback(() => {
    const confirmed = confirmDates(mode, state, true)
    if (!confirmed) return
    ;(onConfirm as (value: typeof confirmed) => void)(confirmed)
  }, [state, mode, onConfirm])
  const onInputValidityChange = useCallback((valid: boolean) => {
    setInputValid(valid)
  }, [])
  const showCalendar = useCallback(() => {
    setCollapsed(true)
    reportDisplayMode(true)
  }, [reportDisplayMode])
  const onToggleCollapse = useCallback(() => {
    if (onRequestInput && collapsed) {
      onRequestInput()
      return
    }
    setFocusOnInput(true)
    setCollapsed(false)
    reportDisplayMode(false)
  }, [collapsed, onRequestInput, reportDisplayMode])

  if ((mode === 'single' || mode === 'range') && !collapsed) {
    const form = (
      <DatePickerInputForm
        autoFocus={focusOnInput}
        calendarIcon={props.calendarIcon}
        date={state.date}
        endDate={state.endDate}
        endLabel={props.endLabel}
        inputEnabled={props.inputEnabled}
        label={props.label}
        locale={locale}
        mode={mode}
        onChange={onInnerChange}
        onConfirm={onInnerConfirm}
        onDismiss={onDismiss}
        onRequestCalendar={showCalendar}
        onValidityChange={onInputValidityChange}
        placeholder={props.placeholder}
        saveLabel={props.saveLabel}
        saveLabelDisabled={props.saveLabelDisabled}
        showActions={!showSheetHeader}
        startDate={state.startDate}
        startLabel={props.startLabel}
        uppercase={uppercase}
        validRange={validRange}
        withDateFormatInLabel={props.withDateFormatInLabel}
      />
    )
    if (!showSheetHeader) return form
    return (
      <View style={sharedStyles.root}>
        <DatePickerModalHeaderBackground
          disableWeekDays={disableWeekDays}
          divider={false}
          insetHorizontal
        >
          <DatePickerModalStatusBar
            disableSafeTop={!!disableSafeTop}
            disableStatusBar={!!disableStatusBar}
            statusBarOnTopOfBackdrop={!!statusBarOnTopOfBackdrop}
          />
          <DatePickerModalHeader
            closeIcon={props.closeIcon}
            disableWeekDays={disableWeekDays}
            locale={locale}
            onDismiss={onDismiss}
            onSave={onInnerConfirm}
            saveLabel={props.saveLabel}
            saveLabelDisabled={
              (props.saveLabelDisabled ?? false) || !inputValid || sameDayRange
            }
            uppercase={uppercase}
          />
        </DatePickerModalHeaderBackground>
        <View style={[sharedStyles.root, horizontalInset]}>{form}</View>
      </View>
    )
  }

  return (
    <>
      <DatePickerModalHeaderBackground
        disableWeekDays={disableWeekDays}
        insetHorizontal={showSheetHeader}
      >
        <DatePickerModalStatusBar
          disableSafeTop={!!disableSafeTop}
          disableStatusBar={!!disableStatusBar}
          statusBarOnTopOfBackdrop={!!statusBarOnTopOfBackdrop}
        />
        {showSheetHeader ? (
          <DatePickerModalHeader
            closeIcon={props.closeIcon}
            disableWeekDays={disableWeekDays}
            locale={locale}
            onDismiss={onDismiss}
            onSave={onInnerConfirm}
            saveLabel={props.saveLabel}
            saveLabelDisabled={
              (props.saveLabelDisabled ?? false) || sameDayRange
            }
            uppercase={uppercase}
          />
        ) : null}
        <DatePickerModalContentHeader
          allowEditing={props.allowEditing ?? true}
          calendarIcon={props.calendarIcon}
          collapsed={collapsed}
          disableWeekDays={disableWeekDays}
          editIcon={props.editIcon}
          emptyLabel={props.emptyLabel}
          endLabel={props.endLabel}
          headerSeparator={props.headerSeparator}
          label={props.label}
          layout={props.layout}
          locale={locale}
          mode={mode}
          moreLabel={props.moreLabel}
          onToggle={onToggleCollapse}
          startLabel={props.startLabel}
          state={state}
          uppercase={uppercase}
        />
      </DatePickerModalHeaderBackground>
      <View
        onLayout={Platform.OS === 'web' ? undefined : onCalendarContainerLayout}
        style={[
          hugCalendar ? sharedStyles.hug : sharedStyles.root,
          sharedStyles.minHeightZero,
          sharedStyles.overflowHidden,
          horizontalInset,
        ]}
      >
        <AnimatedCrossView
          fill={!hugCalendar}
          calendar={
            <Calendar
              date={state.date}
              dateMode={dateMode}
              dates={state.dates}
              dayContent={dayContent}
              dayContentPosition={dayContentPosition}
              dayContentStyle={dayContentStyle}
              disableWeekDays={disableWeekDays}
              endDate={state.endDate}
              endYear={endYear}
              fill={fillYearList}
              initialLayout={initialLayout}
              keyboardEnabled={collapsed}
              locale={locale}
              mode={mode}
              onChange={onInnerChange}
              onKeyboardConfirm={onInnerConfirm}
              onSelectingYearChange={setSelectingYear}
              startDate={state.startDate}
              startWeekOnMonday={startWeekOnMonday}
              startYear={startYear}
              validRange={validRange}
            />
          }
          calendarEdit={null}
          collapsed={collapsed}
        />
      </View>
      {showFooter ? (
        <View>
          {selectingYear && collapsed ? (
            <Divider
              bold
              style={{ backgroundColor: theme.colors.outlineVariant }}
            />
          ) : null}
          <View style={styles.actions}>
            <Button
              labelStyle={styles.actionLabel}
              mode="text"
              onPress={onDismiss}
              style={styles.action}
              testID="react-native-paper-dates-cancel"
              textColor={actionColor}
            >
              {cancelLabel}
            </Button>
            <Button
              disabled={(props.saveLabelDisabled ?? false) || sameDayRange}
              labelStyle={styles.actionLabel}
              mode="text"
              onPress={onInnerConfirm}
              style={styles.action}
              testID="react-native-paper-dates-confirm"
              textColor={actionColor}
            >
              {confirmLabel}
            </Button>
          </View>
        </View>
      ) : null}
    </>
  )
}

const styles = StyleSheet.create({
  action: {
    minHeight: 40,
    minWidth: 64,
  },
  actionLabel: {
    marginVertical: 0,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-end',
    paddingBottom: 12,
    paddingHorizontal: 12,
    paddingTop: 8,
  },
})

export default memo(DatePickerModalContent)
