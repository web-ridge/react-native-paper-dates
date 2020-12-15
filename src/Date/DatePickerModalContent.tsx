import * as React from 'react'

import Calendar, { CalendarDate, RangeChange, SingleChange } from './Calendar'

import AnimatedCrossView from './AnimatedCrossView'

import DatePickerModalHeader from './DatePickerModalHeader'
import DatePickerModalContentHeader, {
  HeaderPickProps,
} from './DatePickerModalContentHeader'
import CalendarEdit from './CalendarEdit'
import DatePickerModalHeaderBackground from './DatePickerModalHeaderBackground'

export type LocalState = {
  startDate: CalendarDate
  endDate: CalendarDate
  date: CalendarDate
}

export interface DatePickerModalContentRangeProps extends HeaderPickProps {
  inputFormat?: string
  onDismiss: () => any
  mode: 'range'
  startDate: Date | null | undefined
  endDate: Date | null | undefined
  onChange?: RangeChange
  onConfirm: RangeChange
  disableSafeTop?: boolean
}
export interface DatePickerModalContentSingleProps extends HeaderPickProps {
  inputFormat?: string
  onDismiss: () => any
  mode: 'single'
  date?: Date | null | undefined
  onChange?: SingleChange
  onConfirm: SingleChange
  disableSafeTop?: boolean
}

export function DatePickerModalContent(
  props: DatePickerModalContentRangeProps | DatePickerModalContentSingleProps
) {
  const { mode, onChange, onConfirm, onDismiss, disableSafeTop } = props

  const anyProps = props as any

  // use local state to add only onConfirm state changes
  const [state, setState] = React.useState<LocalState>({
    date: anyProps.date,
    startDate: anyProps.startDate,
    endDate: anyProps.endDate,
  })

  // update local state if changed from outside or if modal is opened
  React.useEffect(() => {
    setState({
      date: anyProps.date,
      startDate: anyProps.startDate,
      endDate: anyProps.endDate,
    })
  }, [anyProps.date, anyProps.startDate, anyProps.endDate])

  const [collapsed, setCollapsed] = React.useState<boolean>(true)

  const onInnerChange = React.useCallback(
    (params) => {
      onChange && onChange(params)
      setState(params)
    },
    [onChange, setState]
  )

  const onInnerConfirm = React.useCallback(() => {
    if (mode === 'single') {
      onConfirm({ date: state.date } as any)
    }
    if (mode === 'range') {
      onConfirm({ startDate: state.startDate, endDate: state.endDate } as any)
    }
  }, [state, mode, onConfirm])

  const onToggleCollapse = React.useCallback(() => {
    setCollapsed((prev) => !prev)
  }, [setCollapsed])

  return (
    <>
      <DatePickerModalHeaderBackground>
        <DatePickerModalHeader
          onSave={onInnerConfirm}
          onDismiss={onDismiss}
          saveLabel={props.saveLabel}
          disableSafeTop={disableSafeTop}
        />
        <DatePickerModalContentHeader
          state={state}
          mode={mode}
          collapsed={collapsed}
          onToggle={onToggleCollapse}
          headerSeparator={props.headerSeparator}
          label={props.label}
          startLabel={props.startLabel}
          endLabel={props.endLabel}
        />
      </DatePickerModalHeaderBackground>

      <AnimatedCrossView
        collapsed={collapsed}
        calendar={
          <Calendar
            mode={mode}
            startDate={state.startDate}
            endDate={state.endDate}
            date={state.date}
            onChange={onInnerChange}
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
          />
        }
      />
    </>
  )
}

export default React.memo(DatePickerModalContent)
