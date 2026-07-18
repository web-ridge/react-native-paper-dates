import { useCallback, useState, type ReactNode } from 'react'
import { Text, View } from 'react-native'
import { useTheme } from 'react-native-paper'
import {
  Calendar,
  TimePicker,
  DatePickerInput,
} from 'react-native-paper-dates'
import DatePickerModalContentHeader from '../../../src/Date/DatePickerModalContentHeader'
import DatePickerModalHeaderBackground from '../../../src/Date/DatePickerModalHeaderBackground'

import { PaperRoot } from './PaperRoot'

const LOCALE = 'en'
/** Enough for month header + day names + up to 6 weeks at daySize 46. */
const CALENDAR_HEIGHT = 400

function today() {
  const d = new Date()
  d.setHours(12, 0, 0, 0)
  return d
}

function daysFromNow(offset: number) {
  const d = today()
  d.setDate(d.getDate() + offset)
  return d
}

type SharedProps = {
  compact?: boolean
  className?: string
}

function DateSurface({ children }: { children: ReactNode }) {
  const theme = useTheme()
  return (
    <View
      style={{
        backgroundColor: theme.colors.surface,
        overflow: 'hidden',
        width: '100%',
      }}
    >
      {children}
    </View>
  )
}

/**
 * Docs previews omit the modal dismiss/save app bar (X + OK).
 * Compose content header + Calendar with a fixed height for AutoSizer.
 */
function VerticalDateDemo({
  compact,
  className,
  label,
  mode,
  state,
  onChange,
}: SharedProps & {
  label: string
  mode: 'single' | 'range' | 'multiple'
  state: {
    startDate?: Date
    endDate?: Date
    date?: Date
    dates?: Date[]
  }
  onChange: (params: any) => void
}) {
  return (
    <PaperRoot
      compact={compact}
      className={['pd-demo--date', className].filter(Boolean).join(' ')}
    >
      <DateSurface>
        <DatePickerModalHeaderBackground>
          <DatePickerModalContentHeader
            state={{
              startDate: state.startDate,
              endDate: state.endDate,
              date: state.date,
              dates: state.dates,
            }}
            mode={mode}
            collapsed
            onToggle={() => undefined}
            label={label}
            uppercase={false}
            locale={LOCALE}
            allowEditing={false}
          />
        </DatePickerModalHeaderBackground>
        <View style={{ height: CALENDAR_HEIGHT, width: '100%' }}>
          {mode === 'single' ? (
            <Calendar
              locale={LOCALE}
              mode="single"
              date={state.date}
              onChange={onChange}
            />
          ) : mode === 'range' ? (
            <Calendar
              locale={LOCALE}
              mode="range"
              startDate={state.startDate}
              endDate={state.endDate}
              onChange={onChange}
            />
          ) : (
            <Calendar
              locale={LOCALE}
              mode="multiple"
              dates={state.dates}
              onChange={onChange}
            />
          )}
        </View>
      </DateSurface>
    </PaperRoot>
  )
}

export function SingleDateDemo({ compact, className }: SharedProps) {
  const [date, setDate] = useState<Date | undefined>(daysFromNow(2))

  return (
    <VerticalDateDemo
      compact={compact}
      className={className}
      label="Select date"
      mode="single"
      state={{ date }}
      onChange={({ date: next }: { date?: Date }) => setDate(next)}
    />
  )
}

export function RangeDateDemo({ compact, className }: SharedProps) {
  const [range, setRange] = useState<{
    startDate: Date | undefined
    endDate: Date | undefined
  }>({
    startDate: daysFromNow(1),
    endDate: daysFromNow(5),
  })

  return (
    <VerticalDateDemo
      compact={compact}
      className={className}
      label="Select range"
      mode="range"
      state={range}
      onChange={setRange}
    />
  )
}

export function MultipleDatesDemo({ compact, className }: SharedProps) {
  const [dates, setDates] = useState<Date[] | undefined>([
    daysFromNow(1),
    daysFromNow(3),
    daysFromNow(8),
  ])

  return (
    <VerticalDateDemo
      compact={compact}
      className={className}
      label="Select dates"
      mode="multiple"
      state={{ dates }}
      onChange={({ dates: next }: { dates: Date[] }) => setDates(next ?? [])}
    />
  )
}

export function InputDateDemo({ compact, className }: SharedProps) {
  const [value, setValue] = useState<Date | undefined>(daysFromNow(10))

  return (
    <PaperRoot
      compact={compact}
      className={['pd-demo--input', className].filter(Boolean).join(' ')}
    >
      <DatePickerInput
        locale={LOCALE}
        label="Birthdate"
        value={value}
        onChange={setValue}
        inputMode="start"
      />
    </PaperRoot>
  )
}

function TimePickerInner() {
  const theme = useTheme()
  const [hours, setHours] = useState(6)
  const [minutes, setMinutes] = useState(30)
  const [focused, setFocused] = useState<'hours' | 'minutes'>('hours')

  const onChange = useCallback(
    (params: {
      hours: number
      minutes: number
      focused?: 'hours' | 'minutes'
    }) => {
      setHours(params.hours)
      setMinutes(params.minutes)
      if (params.focused) setFocused(params.focused)
    },
    []
  )

  return (
    <View
      style={{
        backgroundColor: theme.dark
          ? theme.colors.elevation.level3
          : theme.colors.surface,
        width: '100%',
      }}
    >
      <Text
        style={{
          paddingTop: 16,
          paddingHorizontal: 24,
          fontSize: 12,
          fontWeight: '500',
          letterSpacing: 0.5,
          color: theme.colors.onSurfaceVariant,
        }}
      >
        Select time
      </Text>
      <View style={{ paddingHorizontal: 24, paddingTop: 8 }}>
        <TimePicker
          locale={LOCALE}
          inputType="picker"
          focused={focused}
          hours={hours}
          minutes={minutes}
          onChange={onChange}
          onFocusInput={setFocused}
        />
      </View>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'flex-end',
          gap: 8,
          paddingHorizontal: 16,
          paddingBottom: 16,
          paddingTop: 8,
        }}
      >
        <Text
          style={{
            color: theme.colors.primary,
            fontWeight: '500',
            padding: 10,
          }}
        >
          Cancel
        </Text>
        <Text
          style={{
            color: theme.colors.primary,
            fontWeight: '500',
            padding: 10,
          }}
        >
          OK
        </Text>
      </View>
    </View>
  )
}

export function TimePickerDemo({ compact, className }: SharedProps) {
  return (
    <PaperRoot
      compact={compact}
      className={['pd-demo--time', className].filter(Boolean).join(' ')}
    >
      <TimePickerInner />
    </PaperRoot>
  )
}
