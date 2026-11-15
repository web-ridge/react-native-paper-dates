import type { ColorValue } from 'react-native'
import { useTheme } from 'react-native-paper'
import type {
  PossibleClockTypes,
  PossibleHourTypes,
  PossibleInputTypes,
  TimeChange,
} from './types'

const _12 = Math.PI / 30

const _30 = Math.PI / 6

const _90 = Math.PI / 2

const _360 = Math.PI * 2

export const circleSize = 256

export const periodSelectorGap = 12

export const periodSelectorVerticalWidth = 52

export const timeInputFieldHeight = 72

export const timeSelector24HourVerticalWidth = 114

export const timeSelectorHeight = 80

export const timeSelectorWidth = 96

export const timeSeparatorWidth = 24

const landscapeDialChrome = 132

const landscapeDialExtraWidth = 112

const portraitDialChrome = 248

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

export type ClockTypeMap = {
  [clockType in PossibleClockTypes]: PossibleClockTypes
}

export const clockTypes: ClockTypeMap = {
  hours: 'hours',
  minutes: 'minutes',
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

export function timeDialFits(width: number, height: number) {
  if (height >= circleSize + portraitDialChrome) {
    return true
  }
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
  return height < circleSize + portraitDialChrome && timeDialFits(width, height)
}

export function timeSelectorFieldWidth(
  inputType: PossibleInputTypes,
  is24Hour: boolean,
  landscape: boolean
) {
  if (inputType === inputTypes.picker && is24Hour && !landscape) {
    return timeSelector24HourVerticalWidth
  }
  return timeSelectorWidth
}

type HighlightColors = {
  backgroundColor: ColorValue
  color: ColorValue
}

export type HourTypeMap = {
  [hourType in PossibleHourTypes]: PossibleHourTypes
}

export const hourTypes: HourTypeMap = {
  am: 'am',
  pm: 'pm',
}

type InputIconMap = {
  [inputType in PossibleInputTypes]: string
}

export const inputTypeIcons: InputIconMap = {
  keyboard: 'keyboard-outline',
  picker: 'clock-outline',
}

export type InputTypeMap = {
  [inputType in PossibleInputTypes]: PossibleInputTypes
}

export const inputTypes: InputTypeMap = {
  keyboard: 'keyboard',
  picker: 'picker',
}

const outerHeight = 34

export type {
  PossibleClockTypes,
  PossibleHourTypes,
  PossibleInputTypes,
  TimeChange,
}

export const reverseInputTypes: InputTypeMap = {
  keyboard: 'picker',
  picker: 'keyboard',
}

export const getTimeInputTypeIcon = (
  inputType: PossibleInputTypes,
  inputIconMap?: InputIconMap
) => {
  return (
    inputIconMap?.[reverseInputTypes[inputType]] ||
    inputTypeIcons?.[reverseInputTypes[inputType]]
  )
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
  invalid = false
): HighlightColors {
  const theme = useTheme()
  if (invalid) {
    return {
      backgroundColor: theme.colors.errorContainer,
      color: highlighted ? theme.colors.error : theme.colors.onErrorContainer,
    }
  }
  const backgroundColor = highlighted
    ? theme.colors.primaryContainer
    : theme.colors.surfaceContainerHighest
  const color = highlighted
    ? theme.colors.onPrimaryContainer
    : theme.colors.onSurface

  return { backgroundColor, color }
}

export function useSwitchColors(highlighted: boolean): HighlightColors {
  const theme = useTheme()
  const backgroundColor = highlighted
    ? theme.colors.tertiaryContainer
    : 'transparent'
  const color = highlighted
    ? theme.colors.onTertiaryContainer
    : theme.colors.onSurfaceVariant

  return { backgroundColor, color }
}
