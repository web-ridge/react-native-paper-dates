import { StatusBar } from 'expo-status-bar'
import { useState } from 'react'
import { Provider as PaperProvider } from 'react-native-paper'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import Example from './Example'
import { darkTheme, lightTheme, useWebColorScheme } from './site'

export default function App() {
  const [dark, setDark] = useState(true)
  useWebColorScheme(dark)

  return (
    <SafeAreaProvider>
      <PaperProvider theme={dark ? darkTheme : lightTheme}>
        <StatusBar style={dark ? 'light' : 'dark'} />
        <Example onToggleTheme={() => setDark((value) => !value)} />
      </PaperProvider>
    </SafeAreaProvider>
  )
}
