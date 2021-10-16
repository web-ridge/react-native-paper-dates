import * as React from 'react'
import Color from 'color'
import { useTheme } from 'react-native-paper'

// 250? when bigger?
export const circleSize = 215

export type PossibleHourTypes = 'am' | 'pm'
export type HourTypeMap = {
  [hourType in PossibleHourTypes]: PossibleHourTypes
}
export const hourTypes: HourTypeMap = {
  am: 'am',
  pm: 'pm',
}

export function getHourType(hours: number): PossibleHourTypes | undefined {
  if (hours >= 0 && hours <= 12) {
    return hourTypes.am
  }
  if (hours > 12 && hours <= 24) {
    return hourTypes.pm
  }
  return undefined
}

export type PossibleInputTypes = 'keyboard' | 'picker'
export type InputTypeMap = {
  [inputType in PossibleInputTypes]: PossibleInputTypes
}
export const inputTypes: InputTypeMap = {
  keyboard: 'keyboard',
  picker: 'picker',
}

export const reverseInputTypes: InputTypeMap = {
  keyboard: 'picker',
  picker: 'keyboard',
}
type InputIconMap = {
  [inputType in PossibleInputTypes]: string
}
export const inputTypeIcons: InputIconMap = {
  keyboard: 'keyboard-outline',
  picker: 'clock-outline',
}

export type PossibleClockTypes = 'hours' | 'minutes'
export type ClockTypeMap = {
  [clockType in PossibleClockTypes]: PossibleClockTypes
}
export const clockTypes: ClockTypeMap = {
  minutes: 'minutes',
  hours: 'hours',
}

// Code inspiration and copied from: https://github.com/ShaneGH/analogue-time-picker/blob/master/src/utils/angle.ts

const outerHeight = 34
const _30 = Math.PI / 6
const _12 = Math.PI / 30
const _360 = Math.PI * 2
const _90 = Math.PI / 2

/** Snap an angle to a given step. E.g. if angle = 22° and step = 10°, round down to 20° */
export function snap(angle: number, step: number) {
  let a = angle
  while (a < 0) a += _360
  let diff = a % step

  if (diff <= step / 2) {
    return angle - diff
  }

  return angle - diff + step
}

// detect am / pm based on offset
export function getHourTypeFromOffset(
  left: number,
  top: number,
  size: number
): PossibleHourTypes {
  const w = size / 2
  const x = w - left
  const y = size / 2 - top

  const distance = Math.sqrt(x * x + y * y)
  const maxPm = w - outerHeight

  return distance > maxPm ? hourTypes.am : hourTypes.pm
}

// Calculate the minute from the hand angle
export function getMinutes(handAngle: number) {
  handAngle = snap(handAngle, _12)

  let minute = parseInt((((handAngle - _90) % _360) / _12).toFixed(), 10)
  while (minute < 0) minute += 60
  while (minute >= 60) minute -= 60

  return minute
}

// Calculate the hour from the hand angle
export function getHours(
  handAngle: number,
  hourType: PossibleHourTypes | undefined
) {
  handAngle = snap(handAngle, _30)

  let hour = parseInt((((handAngle - _90) % _360) / _30).toFixed(), 10)
  if (hour < 0) hour += 12
  if (hour >= 12) hour -= 12

  if (hourType === hourTypes.am) {
    if (hour <= 0) {
      hour += 12
    } else if (hour >= 12) {
      hour -= 12
    }
  }
  if (hourType === hourTypes.pm) {
    if (hour <= 0) {
      hour += 12
    } else if (hour > 12) {
      hour -= 12
    }
  }

  return hour
}

/** Get the angle of the left/top co-ordinate from the center of the width.height box */
export function getAngle(left: number, top: number, size: number) {
  const x = size / 2 - left
  const y = size / 2 - top

  // tan O = y / x
  let angle = x ? Math.atan(y / x) : y < 0 ? -_90 : _90
  if (x < 0) {
    // reflect along vertical axis
    angle = -angle + 2 * (_90 + angle)
  }

  return angle
}

export function useSwitchColors(highlighted: boolean) {
  const theme = useTheme()
  const backgroundColor = React.useMemo<string>(() => {
    if (theme.dark) {
      if (highlighted) {
        return Color(theme.colors.primary).hex()
      }
      return theme.colors.backdrop
    }

    if (highlighted) {
      return Color(theme.colors.primary).lighten(1).hex()
    }
    return theme.colors.surface
  }, [highlighted, theme])

  const color = React.useMemo<string>(() => {
    if (highlighted && !theme.dark) {
      return theme.colors.primary
    }
    return theme.colors.placeholder
  }, [highlighted, theme])

  return { backgroundColor, color }
}

export function useInputColors(highlighted: boolean) {
  const theme = useTheme()
  const backgroundColor = React.useMemo<string>(() => {
    if (theme.dark) {
      if (highlighted) {
        return Color(theme.colors.primary).hex()
      }
      return Color(theme.colors.surface).lighten(1.2).hex()
    }

    if (highlighted) {
      return Color(theme.colors.primary).lighten(1).hex()
    }
    return Color(theme.colors.surface).darken(0.1).hex()
  }, [highlighted, theme])

  const color = React.useMemo<string>(() => {
    if (highlighted && !theme.dark) {
      return theme.colors.primary
    }
    return theme.colors.text
  }, [highlighted, theme])

  return { backgroundColor, color }
}

export function toHourInputFormat(hours: number, is24Hour: boolean): number {
  if (hours === 24) {
    return 0
  }
  if (is24Hour) {
    return hours
  }
  if (hours > 12) {
    return hours - 12
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
  if (previousHours > 12 && newHours < 12) {
    return newHours + 12
  }
  return newHours
}
