import { type MutableRefObject, type ReactNode, useEffect } from 'react'

import { useLatest } from '../shared/utils'
import { useDatePickerKeys } from './datePickerKeys'
import {
  addMonths,
  currentCalendarMonth,
  defaultEndYear,
  defaultStartYear,
  differenceInMonths,
  getInitialIndex,
  getRealIndex,
  getStartAtIndex,
  getTotalMonths,
} from './dateUtils'

export type RenderProps = {
  active?: boolean
  endInset?: number
  index: number
  onNext: () => void
  onPrev: () => void
}
export type SwiperProps = {
  endYear?: number
  focusDate?: Date
  initialIndex: number
  initialLayout?: { height: number; width: number }
  keyboardEnabled?: boolean
  onFocusDate?: (date: Date) => void
  onKeyboardConfirm?: () => void
  onMoveFocus?: (deltaMonths: number) => void
  onOpenMonthMenu?: () => void
  onOpenYearMenu?: () => void
  renderFooter?: (renderProps: RenderProps) => ReactNode
  renderHeader?: (renderProps: RenderProps) => ReactNode
  renderItem: (renderProps: RenderProps) => ReactNode
  scrollMode: 'horizontal' | 'vertical'
  selectedYear: number | undefined
  startWeekOnMonday: boolean
  startYear?: number
}

export const verticalMonthOverscan = 6
export const verticalWindowEdge = 2
const indexBoundCache = new Map<string, number>()

export function getMaxIndex(startYear?: number, endYear?: number): number {
  const { month, stamp, year } = currentCalendarMonth()
  const key = `max:${startYear ?? ''}:${endYear ?? ''}:${endYear ? stamp : ''}`
  const cached = indexBoundCache.get(key)
  if (cached !== undefined) return cached

  const dynamicStartAtIndex = getStartAtIndex(startYear, endYear)
  const totalMonths = getTotalMonths(startYear, endYear)
  const value = endYear
    ? Math.max(
        0,
        Math.min(
          dynamicStartAtIndex + (endYear - year) * 12 - month + 11,
          totalMonths - 1
        )
      )
    : totalMonths - 1
  indexBoundCache.set(key, value)
  return value
}

export function getMinIndex(startYear?: number, endYear?: number): number {
  if (!startYear) return 0

  const { month, stamp, year } = currentCalendarMonth()
  const key = `min:${startYear}:${endYear ?? ''}:${stamp}`
  const cached = indexBoundCache.get(key)
  if (cached !== undefined) return cached

  const dynamicStartAtIndex = getStartAtIndex(startYear, endYear)
  const totalMonths = getTotalMonths(startYear, endYear)
  const value = Math.max(
    0,
    Math.min(
      dynamicStartAtIndex + (startYear - year) * 12 - month,
      totalMonths - 1
    )
  )
  indexBoundCache.set(key, value)
  return value
}

export type MonthSlot = {
  monthIndex: number
  slot: number
}

export function assignMonthSlots(
  previous: readonly MonthSlot[],
  indexes: readonly number[]
): MonthSlot[] {
  const wanted = new Set(indexes)
  const used = new Set<number>()
  const kept: MonthSlot[] = []
  for (const entry of previous) {
    if (wanted.has(entry.monthIndex) && !used.has(entry.slot)) {
      kept.push(entry)
      used.add(entry.slot)
    }
  }
  const keptMonths = new Set(kept.map((entry) => entry.monthIndex))
  let slot = 0
  const assigned = kept.slice()
  for (const monthIndex of indexes) {
    if (keptMonths.has(monthIndex)) continue
    while (used.has(slot)) slot += 1
    used.add(slot)
    assigned.push({ monthIndex, slot })
    slot += 1
  }
  assigned.sort((left, right) => left.slot - right.slot)
  return assigned
}

export function getVerticalWindow(
  index: number,
  startYear?: number,
  endYear?: number
): number[] {
  const indexes: number[] = []
  for (
    let offset = -verticalMonthOverscan;
    offset <= verticalMonthOverscan;
    offset += 1
  ) {
    const monthIndex = index + offset
    if (isIndexWithinRange(monthIndex, startYear, endYear)) {
      indexes.push(monthIndex)
    }
  }
  return indexes.length ? indexes : [index]
}

export function isIndexWithinRange(
  index: number,
  startYear?: number,
  endYear?: number
): boolean {
  const maxIndex = getMaxIndex(startYear, endYear || defaultEndYear)
  const minIndex = getMinIndex(startYear || defaultStartYear, endYear)
  return index >= minIndex && index <= maxIndex
}

export function nextVisibleIndexes(
  current: number[],
  index: number,
  startYear?: number,
  endYear?: number
) {
  const first = current[0]
  const last = current[current.length - 1]
  if (
    first !== undefined &&
    last !== undefined &&
    index - first > verticalWindowEdge &&
    last - index > verticalWindowEdge
  ) {
    return current
  }
  const next = getVerticalWindow(index, startYear, endYear)
  return sameIndexes(current, next) ? current : next
}

export function sameIndexes(left: number[], right: number[]) {
  if (left.length !== right.length) {
    return false
  }
  for (let i = 0; i < left.length; i += 1) {
    if (left[i] !== right[i]) {
      return false
    }
  }
  return true
}

export function useCalendarKeyboard(
  enabled: boolean,
  indexRef: MutableRefObject<number>,
  {
    endYear,
    onConfirm,
    onFocusDate,
    onMoveFocus,
    onMoveMonth,
    onOpenMonthMenu,
    onOpenYearMenu,
    startYear,
  }: {
    endYear?: number
    onConfirm?: () => void
    onFocusDate?: (date: Date) => void
    onMoveFocus?: (deltaMonths: number) => void
    onMoveMonth: (delta: number) => void
    onOpenMonthMenu?: () => void
    onOpenYearMenu?: () => void
    startYear?: number
  }
) {
  useDatePickerKeys(enabled, {
    getVisibleMonth: () =>
      addMonths(new Date(), getRealIndex(indexRef.current, startYear, endYear)),
    onConfirm,
    onFocusDate,
    onMoveFocus,
    onMoveMonth,
    onOpenMonthMenu,
    onOpenYearMenu,
  })
}

export function useFocusDate(
  onChange: (index: number) => void,
  {
    currentIndexRef,
    endYear,
    focusDate,
    startYear,
  }: {
    currentIndexRef: MutableRefObject<number>
    endYear?: number
    focusDate?: Date
    startYear?: number
  }
) {
  const onChangeRef = useLatest(onChange)
  const focusTime = focusDate?.getTime()
  useEffect(() => {
    if (focusTime === undefined) return
    const newIndex = getInitialIndex(new Date(focusTime), startYear, endYear)
    if (!isIndexWithinRange(newIndex, startYear, endYear)) return
    if (currentIndexRef.current !== newIndex) {
      onChangeRef.current(newIndex)
    }
  }, [currentIndexRef, endYear, focusTime, onChangeRef, startYear])
}

export function useYearChange(
  onChange: (index: number | undefined) => void,
  {
    currentIndexRef,
    endYear,
    selectedYear,
    startYear,
  }: {
    currentIndexRef: MutableRefObject<number>
    endYear?: number
    selectedYear: number | undefined
    startYear?: number
  }
) {
  const onChangeRef = useLatest(onChange)
  useEffect(() => {
    if (selectedYear) {
      const currentIndex = currentIndexRef.current || 0
      const currentDate = addMonths(
        new Date(),
        getRealIndex(currentIndex, startYear, endYear)
      )
      currentDate.setFullYear(selectedYear)

      const dynamicStartAtIndex = getStartAtIndex(startYear, endYear)
      const today = new Date()
      const months = differenceInMonths(today, currentDate)
      const newIndex = dynamicStartAtIndex + months
      const totalMonths = getTotalMonths(startYear, endYear)
      const boundedIndex = Math.max(0, Math.min(newIndex, totalMonths - 1))
      if (currentIndex !== boundedIndex) {
        onChangeRef.current(boundedIndex)
      }
    }
  }, [currentIndexRef, onChangeRef, selectedYear, startYear, endYear])
}
