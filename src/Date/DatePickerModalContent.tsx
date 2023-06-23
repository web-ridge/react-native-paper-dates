import * as React from 'react'

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
import { useTheme } from 'react-native-paper'

export type LocalState = {
  startDate: CalendarDate
  endDate: CalendarDate
  date: CalendarDate
  dates: CalendarDates
}

interface DatePickerModalContentBaseProps {
  inputFormat?: string
  locale: string
  onDismiss: () => any
  disableSafeTop?: boolean
  saveLabelDisabled?: boolean
  uppercase?: boolean
  inputEnabled?: boolean
}

export interface DatePickerModalContentRangeProps
  extends HeaderPickProps,
    BaseCalendarProps,
    DatePickerModalContentBaseProps {
  mode: 'range'
  startDate: CalendarDate
  endDate: CalendarDate
  onChange?: RangeChange
  onConfirm: RangeChange
}

export interface DatePickerModalContentSingleProps
  extends HeaderPickProps,
    BaseCalendarProps,
    DatePickerModalContentBaseProps {
  mode: 'single'
  date?: CalendarDate
  onChange?: SingleChange
  onConfirm: SingleChange
  dateMode?: 'start' | 'end'
}

export interface DatePickerModalContentMultiProps
  extends HeaderPickProps,
    BaseCalendarProps,
    DatePickerModalContentBaseProps {
  mode: 'multiple'
  dates?: CalendarDates
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
    mode,
    onChange,
    onConfirm,
    onDismiss,
    disableSafeTop,
    disableWeekDays,
    locale,
    validRange,
    dateMode,
    startYear,
    endYear,
  } = props
  const anyProps = props as any

  // use local state to add only onConfirm state changes
  const [state, setState] = React.useState<LocalState>({
    date: anyProps.date,
    startDate: anyProps.startDate,
    endDate: anyProps.endDate,
    dates: anyProps.dates,
  })

  // update local state if changed from outside or if modal is opened
  React.useEffect(() => {
    setState({
      date: anyProps.date,
      startDate: anyProps.startDate,
      endDate: anyProps.endDate,
      dates: anyProps.dates,
    })
  }, [anyProps.date, anyProps.startDate, anyProps.endDate, anyProps.dates])

  const [collapsed, setCollapsed] = React.useState<boolean>(true)

  const onInnerChange = React.useCallback(
    (params: any) => {
      onChange && onChange(params)
      setState((prev) => ({ ...prev, ...params }))
    },
    [onChange, setState]
  )

  const onInnerConfirm = React.useCallback(() => {
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

  const onToggleCollapse = React.useCallback(() => {
    setCollapsed((prev) => !prev)
  }, [setCollapsed])

  const theme = useTheme()
  const defaultUppercase = !theme.isV3
  return (
    <>
      <DatePickerModalHeaderBackground>
        <DatePickerModalHeader
          locale={locale}
          onSave={onInnerConfirm}
          onDismiss={onDismiss}
          saveLabel={props.saveLabel}
          saveLabelDisabled={props.saveLabelDisabled ?? false}
          uppercase={props.uppercase ?? defaultUppercase}
          disableSafeTop={disableSafeTop}
          closeIcon={props.closeIcon}
        />
        <DatePickerModalContentHeader
          state={state}
          mode={mode}
          collapsed={collapsed}
          onToggle={onToggleCollapse}
          headerSeparator={props.headerSeparator}
          emptyLabel={props.emptyLabel}
          label={props.label}
          moreLabel={props.moreLabel}
          startLabel={props.startLabel}
          endLabel={props.endLabel}
          uppercase={props.uppercase ?? defaultUppercase}
          locale={locale}
          editIcon={props?.editIcon}
          calendarIcon={props.calendarIcon}
          allowEditing={props.allowEditing ?? true}
        />
      </DatePickerModalHeaderBackground>
      <AnimatedCrossView
        collapsed={collapsed}
        calendar={
          <Calendar
            locale={locale}
            mode={mode}
            startDate={state.startDate}
            endDate={state.endDate}
            date={state.date}
            onChange={onInnerChange}
            disableWeekDays={disableWeekDays}
            dates={state.dates}
            validRange={validRange}
            dateMode={dateMode}
            startYear={startYear}
            endYear={endYear}
          />
        }
        calendarEdit={
          <CalendarEdit
            mode={mode}
            state={state}
            label={props.label}
            startLabel={props.startLabel}
            endLabel={props.endLabel}
            collapsed={collapsed}
            onChange={onInnerChange}
            validRange={validRange}
            locale={locale}
            inputEnabled={props.inputEnabled}
          />
        }
      />
    </>
  )
}

export default React.memo(DatePickerModalContent)
