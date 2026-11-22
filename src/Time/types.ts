export type PickerInputType = 'picker' | 'scroll'
export type PossibleClockTypes = 'hours' | 'minutes'
export type PossibleHourTypes = 'am' | 'pm'
export type PossibleInputTypes = 'keyboard' | 'picker' | 'scroll'

export type TimeChange = (params: {
  focused?: PossibleClockTypes
  hours: number
  minutes: number
}) => void
