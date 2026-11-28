import { render, within } from '@testing-library/react-native'
import { StyleSheet } from 'react-native'

import { getInitialIndex, getStartAtIndex } from '../../Date/dateUtils'
import Month from '../../Date/Month'
import {
  getMonthHeight,
  getVerticalListMetrics,
  getVerticalMonthsOffset,
  horizontalContentHeight,
  horizontalMonthScrolls,
  horizontalWeekHeight,
  monthWeekCount,
} from '../../Date/monthLayout'
import { getMaxIndex, getMinIndex } from '../../Date/SwiperUtils'

function bars(screen: { container: { queryAll: Function } }, color: string) {
  return screen.container.queryAll((node: { props: { style?: unknown } }) => {
    const style = StyleSheet.flatten(
      node.props.style as Parameters<typeof StyleSheet.flatten>[0]
    )
    return style?.backgroundColor === color
  })
}

const defaultProps = {
  index: getStartAtIndex(),
  locale: 'en',
  onPressDate: () => null,
  onPressYear: () => null,
  primaryColor: '#000',
  roundness: 4,
  selectColor: '#ccc',
  selectingYear: false,
  startWeekOnMonday: false,
}

it('grows and shrinks a single month with its week count', () => {
  const february = getInitialIndex(new Date(2026, 1, 1))
  const january = getInitialIndex(new Date(2027, 0, 1))
  expect(monthWeekCount(february, false)).toBe(4)
  expect(monthWeekCount(january, false)).toBe(6)
  expect(horizontalContentHeight(january, false)).toBe(
    horizontalContentHeight(february, false) + 2 * 48
  )
  expect(horizontalWeekHeight(0, 4)).toBe(48)
  expect(horizontalWeekHeight(240, 5)).toBe(48)
  expect(horizontalWeekHeight(200, 5)).toBe(40)
  expect(horizontalWeekHeight(200, 5) * 5).toBeLessThanOrEqual(200)
})

it('keeps the month title outside the day grid in single mode', async () => {
  const { getByTestId, getByText } = await render(
    <Month
      {...defaultProps}
      date={new Date('2025-01-15')}
      mode="single"
      scrollMode="horizontal"
    />
  )

  const daysScroll = getByTestId('react-native-paper-dates-month-days-scroll')
  const monthTitle = getByText(/^[A-Za-z]+ \d{4}$/)

  expect(monthTitle).toBeTruthy()
  expect(within(daysScroll).queryByText(/^[A-Za-z]+ \d{4}$/)).toBeNull()
  expect(within(daysScroll).getByText('15')).toBeTruthy()
})

it('does not draw a range span when the start and end are the same day', async () => {
  const selectColor = '#cfe8ff'
  const index = getInitialIndex(new Date(2026, 10, 10))
  const sameDay = await render(
    <Month
      {...defaultProps}
      endDate={new Date(2026, 10, 10, 23, 59, 59)}
      index={index}
      mode="range"
      scrollMode="vertical"
      selectColor={selectColor}
      startDate={new Date(2026, 10, 10)}
    />
  )
  expect(bars(sameDay, selectColor)).toHaveLength(0)

  const span = await render(
    <Month
      {...defaultProps}
      endDate={new Date(2026, 10, 20, 23, 59, 59)}
      index={index}
      mode="range"
      scrollMode="vertical"
      selectColor={selectColor}
      startDate={new Date(2026, 10, 10)}
    />
  )
  expect(bars(span, selectColor).length).toBeGreaterThan(0)
})

it('labels the start, end, and in-range days of a range selection', async () => {
  const index = getInitialIndex(new Date(2026, 10, 10))
  const { getByTestId } = await render(
    <Month
      {...defaultProps}
      endDate={new Date(2026, 10, 20, 23, 59, 59)}
      index={index}
      mode="range"
      scrollMode="vertical"
      startDate={new Date(2026, 10, 10)}
    />
  )

  expect(
    getByTestId('react-native-paper-dates-day-2026-10-10').props
      .accessibilityLabel
  ).toContain('Start date')
  expect(
    getByTestId('react-native-paper-dates-day-2026-10-20').props
      .accessibilityLabel
  ).toContain('End date')
  expect(
    getByTestId('react-native-paper-dates-day-2026-10-15').props
      .accessibilityLabel
  ).toContain('In selected range')
  expect(
    getByTestId('react-native-paper-dates-day-2026-10-9').props
      .accessibilityLabel
  ).not.toContain('In selected range')

  const sameDay = await render(
    <Month
      {...defaultProps}
      endDate={new Date(2026, 10, 10, 23, 59, 59)}
      index={index}
      mode="range"
      scrollMode="vertical"
      startDate={new Date(2026, 10, 10)}
    />
  )
  const label = sameDay.getByTestId('react-native-paper-dates-day-2026-10-10')
    .props.accessibilityLabel
  expect(label).toContain('Start date')
  expect(label).toContain('End date')
})

it('does not wrap day numbers in a scroll view in vertical mode', async () => {
  const { queryByTestId } = await render(
    <Month
      {...defaultProps}
      endDate={new Date('2025-01-20')}
      mode="range"
      scrollMode="vertical"
      startDate={new Date('2025-01-10')}
    />
  )
  expect(queryByTestId('react-native-paper-dates-month-days-scroll')).toBeNull()
})

it('keeps vertical months on one continuous scroll', () => {
  const endYear = 2022
  const startYear = 2020
  const max = getMaxIndex(startYear, endYear)
  const min = getMinIndex(startYear, endYear)
  const { height, origin } = getVerticalListMetrics(
    min,
    max,
    false,
    startYear,
    endYear
  )
  let cursor = origin
  for (let index = min; index <= max; index += 1) {
    expect(getVerticalMonthsOffset(index, false, startYear, endYear)).toBe(
      cursor
    )
    cursor += getMonthHeight('vertical', index, false, startYear, endYear)
  }
  expect(cursor - origin).toBe(height)
})

it('falls back when a month index is outside the cached layout', async () => {
  expect(horizontalMonthScrolls(120, -1, false, 2020, 2021)).toEqual(
    expect.any(Boolean)
  )
  expect(getMonthHeight('vertical', 10000, false, 2020, 2021)).toBeGreaterThan(
    0
  )

  const { getAllByText } = await render(
    <Month
      {...defaultProps}
      date={new Date(2020, 0, 1)}
      endYear={2021}
      index={-1}
      mode="single"
      scrollMode="horizontal"
      startYear={2020}
    />
  )
  expect(getAllByText('1').length).toBeGreaterThan(0)
})
