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
import { useTheme } from 'react-native-paper'

import ModalScrim from '../shared/ModalScrim'
import { supportedOrientations } from '../shared/utils'
import DatePickerInputForm, {
  dateInputCardMaxWidth,
  dateInputCardWidth,
  releaseFieldFocus,
} from './DatePickerInputForm'
import DatePickerModalContent from './DatePickerModalContent'
import {
  datePickerCardMaxHeight,
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
export type DatePickerModalInputRangeProps = DatePickerModalInputSharedProps & {
  endDate?: CalendarDate
  mode: 'range'
  onConfirm: RangeChange
  startDate?: CalendarDate
}
type DatePickerModalInputSharedProps = {
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
export type DatePickerModalInputSingleProps =
  DatePickerModalInputSharedProps & {
    date?: CalendarDate
    mode: 'single'
    onConfirm: SingleChange
  }

function DatePickerModalInput(props: DatePickerModalInputProps) {
  const {
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
  const theme = useTheme()
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
    datePickerCardMaxHeight,
    Math.max(windowHeight - 32, 0)
  )
  const surface = theme.colors.elevation.level3

  return (
    <Modal
      animationType={Platform.select({ default: 'slide', web: 'none' })}
      onRequestClose={dismiss}
      onShow={focusField}
      statusBarTranslucent
      supportedOrientations={supportedOrientations}
      transparent
      visible={visible}
    >
      <ModalScrim onDismiss={dismiss} />
      <View pointerEvents="box-none" style={styles.modalRoot}>
        <View
          style={[
            styles.card,
            {
              backgroundColor: surface,
              width,
            },
            view === 'calendar' ? { height: calendarHeight } : null,
          ]}
          testID="react-native-paper-dates-modal-input-surface"
        >
          {view === 'calendar' ? (
            props.mode === 'single' ? (
              <DatePickerModalContent
                date={draftDate}
                disableSafeTop
                disableStatusBar
                disableWeekDays={disableWeekDays}
                endYear={resolvedEndYear}
                layout="card"
                locale={locale}
                mode="single"
                onChange={({ date: nextDate }) => {
                  setDraftDate(nextDate)
                }}
                onConfirm={props.onConfirm}
                onDismiss={dismiss}
                onRequestInput={showInput}
                saveLabel={saveLabel}
                saveLabelDisabled={saveLabelDisabled ?? false}
                startWeekOnMonday={startWeekOnMonday}
                startYear={resolvedStartYear}
                statusBarOnTopOfBackdrop
                uppercase={resolvedUppercase}
                validRange={validRange}
              />
            ) : (
              <DatePickerModalContent
                disableSafeTop
                disableStatusBar
                disableWeekDays={disableWeekDays}
                endDate={draftEnd}
                endYear={resolvedEndYear}
                layout="card"
                locale={locale}
                mode="range"
                onChange={({ endDate: nextEnd, startDate: nextStart }) => {
                  setDraftEnd(nextEnd)
                  setDraftStart(nextStart)
                }}
                onConfirm={props.onConfirm}
                onDismiss={dismiss}
                onRequestInput={showInput}
                saveLabel={saveLabel}
                saveLabelDisabled={saveLabelDisabled ?? false}
                startDate={draftStart}
                startWeekOnMonday={startWeekOnMonday}
                startYear={resolvedStartYear}
                statusBarOnTopOfBackdrop
                uppercase={resolvedUppercase}
                validRange={validRange}
              />
            )
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
        </View>
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
    borderRadius: 28,
    elevation: 3,
    maxWidth: dateInputCardMaxWidth,
    overflow: 'hidden',
  },
  modalRoot: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
})

export default memo(DatePickerModalInput)
