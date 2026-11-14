export type PossibleClockTypes = 'hours' | 'minutes'

export type PossibleHourTypes = 'am' | 'pm'

export type PossibleInputTypes = 'keyboard' | 'picker'

export type TimeChange = (params: {
  focused?: PossibleClockTypes
  hours: number
  minutes: number
}) => void
