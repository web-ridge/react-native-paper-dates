import {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import {
  Modal,
  Platform,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native'

import ElevatedCard from '../shared/ElevatedCard'
import ModalScrim from '../shared/ModalScrim'
import { useModalAnimation } from '../shared/motion'
import { supportedOrientations } from '../shared/utils'
import DatePickerInputForm, {
  dateInputCardMaxWidth,
  dateInputCardWidth,
  releaseFieldFocus,
} from './DatePickerInputForm'
import DatePickerModalContent from './DatePickerModalContent'
import {
  dateInputMaxHeight,
  datePickerRangeMaxHeight,
  datePickerSingleMaxHeight,
  defaultEndYear,
  defaultStartYear,
} from './dateUtils'
import type {
  CalendarDate,
  DisableWeekDaysType,
  RangeChange,
  SingleChange,
  ValidRangeType,
} from './types'

export type DatePickerModalInputProps =
  | DatePickerModalInputRangeProps
  | DatePickerModalInputSingleProps
type DatePickerModalInputRangeProps = DatePickerModalInputSharedProps & {
  endDate?: CalendarDate
  mode: 'range'
  onConfirm: RangeChange
  startDate?: CalendarDate
}
type DatePickerModalInputSharedProps = {
  animationType?: 'slide' | 'fade' | 'none'
  calendarIcon?: string
  disableWeekDays?: DisableWeekDaysType
  endLabel?: string
  endYear?: number
  label?: string
  locale: string
  onDismiss: () => void
  saveLabel?: string
  saveLabelDisabled?: boolean
  startLabel?: string
  startWeekOnMonday?: boolean
  startYear?: number
  uppercase?: boolean
  validRange?: ValidRangeType
  visible: boolean
}
type DatePickerModalInputSingleProps = DatePickerModalInputSharedProps & {
  date?: CalendarDate
  mode: 'single'
  onConfirm: SingleChange
}

function DatePickerModalInput(props: DatePickerModalInputProps) {
  const {
    animationType,
    calendarIcon,
    disableWeekDays,
    endLabel,
    endYear,
    label,
    locale,
    mode,
    onDismiss,
    saveLabel,
    saveLabelDisabled,
    startLabel,
    startWeekOnMonday,
    startYear,
    uppercase,
    validRange,
    visible,
  } = props
  const date = mode === 'single' ? props.date : undefined
  const endDate = mode === 'range' ? props.endDate : undefined
  const startDate = mode === 'range' ? props.startDate : undefined
  const { height: windowHeight, width: windowWidth } = useWindowDimensions()
  const pageScroll = useRef<(() => void) | null>(null)
  const [presented, setPresented] = useState(false)
  const [draftDate, setDraftDate] = useState<CalendarDate>(date)
  const [draftEnd, setDraftEnd] = useState<CalendarDate>(endDate)
  const [draftStart, setDraftStart] = useState<CalendarDate>(startDate)
  const [view, setView] = useState<'calendar' | 'input'>('input')
  const wasVisible = useRef(false)
  const resolvedEndYear = endYear ?? defaultEndYear
  const resolvedStartYear = startYear ?? defaultStartYear
  const resolvedUppercase = !!uppercase
  const animation = useModalAnimation(
    animationType,
    Platform.OS === 'web' ? 'none' : 'fade'
  )

  useEffect(() => {
    if (visible && !wasVisible.current) {
      setDraftDate(date)
      setDraftEnd(endDate)
      setDraftStart(startDate)
      setView('input')
    }
    wasVisible.current = visible
  }, [date, endDate, startDate, visible])
  useLayoutEffect(() => {
    if (!visible) return
    pageScroll.current = rememberPageScroll()
  }, [visible])
  useEffect(() => {
    if (visible) return
    setPresented(false)
  }, [visible])
  useEffect(() => {
    if (!visible) return
    return () => {
      pageScroll.current?.()
    }
  }, [view, visible])
  const focusField = useCallback(() => {
    setPresented(true)
  }, [])
  const dismiss = useCallback(() => {
    releaseFieldFocus()
    onDismiss()
  }, [onDismiss])
  const confirm = useCallback(() => {
    releaseFieldFocus()
    if (props.mode === 'single') {
      props.onConfirm({ date: draftDate })
      return
    }
    props.onConfirm({ endDate: draftEnd, startDate: draftStart })
  }, [draftDate, draftEnd, draftStart, props])
  const showCalendar = useCallback(() => {
    setView('calendar')
  }, [])
  const showInput = useCallback(() => {
    setView('input')
  }, [])
  const applyDraft = useCallback(
    (patch: {
      date?: CalendarDate
      endDate?: CalendarDate
      startDate?: CalendarDate
    }) => {
      if ('date' in patch) setDraftDate(patch.date)
      if ('startDate' in patch) setDraftStart(patch.startDate)
      if ('endDate' in patch) setDraftEnd(patch.endDate)
    },
    []
  )

  const width = dateInputCardWidth(windowWidth)
  const calendarHeight = Math.min(
    props.mode === 'single'
      ? datePickerSingleMaxHeight
      : datePickerRangeMaxHeight,
    Math.max(windowHeight - 32, 0)
  )

  return (
    <Modal
      animationType={animation}
      onRequestClose={dismiss}
      onShow={focusField}
      statusBarTranslucent
      supportedOrientations={supportedOrientations}
      transparent
      visible={visible}
    >
      <ModalScrim onDismiss={dismiss} />
      <View pointerEvents="box-none" style={styles.modalRoot}>
        <ElevatedCard
          style={[
            styles.card,
            { width },
            view === 'calendar'
              ? props.mode === 'single'
                ? { maxHeight: calendarHeight }
                : { height: calendarHeight }
              : { maxHeight: Math.min(dateInputMaxHeight, windowHeight - 32) },
          ]}
          testID="react-native-paper-dates-modal-input-surface"
        >
          {view === 'calendar' ? (
            <DatePickerModalContent
              disableSafeTop
              disableStatusBar
              disableWeekDays={disableWeekDays}
              endYear={resolvedEndYear}
              layout="card"
              locale={locale}
              onDismiss={dismiss}
              onRequestInput={showInput}
              saveLabel={saveLabel}
              saveLabelDisabled={saveLabelDisabled ?? false}
              startWeekOnMonday={startWeekOnMonday}
              startYear={resolvedStartYear}
              statusBarOnTopOfBackdrop
              uppercase={resolvedUppercase}
              validRange={validRange}
              {...(props.mode === 'single'
                ? {
                    date: draftDate,
                    mode: 'single' as const,
                    onChange: ({ date: nextDate }: { date: CalendarDate }) => {
                      setDraftDate(nextDate)
                    },
                    onConfirm: props.onConfirm,
                  }
                : {
                    endDate: draftEnd,
                    mode: 'range' as const,
                    onChange: ({
                      endDate: nextEnd,
                      startDate: nextStart,
                    }: {
                      endDate: CalendarDate
                      startDate: CalendarDate
                    }) => {
                      setDraftEnd(nextEnd)
                      setDraftStart(nextStart)
                    },
                    onConfirm: props.onConfirm,
                    startDate: draftStart,
                  })}
            />
          ) : (
            <DatePickerInputForm
              autoFocus={presented}
              calendarIcon={calendarIcon}
              date={draftDate}
              endDate={draftEnd}
              endLabel={endLabel}
              label={label}
              locale={locale}
              mode={mode}
              onChange={applyDraft}
              onConfirm={confirm}
              onDismiss={dismiss}
              onRequestCalendar={showCalendar}
              saveLabel={saveLabel}
              saveLabelDisabled={saveLabelDisabled}
              startDate={draftStart}
              startLabel={startLabel}
              uppercase={resolvedUppercase}
              validRange={validRange}
            />
          )}
        </ElevatedCard>
      </View>
    </Modal>
  )
}

function rememberPageScroll() {
  if (Platform.OS !== 'web' || typeof document === 'undefined') {
    return () => {}
  }
  const saved = Array.from(document.querySelectorAll('div'))
    .filter((node) => {
      const style = getComputedStyle(node)
      return (
        (style.overflowY === 'auto' || style.overflowY === 'scroll') &&
        node.scrollHeight > node.clientHeight + 1
      )
    })
    .map((node) => [node, node.scrollTop] as const)
  return () => {
    for (const [node, top] of saved) {
      if (Math.abs(node.scrollTop - top) > 1) node.scrollTop = top
    }
  }
}

const styles = StyleSheet.create({
  card: {
    maxWidth: dateInputCardMaxWidth,
  },
  modalRoot: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
})

export default memo(DatePickerModalInput)
