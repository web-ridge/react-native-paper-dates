import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Modal,
  Platform,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native'
import { Button, Divider, IconButton, Text, useTheme } from 'react-native-paper'

import ModalScrim from '../shared/ModalScrim'
import { displayCase, supportedOrientations, themeColor } from '../shared/utils'
import { getTranslation, translate } from '../translations/utils'
import DatePickerInputWithoutModal from './DatePickerInputWithoutModal'
import DatePickerModalContent from './DatePickerModalContent'
import {
  defaultEndYear,
  defaultStartYear,
  parseLooseDate,
  useInputFormat,
  useInputFormatter,
  useRangeChecker,
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

const cardWidth = 360

function DatePickerModalInput(props: DatePickerModalInputProps) {
  const {
    calendarIcon = 'calendar',
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
  const [draftDate, setDraftDate] = useState<CalendarDate>(date)
  const [draftEnd, setDraftEnd] = useState<CalendarDate>(endDate)
  const [draftStart, setDraftStart] = useState<CalendarDate>(startDate)
  const [invalid, setInvalid] = useState({ end: false, start: false })
  const [view, setView] = useState<'calendar' | 'input'>('input')
  const wasVisible = useRef(false)
  const { isDisabled, isWithinValidRange } = useRangeChecker(validRange)
  const formatter = useInputFormatter({ locale })
  const inputFormat = useInputFormat({ formatter, locale })
  const headlineFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        dateStyle: 'medium',
      }),
    [locale]
  )
  const resolvedEndYear = endYear ?? defaultEndYear
  const resolvedStartYear = startYear ?? defaultStartYear
  const resolvedUppercase = !!uppercase

  useEffect(() => {
    if (visible && !wasVisible.current) {
      setDraftDate(date)
      setDraftEnd(endDate)
      setDraftStart(startDate)
      setInvalid({ end: false, start: false })
      setView('input')
    }
    wasVisible.current = visible
  }, [date, endDate, startDate, visible])
  const applyText = useCallback(
    (text: string | undefined, inputMode: 'end' | 'start') => {
      const next = readTypedDate(text ?? '', inputFormat, inputMode, {
        isDisabled,
        isWithinValidRange,
      })
      setInvalid((current) => ({
        ...current,
        [inputMode]: next.invalid,
      }))
      if (next.invalid) return
      if (mode === 'single') {
        setDraftDate(next.date)
        return
      }
      if (inputMode === 'end') setDraftEnd(next.date)
      else setDraftStart(next.date)
    },
    [inputFormat, isDisabled, isWithinValidRange, mode]
  )
  const confirm = useCallback(() => {
    if (invalid.start || (props.mode === 'range' && invalid.end)) return
    if (props.mode === 'single') {
      props.onConfirm({ date: draftDate })
      return
    }
    props.onConfirm({ endDate: draftEnd, startDate: draftStart })
  }, [draftDate, draftEnd, draftStart, invalid.end, invalid.start, props])
  const showCalendar = useCallback(() => {
    setInvalid({ end: false, start: false })
    setView('calendar')
  }, [])
  const showInput = useCallback(() => {
    setView('input')
  }, [])

  const width = Math.min(cardWidth, Math.max(windowWidth - 16, 0))
  const calendarHeight = Math.min(568, Math.max(windowHeight - 32, 0))
  const actionColor = themeColor(theme.colors.primary)
  const confirmDisabled =
    (saveLabelDisabled ?? false) ||
    invalid.start ||
    (mode === 'range' && invalid.end)
  const confirmLabel = displayCase(
    saveLabel || translate(locale, 'confirm', 'OK'),
    resolvedUppercase
  )
  const cancelLabel = displayCase(
    translate(locale, 'cancel', 'Cancel'),
    resolvedUppercase
  )
  const supporting = displayCase(
    translate(locale, 'selectSingle', 'Select date'),
    resolvedUppercase
  )
  const headline = displayCase(
    headlineFor({
      date: draftDate,
      empty:
        mode === 'range'
          ? translate(locale, 'enterDates', 'Enter dates')
          : translate(locale, 'enterDate', 'Enter date'),
      endDate: draftEnd,
      format: (value) => headlineFormatter.format(value),
      mode,
      startDate: draftStart,
    }),
    resolvedUppercase
  )
  const placeholder = inputFormat.toLowerCase()
  const surface = theme.colors.elevation.level3

  return (
    <Modal
      animationType={Platform.select({ default: 'slide', web: 'none' })}
      onRequestClose={onDismiss}
      statusBarTranslucent
      supportedOrientations={supportedOrientations}
      transparent
      visible={visible}
    >
      <ModalScrim onDismiss={onDismiss} />
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
                  setInvalid({ end: false, start: false })
                }}
                onConfirm={props.onConfirm}
                onDismiss={onDismiss}
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
                  setInvalid({ end: false, start: false })
                }}
                onConfirm={props.onConfirm}
                onDismiss={onDismiss}
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
            <>
              <View style={styles.header}>
                <Text
                  maxFontSizeMultiplier={1.5}
                  style={[
                    theme.fonts.labelLarge,
                    styles.supporting,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  {supporting}
                </Text>
                <View style={styles.headlineRow}>
                  <Text
                    maxFontSizeMultiplier={1.5}
                    numberOfLines={1}
                    style={[
                      theme.fonts.headlineLarge,
                      styles.headline,
                      { color: theme.colors.onSurfaceVariant },
                    ]}
                  >
                    {headline}
                  </Text>
                  <IconButton
                    accessibilityLabel={getTranslation(
                      locale,
                      'pickDateFromCalendar'
                    )}
                    icon={calendarIcon}
                    iconColor={themeColor(theme.colors.onSurfaceVariant)}
                    onPress={showCalendar}
                    size={24}
                    style={styles.iconButton}
                    testID="react-native-paper-dates-modal-input-calendar"
                  />
                </View>
              </View>
              <Divider
                style={{ backgroundColor: theme.colors.outlineVariant }}
              />
              <View style={styles.fields}>
                <ModalDateField
                  autoFocus={visible}
                  inputMode="start"
                  label={displayCase(
                    mode === 'range'
                      ? (startLabel ?? 'Date')
                      : (label ?? 'Date'),
                    resolvedUppercase
                  )}
                  locale={locale}
                  onChange={(next) => {
                    setInvalid((current) => ({ ...current, start: false }))
                    if (mode === 'single') setDraftDate(next)
                    else setDraftStart(next)
                  }}
                  onChangeText={(text) => applyText(text, 'start')}
                  onValidationError={(error) =>
                    setInvalid((current) => ({ ...current, start: !!error }))
                  }
                  placeholder={placeholder}
                  surface={surface}
                  testID="react-native-paper-dates-modal-input"
                  validRange={validRange}
                  value={mode === 'single' ? draftDate : draftStart}
                />
                {mode === 'range' ? (
                  <ModalDateField
                    inputMode="end"
                    label={displayCase(
                      endLabel ?? 'End date',
                      resolvedUppercase
                    )}
                    locale={locale}
                    onChange={(next) => {
                      setInvalid((current) => ({ ...current, end: false }))
                      setDraftEnd(next)
                    }}
                    onChangeText={(text) => applyText(text, 'end')}
                    onValidationError={(error) =>
                      setInvalid((current) => ({ ...current, end: !!error }))
                    }
                    placeholder={placeholder}
                    surface={surface}
                    testID="react-native-paper-dates-modal-input-end"
                    validRange={validRange}
                    value={draftEnd}
                  />
                ) : null}
              </View>
              <View style={styles.actions}>
                <Button
                  labelStyle={styles.actionLabel}
                  mode="text"
                  onPress={onDismiss}
                  style={styles.action}
                  testID="react-native-paper-dates-modal-input-cancel"
                  textColor={actionColor}
                >
                  {cancelLabel}
                </Button>
                <Button
                  disabled={confirmDisabled}
                  labelStyle={styles.actionLabel}
                  mode="text"
                  onPress={confirm}
                  style={styles.action}
                  testID="react-native-paper-dates-modal-input-confirm"
                  textColor={actionColor}
                >
                  {confirmLabel}
                </Button>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  )
}

function headlineFor({
  date,
  empty,
  endDate,
  format,
  mode,
  startDate,
}: {
  date: CalendarDate
  empty: string
  endDate: CalendarDate
  format: (value: Date) => string
  mode: 'range' | 'single'
  startDate: CalendarDate
}) {
  if (mode === 'single') return date ? format(date) : empty
  if (startDate && endDate) return `${format(startDate)} – ${format(endDate)}`
  if (startDate) return format(startDate)
  if (endDate) return format(endDate)
  return empty
}

function ModalDateField({
  autoFocus,
  inputMode,
  label,
  locale,
  onChange,
  onChangeText,
  onValidationError,
  placeholder,
  surface,
  testID,
  validRange,
  value,
}: {
  autoFocus?: boolean
  inputMode: 'end' | 'start'
  label: string
  locale: string
  onChange: (date: Date | undefined) => void
  onChangeText: (text: string | undefined) => void
  onValidationError: (error: string | null) => void
  placeholder: string
  surface: string
  testID: string
  validRange?: ValidRangeType
  value: CalendarDate
}) {
  return (
    <View style={styles.field}>
      <DatePickerInputWithoutModal
        autoComplete="off"
        autoFocus={autoFocus}
        inputMode={inputMode}
        label={label}
        locale={locale}
        onChange={onChange}
        onChangeText={onChangeText}
        onValidationError={onValidationError}
        placeholder={placeholder}
        supportingText=""
        testID={testID}
        theme={{ colors: { background: surface } }}
        validRange={validRange}
        value={value}
        variant="outlined"
      />
    </View>
  )
}

function readTypedDate(
  text: string,
  inputFormat: string,
  inputMode: 'end' | 'start',
  check: {
    isDisabled: (day: Date) => boolean
    isWithinValidRange: (day: Date) => boolean
  }
) {
  const trimmed = text.trim()
  if (!trimmed) return { date: undefined, invalid: false }
  const parsed = parseLooseDate(trimmed, inputFormat)
  if (!parsed) return { date: undefined, invalid: true }
  const { day, month, year } = parsed
  const date =
    inputMode === 'end'
      ? new Date(year, month - 1, day, 23, 59, 59)
      : new Date(year, month - 1, day)
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day ||
    check.isDisabled(date) ||
    !check.isWithinValidRange(date)
  ) {
    return { date: undefined, invalid: true }
  }
  return { date, invalid: false }
}

const styles = StyleSheet.create({
  action: {
    height: 40,
    margin: 0,
    minHeight: 40,
  },
  actionLabel: {
    marginVertical: 0,
  },
  actions: {
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'flex-end',
    paddingBottom: 12,
    paddingRight: 16,
    paddingTop: 12,
  },
  card: {
    borderRadius: 28,
    elevation: 3,
    maxWidth: cardWidth,
    overflow: 'hidden',
  },
  field: {
    flex: 1,
  },
  fields: {
    flexDirection: 'row',
    gap: 12,
    paddingBottom: 16,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  header: {
    paddingBottom: 12,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  headline: {
    flex: 1,
    includeFontPadding: false,
    lineHeight: 40,
    marginRight: 36,
  },
  headlineRow: {
    alignItems: 'center',
    flexDirection: 'row',
    height: 40,
    marginTop: 32,
  },
  iconButton: {
    height: 48,
    margin: 0,
    position: 'absolute',
    right: -12,
    top: -4,
    width: 48,
  },
  modalRoot: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  supporting: {
    includeFontPadding: false,
    lineHeight: 20,
  },
})

export default memo(DatePickerModalInput)
