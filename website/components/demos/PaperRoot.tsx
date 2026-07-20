import { useEffect, useState, type ReactNode } from 'react'
import { View } from 'react-native'
import {
  MD3DarkTheme,
  MD3LightTheme,
  Provider as PaperProvider,
  type MD3Theme,
} from 'react-native-paper'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { en, registerTranslation } from 'react-native-paper-dates'
import iconFont from '@react-native-vector-icons/material-design-icons/fonts/MaterialDesignIcons.ttf'

import './demos.css'

registerTranslation('en', en)

const ICON_FONT_ID = 'pd-mdi-font'

function ensureIconFont() {
  if (typeof document === 'undefined') return
  if (document.getElementById(ICON_FONT_ID)) return
  const style = document.createElement('style')
  style.id = ICON_FONT_ID
  style.textContent = `
    @font-face {
      font-family: 'MaterialDesignIcons';
      src: url(${iconFont}) format('truetype');
      font-weight: normal;
      font-style: normal;
      font-display: block;
    }
  `
  document.head.appendChild(style)
}

type PaperRootProps = {
  children: ReactNode
  /** Compact shell for home-page cards */
  compact?: boolean
  className?: string
}

const lightTheme: MD3Theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#3f5f90',
    onPrimary: '#ffffff',
    primaryContainer: '#d6e3ff',
    onPrimaryContainer: '#001b3d',
    secondary: '#565e71',
    onSecondary: '#ffffff',
    secondaryContainer: '#dae2f9',
    onSecondaryContainer: '#131c2b',
    surface: '#f9f9fc',
    onSurface: '#1a1c1e',
    onSurfaceVariant: '#43474e',
    outline: '#73777f',
    outlineVariant: '#c3c6cf',
    background: '#f9f9fc',
  },
}

const darkTheme: MD3Theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#a9c7ff',
    onPrimary: '#04305f',
    primaryContainer: '#254777',
    onPrimaryContainer: '#d6e3ff',
    secondary: '#bec6dc',
    onSecondary: '#283041',
    secondaryContainer: '#3e4758',
    onSecondaryContainer: '#dae2f9',
    surface: '#1e2022',
    onSurface: '#e2e2e5',
    onSurfaceVariant: '#c3c6cf',
    outline: '#8d9199',
    outlineVariant: '#43474e',
    background: '#111418',
  },
}

function useDocsDarkMode() {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    const root = document.documentElement
    const sync = () =>
      setDark(
        root.classList.contains('dark') || root.classList.contains('rp-dark')
      )
    sync()
    const observer = new MutationObserver(sync)
    observer.observe(root, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  return dark
}

/**
 * Client-only Paper + SafeArea wrapper for live docs demos.
 * Avoids SSR crashes from react-native-web.
 */
export function PaperRoot({ children, compact, className }: PaperRootProps) {
  const [mounted, setMounted] = useState(false)
  const dark = useDocsDarkMode()

  useEffect(() => {
    ensureIconFont()
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div
        className={[
          'pd-demo',
          compact ? 'pd-demo--compact' : '',
          'pd-demo--loading',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        aria-hidden="true"
      />
    )
  }

  return (
    <div
      className={[
        'pd-demo',
        compact ? 'pd-demo--compact' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <SafeAreaProvider>
        <PaperProvider theme={dark ? darkTheme : lightTheme}>
          <View style={{ flex: 1, width: '100%' }}>{children}</View>
        </PaperProvider>
      </SafeAreaProvider>
    </div>
  )
}
