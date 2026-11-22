import {
  memo,
  type Ref,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { Keyboard, Platform, StyleSheet, View } from 'react-native'
import {
  Button,
  Divider,
  IconButton,
  Text,
  type TextInputHandles,
  useTheme,
} from 'react-native-paper'

import { dateTimeFormat, formatDateRange } from '../shared/intl'
import { displayCase, themeColor } from '../shared/utils'
import { actionLabels, getTranslation } from '../translations/utils'
import DatePickerInputWithoutModal from './DatePickerInputWithoutModal'
import { areDatesOnSameDay, interpretTypedDate } from './dateUtils'
import {
  useInputFormat,
  useInputFormatter,
  useRangeChecker,
} from './inputFormat'
import type { CalendarDate, ValidRangeType } from './types'

type DatePickerInputFormChange = {
  date?: CalendarDate
  endDate?: CalendarDate
  startDate?: CalendarDate
}

export const dateInputCardMaxWidth = 328

export function dateInputCardWidth(windowWidth: number) {
  return Math.min(dateInputCardMaxWidth, Math.max(windowWidth - 16, 0))
}

function headlineFor({
  date,
  empty,
  endDate,
  format,
  formatRange,
  mode,
  startDate,
}: {
  date: CalendarDate
  empty: string
  endDate: CalendarDate
  format: (value: Date) => string
  formatRange: (start: Date, end: Date) => string
  mode: 'range' | 'single'
  startDate: CalendarDate
}) {
  if (mode === 'single') return date ? format(date) : empty
  if (startDate && endDate) return formatRange(startDate, endDate)
  if (startDate) return format(startDate)
  if (endDate) return format(endDate)
  return empty
}

function patchFor(
  mode: 'range' | 'single',
  inputMode: 'end' | 'start',
  next: CalendarDate
): DatePickerInputFormChange {
  if (mode === 'single') return { date: next }
  if (inputMode === 'end') return { endDate: next }
  return { startDate: next }
}

export function releaseFieldFocus() {
  if (Platform.OS === 'web') {
    const active = document.activeElement
    if (active instanceof HTMLElement) active.blur()
    return
  }
  Keyboard.dismiss()
}

function DatePickerInputForm({
  autoFocus = false,
  calendarIcon = 'calendar',
  date,
  endDate,
  endLabel,
  inputEnabled,
  label,
  locale,
  mode,
  onChange,
  onConfirm,
  onDismiss,
  onRequestCalendar,
  onValidityChange,
  placeholder,
  saveLabel,
  saveLabelDisabled,
  showActions = true,
  startDate,
  startLabel,
  uppercase = false,
  validRange,
  withDateFormatInLabel,
}: {
  autoFocus?: boolean
  calendarIcon?: string
  date?: CalendarDate
  endDate?: CalendarDate
  endLabel?: string
  inputEnabled?: boolean
  label?: string
  locale: string
  mode: 'range' | 'single'
  onChange: (patch: DatePickerInputFormChange) => void
  onConfirm: () => void
  onDismiss: () => void
  onRequestCalendar: () => void
  onValidityChange?: (valid: boolean) => void
  placeholder?: string
  saveLabel?: string
  saveLabelDisabled?: boolean
  showActions?: boolean
  startDate?: CalendarDate
  startLabel?: string
  uppercase?: boolean
  validRange?: ValidRangeType
  withDateFormatInLabel?: boolean
}) {
  const formatter = useInputFormatter({ locale })
  const inputFormat = useInputFormat({ formatter, locale })
  const { isDisabled, isWithinValidRange } = useRangeChecker(validRange)
  const theme = useTheme()

  const [invalid, setInvalid] = useState({ end: false, start: false })

  const endRef = useRef<TextInputHandles>(null)
  const fieldRef = useRef<TextInputHandles>(null)

  const actionColor = themeColor(theme.colors.primary)

  const { cancelLabel, confirmLabel } = actionLabels({
    locale,
    saveLabel,
    uppercase,
  })

  const endCaption = displayCase(
    endLabel ?? getTranslation(locale, 'endDate', 'End date'),
    uppercase
  )

  const headlineFormatter = useMemo(
    () =>
      dateTimeFormat(
        locale,
        mode === 'range'
          ? { day: 'numeric', month: 'short' }
          : { dateStyle: 'medium' }
      ),
    [locale, mode]
  )

  const resolvedPlaceholder = placeholder ?? inputFormat.toLowerCase()

  const sameDayRange =
    mode === 'range' &&
    !!startDate &&
    !!endDate &&
    areDatesOnSameDay(startDate, endDate)

  const fieldsValid =
    !invalid.start && !(mode === 'range' && invalid.end) && !sameDayRange

  const confirmDisabled = (saveLabelDisabled ?? false) || !fieldsValid

  const startCaption = displayCase(
    mode === 'range'
      ? (startLabel ?? getTranslation(locale, 'startDate', 'Start date'))
      : (label ?? 'Date'),
    uppercase
  )

  const headline = displayCase(
    headlineFor({
      date,
      empty:
        mode === 'range'
          ? `${startCaption} – ${endCaption}`
          : getTranslation(locale, 'enterDate', 'Enter date'),
      endDate,
      format: (value) => headlineFormatter.format(value),
      formatRange: (start, end) =>
        formatDateRange(locale, start, end, {
          day: 'numeric',
          month: 'short',
        }),
      mode,
      startDate,
    }),
    uppercase
  )

  const supporting = displayCase(
    mode === 'range'
      ? getTranslation(locale, 'enterDates', 'Enter dates')
      : getTranslation(locale, 'selectSingle', 'Select date'),
    uppercase
  )

  const surface = theme.colors.surfaceContainerHigh as string

  const applyText = useCallback(
    (text: string | undefined, inputMode: 'end' | 'start') => {
      const next = interpretTypedDate(text ?? '', inputFormat, inputMode, {
        isDisabled,
        isWithinValidRange,
      })
      setInvalid((current) => ({
        ...current,
        [inputMode]: next.issue !== undefined,
      }))
      if (next.issue) return
      onChange(patchFor(mode, inputMode, next.date))
    },
    [inputFormat, isDisabled, isWithinValidRange, mode, onChange]
  )

  const changeDate = useCallback(
    (inputMode: 'end' | 'start', next: CalendarDate) => {
      setInvalid((current) => ({ ...current, [inputMode]: false }))
      onChange(patchFor(mode, inputMode, next))
    },
    [mode, onChange]
  )

  const confirm = useCallback(() => {
    if (!fieldsValid) return
    releaseFieldFocus()
    onConfirm()
  }, [fieldsValid, onConfirm])

  const dismiss = useCallback(() => {
    releaseFieldFocus()
    onDismiss()
  }, [onDismiss])

  const requestCalendar = useCallback(() => {
    releaseFieldFocus()
    onRequestCalendar()
  }, [onRequestCalendar])

  const submitStart = useCallback(() => {
    endRef.current?.focus()
  }, [])

  useEffect(() => {
    if (!autoFocus) return
    fieldRef.current?.focus()
  }, [autoFocus])

  useEffect(() => {
    onValidityChange?.(fieldsValid)
  }, [fieldsValid, onValidityChange])

  return (
    <>
      <View style={styles.header}>
        <View style={styles.supporting}>
          <Text
            maxFontSizeMultiplier={1.5}
            style={[
              theme.fonts.labelLarge,
              styles.supportingText,
              { color: theme.colors.onSurfaceVariant },
            ]}
          >
            {supporting}
          </Text>
        </View>
        <View>
          <View style={styles.headlineRow}>
            <Text
              maxFontSizeMultiplier={1.5}
              numberOfLines={mode === 'range' ? 2 : 1}
              style={[
                mode === 'range'
                  ? theme.fonts.titleLarge
                  : theme.fonts.headlineLarge,
                styles.headline,
                mode === 'range' ? styles.rangeHeadline : styles.singleHeadline,
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
              onPress={requestCalendar}
              size={24}
              style={styles.iconButton}
              testID="react-native-paper-dates-modal-input-calendar"
            />
          </View>
          <Divider style={{ backgroundColor: theme.colors.outlineVariant }} />
        </View>
      </View>
      <View style={styles.fields}>
        <DateField
          inputEnabled={inputEnabled}
          inputMode="start"
          inputRef={fieldRef}
          label={startCaption}
          locale={locale}
          onChange={(next) => changeDate('start', next)}
          onChangeText={(text) => applyText(text, 'start')}
          onSubmitEditing={mode === 'range' ? submitStart : undefined}
          onValidationError={(error) =>
            setInvalid((current) => ({ ...current, start: !!error }))
          }
          placeholder={resolvedPlaceholder}
          returnKeyType={mode === 'range' ? 'next' : undefined}
          surface={surface}
          testID="react-native-paper-dates-modal-input"
          validRange={validRange}
          value={mode === 'single' ? date : startDate}
          withDateFormatInLabel={withDateFormatInLabel}
        />
        {mode === 'range' ? (
          <DateField
            inputEnabled={inputEnabled}
            inputMode="end"
            inputRef={endRef}
            label={endCaption}
            locale={locale}
            onChange={(next) => changeDate('end', next)}
            onChangeText={(text) => applyText(text, 'end')}
            onValidationError={(error) =>
              setInvalid((current) => ({ ...current, end: !!error }))
            }
            placeholder={resolvedPlaceholder}
            surface={surface}
            testID="react-native-paper-dates-modal-input-end"
            validRange={validRange}
            value={endDate}
            withDateFormatInLabel={withDateFormatInLabel}
          />
        ) : null}
      </View>
      {showActions ? (
        <View style={styles.actions}>
          <Button
            labelStyle={styles.actionLabel}
            mode="text"
            onPress={dismiss}
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
      ) : null}
    </>
  )
}

function DateField({
  inputEnabled,
  inputMode,
  inputRef,
  label,
  locale,
  onChange,
  onChangeText,
  onSubmitEditing,
  onValidationError,
  placeholder,
  returnKeyType,
  surface,
  testID,
  validRange,
  value,
  withDateFormatInLabel,
}: {
  inputEnabled?: boolean
  inputMode: 'end' | 'start'
  inputRef?: Ref<TextInputHandles>
  label: string
  locale: string
  onChange: (date: CalendarDate) => void
  onChangeText: (text: string | undefined) => void
  onSubmitEditing?: () => void
  onValidationError: (error: string | null) => void
  placeholder: string
  returnKeyType?: 'next'
  surface: string
  testID: string
  validRange?: ValidRangeType
  value: CalendarDate
  withDateFormatInLabel?: boolean
}) {
  return (
    <View style={styles.field}>
      <DatePickerInputWithoutModal
        ref={inputRef}
        aria-label={`${label}, ${placeholder}`}
        autoComplete="off"
        inputEnabled={inputEnabled}
        inputMode={inputMode}
        label={label}
        locale={locale}
        onChange={onChange}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmitEditing}
        onValidationError={onValidationError}
        placeholder={placeholder}
        returnKeyType={returnKeyType}
        supportingText=""
        testID={testID}
        theme={{ colors: { background: surface } }}
        validRange={validRange}
        value={value}
        variant="outlined"
        withDateFormatInLabel={withDateFormatInLabel}
      />
    </View>
  )
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
    paddingTop: 0,
  },
  field: {
    flex: 1,
    minWidth: 0,
  },
  fields: {
    flexDirection: 'row',
    gap: 12,
    paddingBottom: 8,
    paddingHorizontal: 24,
    paddingTop: 10,
  },
  header: {
    justifyContent: 'space-between',
    minHeight: 120,
  },
  headline: {
    flex: 1,
    includeFontPadding: false,
    marginRight: 12,
    minWidth: 0,
  },
  headlineRow: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingBottom: 10,
    paddingLeft: 24,
    paddingRight: 12,
  },
  iconButton: {
    height: 48,
    margin: 0,
    width: 48,
  },
  rangeHeadline: {
    lineHeight: 28,
  },
  singleHeadline: {
    lineHeight: 40,
  },
  supporting: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  supportingText: {
    includeFontPadding: false,
    lineHeight: 20,
  },
})

export default memo(DatePickerInputForm)
