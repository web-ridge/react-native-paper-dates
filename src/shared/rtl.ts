import { I18nManager, Platform } from 'react-native'

export function chevronIcon(direction: 'next' | 'previous') {
  const previous = I18nManager.isRTL ? 'chevron-right' : 'chevron-left'
  if (direction === 'previous') return previous
  return I18nManager.isRTL ? 'chevron-left' : 'chevron-right'
}

export function shortcutAttrs(label: string, hint: string) {
  return Platform.OS === 'web'
    ? { accessibilityHint: hint, title: `${label} (${hint})` }
    : { accessibilityHint: hint }
}
