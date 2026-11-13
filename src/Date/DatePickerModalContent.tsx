import Calendar, {
  BaseCalendarProps,
  CalendarDate,
  CalendarDates,
  MultiChange,
  MultiConfirm,
  RangeChange,
  SingleChange,
} from './Calendar'

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

export type LocalState = {
  startDate: CalendarDate
  endDate: CalendarDate
  date: CalendarDate
  dates: CalendarDates
}

interface DatePickerModalContentBaseProps {
  disableSafeTop?: boolean
  disableStatusBar?: boolean
  inputEnabled?: boolean
  inputFormat?: string
  locale: string
  onCalendarLayout?: (layout: { width: number; height: number }) => void
  onDismiss: () => any
  saveLabelDisabled?: boolean
  statusBarOnTopOfBackdrop?: boolean
  uppercase?: boolean
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

export interface DatePickerModalContentMultiProps
  extends HeaderPickProps, BaseCalendarProps, DatePickerModalContentBaseProps {
  dates?: CalendarDates
  mode: 'multiple'
  onChange?: MultiChange
  onConfirm: MultiConfirm
}

export function DatePickerModalContent(
  props:
    | DatePickerModalContentRangeProps
    | DatePickerModalContentSingleProps
    | DatePickerModalContentMultiProps
) {
  const {
    dateMode,
    dayContent,
    dayContentPosition,
    dayContentStyle,
    disableSafeTop,
    disableStatusBar,
    disableWeekDays,
    endYear,
    initialLayout,
    locale,
    mode,
    onCalendarLayout,
    onChange,
    onConfirm,
    onDismiss,
    startWeekOnMonday,
    startYear,
    statusBarOnTopOfBackdrop,
    validRange,
  } = props
  const anyProps = props as any
  const defaultUppercase = false
  const insets = useSafeAreaInsets()

  const [state, setState] = useState<LocalState>({
    date: anyProps.date,
    startDate: anyProps.startDate,
    endDate: anyProps.endDate,
    dates: anyProps.dates,
  })
  const [collapsed, setCollapsed] = useState(true)

  useEffect(() => {
    setState({
      date: anyProps.date,
      startDate: anyProps.startDate,
      endDate: anyProps.endDate,
      dates: anyProps.dates,
    })
  }, [anyProps.date, anyProps.startDate, anyProps.endDate, anyProps.dates])

  const onInnerChange = useCallback(
    (params: any) => {
      onChange && onChange(params)
      setState((prev) => ({ ...prev, ...params }))
    },
    [onChange, setState]
  )

  const onInnerConfirm = useCallback(() => {
    if (mode === 'single') {
      ;(onConfirm as DatePickerModalContentSingleProps['onConfirm'])({
        date: state.date,
      })
    } else if (mode === 'range') {
      ;(onConfirm as DatePickerModalContentRangeProps['onConfirm'])({
        startDate: state.startDate,
        endDate: state.endDate,
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

  const onCalendarContainerLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const { width, height } = event.nativeEvent.layout
      const calendarWidth = width - insets.left - insets.right
      if (onCalendarLayout && calendarWidth > 0 && height > 0) {
        onCalendarLayout({ width: calendarWidth, height })
      }
    },
    [onCalendarLayout, insets.left, insets.right]
  )

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

export default memo(DatePickerModalContent)
