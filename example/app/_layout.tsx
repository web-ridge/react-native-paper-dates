import { Stack } from 'expo-router'

import { PaperProvider } from 'react-native-paper'
import React from 'react'

export default function RootLayout() {
  return (
    <PaperProvider>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
      </Stack>
    </PaperProvider>
  )
}
