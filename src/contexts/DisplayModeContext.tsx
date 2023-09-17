import * as React from 'react'

export const DisplayModeContext = React.createContext<{
  mode: 'AM' | 'PM' | undefined
  setMode: React.Dispatch<React.SetStateAction<'AM' | 'PM' | undefined>>
}>({ mode: 'AM', setMode: () => {} })
