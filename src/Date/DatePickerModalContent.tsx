import { memo, useCallback, useEffect, useState } from 'react'
import { LayoutChangeEvent, Platform, StyleSheet, View } from 'react-native'
import { Button, Divider, useTheme } from 'react-native-paper'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { sharedStyles } from '../shared/styles'
import { displayCase, themeColor, useIsLargeScreen } from '../shared/utils'
import { translate } from '../translations/utils'
import AnimatedCrossView from './AnimatedCrossView'
import Calendar, { type BaseCalendarProps } from './Calendar'
import CalendarEdit from './CalendarEdit'
import DatePickerModalContentHeader, {
  HeaderPickProps,
} from './DatePickerModalContentHeader'
import DatePickerModalHeader from './DatePickerModalHeader'
import DatePickerModalHeaderBackground from './DatePickerModalHeaderBackground'
import DatePickerModalStatusBar from './DatePickerModalStatusBar'
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
  const [collapsed, setCollapsed] = useState(props.displayMode !== 'input')
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
  useEffect(() => {
    setCollapsed(displayMode !== 'input')
  }, [displayMode])
  const onCalendarContainerLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const { height, width } = event.nativeEvent.layout
      const calendarWidth = width - insets.left - insets.right
      if (onCalendarLayout && calendarWidth > 0 && height > 0) {
        onCalendarLayout({ height, width: calendarWidth })
      }
    },
    [onCalendarLayout, insets.left, insets.right]
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
  const onInnerConfirm = useCallback(() => {
    if (mode === 'single') {
      ;(onConfirm as DatePickerModalContentSingleProps['onConfirm'])({
        date: state.date,
      })
    } else if (mode === 'range') {
      ;(onConfirm as DatePickerModalContentRangeProps['onConfirm'])({
        endDate: state.endDate,
        startDate: state.startDate,
      })
    } else if (mode === 'multiple') {
      ;(onConfirm as DatePickerModalContentMultiProps['onConfirm'])({
        dates: state.dates || [],
      })
    }
  }, [state, mode, onConfirm])
  const onToggleCollapse = useCallback(() => {
    if (onRequestInput && collapsed) {
      onRequestInput()
      return
    }
    setCollapsed((prev) => !prev)
  }, [collapsed, onRequestInput])

  return (
    <>
      <DatePickerModalHeaderBackground disableWeekDays={disableWeekDays}>
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
            saveLabelDisabled={props.saveLabelDisabled ?? false}
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
          sharedStyles.root,
          sharedStyles.minHeightZero,
          sharedStyles.overflowHidden,
          { paddingLeft: insets.left, paddingRight: insets.right },
        ]}
      >
        <AnimatedCrossView
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
          calendarEdit={
            <CalendarEdit
              collapsed={collapsed}
              disableWeekDays={disableWeekDays}
              endLabel={props.endLabel}
              inputEnabled={props.inputEnabled}
              label={props.label}
              locale={locale}
              mode={mode}
              onChange={onInnerChange}
              placeholder={props.placeholder}
              startLabel={props.startLabel}
              state={state}
              validRange={validRange}
              withDateFormatInLabel={props.withDateFormatInLabel}
            />
          }
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
              disabled={props.saveLabelDisabled ?? false}
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
    justifyContent: 'flex-end',
    paddingBottom: 12,
    paddingHorizontal: 12,
    paddingTop: 8,
  },
})

export default memo(DatePickerModalContent)
