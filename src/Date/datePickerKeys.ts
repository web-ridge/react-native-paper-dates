import { useEffect } from 'react'
import { Platform } from 'react-native'

import { useLatest } from '../shared/utils'
import { getDaysInMonth } from './dateUtils'

type DateKeyHandlers = {
  getVisibleMonth: () => Date
  onConfirm?: () => void
  onFocusDate?: (date: Date) => void
  onMoveFocus?: (deltaMonths: number) => void
  onMoveMonth?: (deltaMonths: number) => void
  onOpenMonthMenu?: () => void
  onOpenYearMenu?: () => void
}

function isTextField(target: EventTarget | null) {
  if (!target || typeof target !== 'object' || !('tagName' in target)) {
    return false
  }
  const tag = String((target as { tagName?: string }).tagName)
  return tag === 'INPUT' || tag === 'TEXTAREA'
}

export function useDatePickerKeys(enabled: boolean, handlers: DateKeyHandlers) {
  const handlersRef = useLatest(handlers)
  useEffect(() => {
    const target = globalThis.window
    if (
      !enabled ||
      Platform.OS !== 'web' ||
      !target?.addEventListener ||
      !target.removeEventListener
    ) {
      return
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (isTextField(event.target)) return
      const key = event.key
      if (key === 'Enter') {
        event.preventDefault()
        handlersRef.current.onConfirm?.()
        return
      }
      if (key === 'Home' || key === 'End') {
        event.preventDefault()
        const month = handlersRef.current.getVisibleMonth()
        const day =
          key === 'Home'
            ? 1
            : getDaysInMonth({
                month: month.getMonth(),
                year: month.getFullYear(),
              })
        handlersRef.current.onFocusDate?.(
          new Date(month.getFullYear(), month.getMonth(), day)
        )
        return
      }
      if (key === 'PageDown' || key === 'PageUp') {
        event.preventDefault()
        const delta = (key === 'PageDown' ? 1 : -1) * (event.shiftKey ? 12 : 1)
        handlersRef.current.onMoveMonth?.(delta)
        handlersRef.current.onMoveFocus?.(delta)
        return
      }
      if (event.shiftKey && (key === 'm' || key === 'M')) {
        event.preventDefault()
        handlersRef.current.onOpenMonthMenu?.()
        return
      }
      if (event.shiftKey && (key === 'y' || key === 'Y')) {
        event.preventDefault()
        handlersRef.current.onOpenYearMenu?.()
      }
    }
    target.addEventListener('keydown', onKeyDown)
    return () => target.removeEventListener('keydown', onKeyDown)
  }, [enabled, handlersRef])
}
