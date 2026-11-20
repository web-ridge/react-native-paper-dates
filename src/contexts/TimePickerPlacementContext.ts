import { createContext } from 'react'

// Where the time picker sits. The modal dialog uses the larger M3 modal
// period selector; inline pickers keep the compact one.
export type TimePickerPlacement = 'inline' | 'modal'

export const TimePickerPlacementContext =
  createContext<TimePickerPlacement>('inline')
