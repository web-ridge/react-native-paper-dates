import type { ColorValue } from 'react-native'
import { useTheme } from 'react-native-paper'

import { dateTimeFormat } from '../shared/intl'
import { withAlpha } from '../shared/utils'

import type {
  PickerInputType,
  PossibleClockTypes,
  PossibleHourTypes,
  PossibleInputTypes,
  TimeChange,
} from './types'

export type ClockTypeMap = {
  [clockType in PossibleClockTypes]: PossibleClockTypes
}
type HighlightColors = {
  backgroundColor: ColorValue
  borderColor: ColorValue
  color: ColorValue
}
export type HourTypeMap = {
  [hourType in PossibleHourTypes]: PossibleHourTypes
}
type InputIconMap = {
  [inputType in PossibleInputTypes]: string
}
export type InputTypeMap = {
  [inputType in PossibleInputTypes]: PossibleInputTypes
}
export type {
  PickerInputType,
  PossibleClockTypes,
  PossibleHourTypes,
  PossibleInputTypes,
  TimeChange,
}

const _12 = Math.PI / 30
const _30 = Math.PI / 6
const _90 = Math.PI / 2
const _360 = Math.PI * 2
export const circleSize = 256
export const disabledContainerOpacity = 0.12
export const disabledContentOpacity = 0.38
export const clockSideInset = 12
export const timePickerActionsGap = 8
export const timePickerHorizontalPadding = 24
export const timePickerMediumBreakpoint = 600
export const timePickerPadding = 12
export const clockTypes: ClockTypeMap = {
  hours: 'hours',
  minutes: 'minutes',
}
export const hourTypes: HourTypeMap = {
  am: 'am',
  pm: 'pm',
}
export const inputTypeIcons: InputIconMap = {
  keyboard: 'keyboard',
  picker: 'clock',
  scroll: 'gesture-swipe-vertical',
}
export const inputTypes = {
  keyboard: 'keyboard',
  picker: 'picker',
  scroll: 'scroll',
} as const satisfies InputTypeMap
const landscapeDialChrome = 132
const landscapeDialExtraWidth = 100
const outerHeight = 34
export const periodSelectorGap = 8
export const periodSelectorVerticalWidth = 56
const portraitDialChrome = 216
export const scrollFieldHeight = 140
export const scrollFieldWidth = 100
export const scrollItemHeight = 46
export const timeInputFieldHeight = 120
export const timeSelectorHeight = 120
export const timeSelectorWidth = 100
export const focusRingOffset = 2
export const focusRingThickness = 3
export const timeColonSize = 8
const colonClearance = 2
const focusRingReach = focusRingOffset + focusRingThickness
export const timeSeparatorWidth =
  focusRingReach +
  colonClearance +
  timeColonSize +
  colonClearance +
  focusRingReach
export const horizontalPeriodGap = 16
export const verticalDial24HourFieldWidth = 132

export function clockNumbers(
  count: number,
  radiusRatio: number,
  size: number,
  startAngle: number
) {
  let angle = startAngle
  const radius = size / radiusRatio
  const step = (2 * Math.PI) / count
  return Array.from({ length: count }, () => {
    const point = [
      Math.round(size / 2 + radius * Math.cos(angle)),
      Math.round(size / 2 + radius * Math.sin(angle)),
    ]
    angle += step
    return point
  })
}

export function getAngle(left: number, top: number, size: number) {
  const x = size / 2 - left
  const y = size / 2 - top

  let angle = x ? Math.atan(y / x) : y < 0 ? -_90 : _90
  if (x < 0) {
    angle = -angle + 2 * (_90 + angle)
  }

  return angle
}

export function getHours(
  handAngle: number,
  hourType: PossibleHourTypes | undefined
) {
  handAngle = snap(handAngle, _30)

  let hour = parseInt((((handAngle - _90) % _360) / _30).toFixed(), 10)
  if (hour < 0) hour += 12
  if (hour >= 12) hour -= 12

  if (hourType === hourTypes.am || hourType === hourTypes.pm) {
    if (hour <= 0) {
      hour += 12
    }
  }

  return hour
}

export function getHourType(hours: number): PossibleHourTypes | undefined {
  if (hours >= 0 && hours < 12) {
    return hourTypes.am
  }
  if (hours >= 12 && hours < 24) {
    return hourTypes.pm
  }
  return undefined
}

export function getHourTypeFromOffset(
  left: number,
  top: number,
  size: number
): PossibleHourTypes {
  const w = size / 2
  const maxPm = w - outerHeight
  const x = w - left
  const y = size / 2 - top
  const distance = Math.sqrt(x * x + y * y)

  return distance > maxPm ? hourTypes.am : hourTypes.pm
}

export function getMinutes(handAngle: number) {
  handAngle = snap(handAngle, _12)

  let minute = parseInt((((handAngle - _90) % _360) / _12).toFixed(), 10)
  while (minute < 0) minute += 60
  while (minute >= 60) minute -= 60

  return minute
}

export function getTimeInputTypeIcon(
  inputType: PossibleInputTypes,
  inputIconMap?: Partial<InputIconMap>,
  pickerMode: PickerInputType = inputTypes.picker
) {
  const next = toggleInputType(inputType, pickerMode)
  if (!next) return undefined
  return inputIconMap?.[next] || inputTypeIcons[next]
}

export function toggleInputType(
  inputType: PossibleInputTypes,
  pickerMode: PickerInputType
): PossibleInputTypes | undefined {
  if (inputType === inputTypes.keyboard) return pickerMode
  if (inputType === inputTypes.picker || inputType === inputTypes.scroll) {
    return inputTypes.keyboard
  }
  return undefined
}

export function isValidHourInput(hours: number, is24Hour: boolean) {
  if (!Number.isFinite(hours) || hours < 0) {
    return false
  }
  if (is24Hour) {
    return hours <= 23
  }
  return hours >= 1 && hours <= 12
}

export function isValidMinuteInput(minutes: number) {
  return Number.isFinite(minutes) && minutes >= 0 && minutes <= 59
}

export function snap(angle: number, step: number) {
  let a = angle
  while (a < 0) a += _360
  let diff = a % step

  if (diff <= step / 2) {
    return angle - diff
  }

  return angle - diff + step
}

export function timeDialFits(width: number, height: number) {
  if (height >= circleSize + portraitDialChrome) {
    return true
  }
  return horizontalDialFits(width, height)
}

export function horizontalDialFits(width: number, height: number) {
  return (
    height >= circleSize + landscapeDialChrome &&
    width >=
      timeSelectorWidth * 2 +
        timeSeparatorWidth +
        circleSize +
        landscapeDialExtraWidth
  )
}

export function timePickerUsesLandscape(
  width: number,
  height: number,
  inputType: PossibleInputTypes
) {
  if (width > height) {
    return true
  }
  if (inputType !== inputTypes.picker) {
    return false
  }
  return (
    width >= timePickerMediumBreakpoint && horizontalDialFits(width, height)
  )
}

export function resolve24HourClock(
  use24HourClock: boolean | undefined,
  locale?: string
) {
  if (use24HourClock !== undefined) {
    return use24HourClock
  }
  return dateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
  })
    .format(new Date(Date.UTC(2020, 1, 1, 23)))
    .includes('23')
}

export function timePickerModalMinWidth(is24Hour: boolean, showsDial: boolean) {
  const fieldWidth = timeSelectorFieldWidth(
    showsDial ? inputTypes.picker : inputTypes.keyboard,
    is24Hour,
    false
  )
  const fieldRow =
    fieldWidth * 2 +
    timeSeparatorWidth +
    (is24Hour ? 0 : periodSelectorGap + periodSelectorVerticalWidth)
  const dialRow = showsDial ? circleSize + clockSideInset * 2 : 0
  return Math.max(fieldRow, dialRow) + timePickerPadding * 2
}

export function timeSelectorFieldWidth(
  inputType: PossibleInputTypes,
  is24Hour: boolean,
  landscape: boolean
) {
  if (inputType === inputTypes.picker && is24Hour && !landscape) {
    return verticalDial24HourFieldWidth
  }
  return timeSelectorWidth
}

export function toHourInputFormat(hours: number, is24Hour: boolean): number {
  if (is24Hour) {
    if (hours === 24) {
      return 0
    }
    return hours
  }
  if (hours > 12) {
    return hours - 12
  }
  if (hours === 0) {
    return hours + 12
  }
  return hours
}

export function toHourOutputFormat(
  newHours: number,
  previousHours: number,
  is24Hour: boolean
): number {
  if (is24Hour) {
    return newHours
  }
  if (previousHours === 0 && newHours !== 0) {
    return newHours - 12 < 0 ? newHours : newHours - 12
  }
  if (previousHours >= 12 && newHours < 12) {
    return newHours + 12
  }
  return newHours
}

export function useInputColors(
  highlighted: boolean,
  invalid = false,
  disabled = false
): HighlightColors {
  const theme = useTheme()
  if (disabled) {
    const content = withAlpha(theme.colors.onSurface, disabledContentOpacity)
    return {
      backgroundColor: theme.colors.surfaceContainerLowest,
      borderColor: content,
      color: content,
    }
  }
  if (invalid) {
    return {
      backgroundColor: theme.colors.errorContainer,
      borderColor: theme.colors.error,
      color: highlighted ? theme.colors.error : theme.colors.onErrorContainer,
    }
  }

  return {
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderColor: highlighted ? theme.colors.primary : 'transparent',
    color: highlighted
      ? theme.colors.onPrimaryContainer
      : theme.colors.onSurface,
  }
}

export function useSwitchColors(
  highlighted: boolean,
  disabled = false
): HighlightColors {
  const theme = useTheme()
  if (disabled) {
    return {
      backgroundColor: highlighted
        ? withAlpha(theme.colors.onSurface, disabledContainerOpacity)
        : theme.colors.surfaceContainerLowest,
      borderColor: 'transparent',
      color: withAlpha(theme.colors.onSurface, disabledContentOpacity),
    }
  }
  const backgroundColor = highlighted
    ? theme.colors.primaryContainer
    : theme.colors.surfaceContainerLowest
  const color = highlighted
    ? theme.colors.onPrimaryContainer
    : theme.colors.onSurfaceVariant

  return { backgroundColor, borderColor: 'transparent', color }
}
