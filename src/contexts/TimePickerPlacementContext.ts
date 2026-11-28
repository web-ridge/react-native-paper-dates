import { createContext } from 'react'

type TimePickerPlacement = 'inline' | 'modal'

export const TimePickerPlacementContext =
  createContext<TimePickerPlacement>('inline')
