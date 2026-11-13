import { type MutableRefObject, useEffect } from 'react'
import { useLatest } from '../shared/utils'
import {
  addMonths,
  differenceInMonths,
  getRealIndex,
  getStartAtIndex,
  getTotalMonths,
} from './dateUtils'
import { defaultStartYear, defaultEndYear } from './dateUtils'

export type RenderProps = {
  endInset?: number
  index: number
  onNext: () => any
  onPrev: () => any
}

export type SwiperProps = {
  endYear?: number
  initialIndex: number
  initialLayout?: { width: number; height: number }
  renderFooter?: (renderProps: RenderProps) => any
  renderHeader?: (renderProps: RenderProps) => any
  renderItem: (renderProps: RenderProps) => any
  scrollMode: 'horizontal' | 'vertical'
  selectedYear: number | undefined
  startWeekOnMonday: boolean
  startYear?: number
}

export function getMinIndex(startYear?: number, endYear?: number): number {
  if (!startYear) return 0

  const today = new Date()
  const startDate = new Date(startYear, 0, 1)
  const months = differenceInMonths(today, startDate)
  const dynamicStartAtIndex = getStartAtIndex(startYear, endYear)
  const minIndex = dynamicStartAtIndex + months
  const totalMonths = getTotalMonths(startYear, endYear)

  return Math.max(0, Math.min(minIndex, totalMonths - 1))
}

export function getMaxIndex(startYear?: number, endYear?: number): number {
  const dynamicStartAtIndex = getStartAtIndex(startYear, endYear)
  const totalMonths = getTotalMonths(startYear, endYear)

  if (!endYear) return totalMonths - 1

  const today = new Date()
  const endDate = new Date(endYear, 11, 31)
  const months = differenceInMonths(today, endDate)
  const maxIndex = dynamicStartAtIndex + months

  return Math.max(0, Math.min(maxIndex, totalMonths - 1))
}

export function isIndexWithinRange(
  index: number,
  startYear?: number,
  endYear?: number
): boolean {
  const minIndex = getMinIndex(startYear || defaultStartYear, endYear)
  const maxIndex = getMaxIndex(startYear, endYear || defaultEndYear)
  return index >= minIndex && index <= maxIndex
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

      const today = new Date()
      const months = differenceInMonths(today, currentDate)
      const dynamicStartAtIndex = getStartAtIndex(startYear, endYear)
      const totalMonths = getTotalMonths(startYear, endYear)

      const newIndex = dynamicStartAtIndex + months
      const boundedIndex = Math.max(0, Math.min(newIndex, totalMonths - 1))
      if (currentIndex !== boundedIndex) {
        onChangeRef.current(boundedIndex)
      }
    }
  }, [currentIndexRef, onChangeRef, selectedYear, startYear, endYear])
}
