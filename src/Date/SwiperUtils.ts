import type { MutableRefObject } from 'react'
import { useLatest } from '../utils'
import * as React from 'react'
import {
  addMonths,
  differenceInMonths,
  getRealIndex,
  startAtIndex,
} from './dateUtils'

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
  React.useEffect(() => {
    if (selectedYear) {
      const currentIndex = currentIndexRef.current || 0
      const currentDate = addMonths(new Date(), getRealIndex(currentIndex))
      currentDate.setFullYear(selectedYear)

      const today = new Date()
      const months = differenceInMonths(today, currentDate)

      const newIndex = startAtIndex + months
      if (currentIndex !== newIndex) {
        onChangeRef.current(newIndex)
      }
    }
  }, [currentIndexRef, onChangeRef, selectedYear])
}
