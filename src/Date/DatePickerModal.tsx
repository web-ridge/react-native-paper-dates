import * as React from 'react'
import {
  Modal,
  StyleSheet,
  TouchableWithoutFeedback,
  useWindowDimensions,
  View,
} from 'react-native'

import Calendar, {
  BaseCalendarProps,
  CalendarDate,
  ModeType,
  RangeChange,
  SingleChange,
} from './Calendar'

import AnimatedCrossView from './AnimatedCrossView'

import DatePickerModalHeader, { HeaderPickProps } from './DatePickerModalHeader'
import CalendarEdit from './CalendarEdit'
import { useTheme } from 'react-native-paper'

interface DatePickerModalProps extends HeaderPickProps, BaseCalendarProps {
  mode: ModeType
  visible: boolean
  onDismiss: () => any
  inputFormat?: string
}

export type LocalState = {
  startDate: CalendarDate
  endDate: CalendarDate
  date: CalendarDate
}

interface DatePickerModalRangeProps
  extends BaseCalendarProps,
    DatePickerModalProps {
  mode: 'range'
  startDate: Date | null | undefined
  endDate: Date | null | undefined
  onChange?: RangeChange
  onConfirm: RangeChange
}
interface DatePickerModalSingleProps
  extends BaseCalendarProps,
    DatePickerModalProps {
  mode: 'single'
  date?: Date | null | undefined
  onChange?: SingleChange
  onConfirm: SingleChange
}

export function DatePickerModal(
  props: DatePickerModalRangeProps | DatePickerModalSingleProps
) {
  const theme = useTheme()
  const dimensions = useWindowDimensions()
  const { visible, onDismiss, mode, onChange, onConfirm } = props
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
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onDismiss}
      presentationStyle="overFullScreen"
      //@ts-ignore
      statusBarTranslucent={true}
    >
      <>
        <TouchableWithoutFeedback onPress={onDismiss}>
          <View
            style={[
              StyleSheet.absoluteFill,
              styles.modalBackground,
              { backgroundColor: theme.colors.backdrop },
            ]}
          />
        </TouchableWithoutFeedback>
        <View
          style={[StyleSheet.absoluteFill, styles.modalRoot]}
          pointerEvents="box-none"
        >
          <View
            style={[
              styles.modalContent,
              { backgroundColor: theme.colors.surface },
              dimensions.width > 650 ? styles.modalContentBig : null,
            ]}
          >
            <DatePickerModalHeader
              state={state}
              mode={mode}
              onSave={onInnerConfirm}
              onDismiss={onDismiss}
              collapsed={collapsed}
              onToggle={onToggleCollapse}
              saveLabel={props.saveLabel}
              headerSeparator={props.headerSeparator}
              label={props.label}
              startLabel={props.startLabel}
              endLabel={props.endLabel}
            />

            <AnimatedCrossView
              visible={visible}
              collapsed={collapsed}
              calendar={
                <Calendar
                  mode={mode}
                  startDate={state.startDate}
                  endDate={state.endDate}
                  date={state.date}
                  onChange={onInnerChange}
                  scrollMode={props.scrollMode}
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
          </View>
        </View>
      </>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalRoot: {
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    flex: 1,
  },
  modalBackground: {
    flex: 1,
  },
  modalContent: {
    flex: 1,
  },
  modalContentBig: {
    maxWidth: 600,
    maxHeight: 800,
    borderRadius: 10,
    width: '100%',
    overflow: 'hidden',
  },
})

export default React.memo(DatePickerModal)
