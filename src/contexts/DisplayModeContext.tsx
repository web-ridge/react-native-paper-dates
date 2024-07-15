import { createContext, Dispatch, SetStateAction } from 'react'

export const DisplayModeContext = createContext<{
  mode: 'AM' | 'PM' | undefined
  setMode: Dispatch<SetStateAction<'AM' | 'PM' | undefined>>
}>({ mode: 'AM', setMode: () => {} })
