import Calendar, { type BaseCalendarProps } from './Calendar'
import type {
  CalendarDate,
  CalendarDates,
  MultiChange,
  MultiConfirm,
  RangeChange,
  SingleChange,
} from './types'

import AnimatedCrossView from './AnimatedCrossView'
import DatePickerModalHeader from './DatePickerModalHeader'
import DatePickerModalContentHeader, {
  HeaderPickProps,
} from './DatePickerModalContentHeader'
import CalendarEdit from './CalendarEdit'
import DatePickerModalHeaderBackground from './DatePickerModalHeaderBackground'
import DatePickerModalStatusBar from './DatePickerModalStatusBar'
import { memo, useCallback, useEffect, useState } from 'react'
import { LayoutChangeEvent, Platform, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { sharedStyles } from '../shared/styles'

export function DatePickerModalContent(
  props:
    | DatePickerModalContentRangeProps
    | DatePickerModalContentSingleProps
    | DatePickerModalContentMultiProps
) {
  const [collapsed, setCollapsed] = useState(true)
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
    endDate,
    endYear,
    initialLayout,
    locale,
    mode,
    onCalendarLayout,
    onChange,
    onConfirm,
    onDismiss,
    startDate,
    startWeekOnMonday,
    startYear,
    statusBarOnTopOfBackdrop,
    validRange,
  } = props
  const defaultUppercase = false
  const insets = useSafeAreaInsets()
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
    setCollapsed((prev) => !prev)
  }, [setCollapsed])

  return (
    <>
      <DatePickerModalHeaderBackground disableWeekDays={disableWeekDays}>
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
          saveLabelDisabled={props.saveLabelDisabled ?? false}
          uppercase={props.uppercase ?? defaultUppercase}
        />
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
          uppercase={props.uppercase ?? defaultUppercase}
        />
      </DatePickerModalHeaderBackground>
      <View
        onLayout={Platform.OS === 'web' ? undefined : onCalendarContainerLayout}
        style={[
          sharedStyles.root,
          sharedStyles.minHeightZero,
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
              locale={locale}
              mode={mode}
              onChange={onInnerChange}
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
    </>
  )
}

interface DatePickerModalContentBaseProps {
  disableSafeTop?: boolean
  disableStatusBar?: boolean
  inputEnabled?: boolean
  inputFormat?: string
  locale: string
  onCalendarLayout?: (layout: { height: number; width: number }) => void
  onDismiss: () => void
  saveLabelDisabled?: boolean
  statusBarOnTopOfBackdrop?: boolean
  uppercase?: boolean
}

export interface DatePickerModalContentMultiProps
  extends HeaderPickProps, BaseCalendarProps, DatePickerModalContentBaseProps {
  dates?: CalendarDates
  mode: 'multiple'
  onChange?: MultiChange
  onConfirm: MultiConfirm
}

export interface DatePickerModalContentRangeProps
  extends HeaderPickProps, BaseCalendarProps, DatePickerModalContentBaseProps {
  endDate: CalendarDate
  mode: 'range'
  onChange?: RangeChange
  onConfirm: RangeChange
  startDate: CalendarDate
}

export interface DatePickerModalContentSingleProps
  extends HeaderPickProps, BaseCalendarProps, DatePickerModalContentBaseProps {
  date?: CalendarDate
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

export default memo(DatePickerModalContent)
