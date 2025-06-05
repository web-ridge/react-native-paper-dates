import { type MutableRefObject, useEffect } from 'react'
import { useLatest } from '../shared/utils'
import {
  addMonths,
  differenceInMonths,
  getRealIndex,
  startAtIndex,
  totalMonths,
} from './dateUtils'
import { DEFAULT_START_YEAR, DEFAULT_END_YEAR } from './constants'

export type RenderProps = {
  index: number
  onNext: () => any
  onPrev: () => any
}

export type SwiperProps = {
  initialIndex: number
  scrollMode: 'horizontal' | 'vertical'
  renderItem: (renderProps: RenderProps) => any
  renderHeader?: (renderProps: RenderProps) => any
  renderFooter?: (renderProps: RenderProps) => any
  selectedYear: number | undefined
  startWeekOnMonday: boolean
  startYear?: number
  endYear?: number
}

// Helper function to get the minimum allowed index based on startYear
export function getMinIndex(startYear?: number): number {
  if (!startYear) return 0

  const today = new Date()
  const startDate = new Date(startYear, 0, 1) // January 1st of startYear
  const months = differenceInMonths(today, startDate)
  const minIndex = startAtIndex + months
  // Ensure minimum index is at least 0 and at most totalMonths - 1
  return Math.max(0, Math.min(minIndex, totalMonths - 1))
}

// Helper function to get the maximum allowed index based on endYear
export function getMaxIndex(endYear?: number): number {
  if (!endYear) return startAtIndex * 2 - 1

  const today = new Date()
  const endDate = new Date(endYear, 11, 31) // December 31st of endYear
  const months = differenceInMonths(today, endDate)
  const maxIndex = startAtIndex + months
  // Ensure maximum index is at least 0 and at most totalMonths - 1
  return Math.max(0, Math.min(maxIndex, totalMonths - 1))
}

// Helper function to check if an index is within allowed range
export function isIndexWithinRange(
  index: number,
  startYear?: number,
  endYear?: number
): boolean {
  const minIndex = getMinIndex(startYear || DEFAULT_START_YEAR)
  const maxIndex = getMaxIndex(endYear || DEFAULT_END_YEAR)
  return index >= minIndex && index <= maxIndex
}

export function useYearChange(
  onChange: (index: number | undefined) => void,
  {
    selectedYear,
    currentIndexRef,
  }: {
    currentIndexRef: MutableRefObject<number>
    selectedYear: number | undefined
  }
) {
  const onChangeRef = useLatest(onChange)
  useEffect(() => {
    if (selectedYear) {
      const currentIndex = currentIndexRef.current || 0
      const currentDate = addMonths(new Date(), getRealIndex(currentIndex))
      currentDate.setFullYear(selectedYear)

      const today = new Date()
      const months = differenceInMonths(today, currentDate)

      const newIndex = startAtIndex + months
      // Ensure the new index is within valid bounds
      const boundedIndex = Math.max(0, Math.min(newIndex, totalMonths - 1))
      if (currentIndex !== boundedIndex) {
        onChangeRef.current(boundedIndex)
      }
    }
  }, [currentIndexRef, onChangeRef, selectedYear])
}
