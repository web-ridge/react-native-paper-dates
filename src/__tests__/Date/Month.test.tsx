import { render, within } from '@testing-library/react-native'

import { getStartAtIndex } from '../../Date/dateUtils'
import Month, {
  getMonthHeight,
  getVerticalListMetrics,
  getVerticalMonthsOffset,
  horizontalMonthScrolls,
} from '../../Date/Month'
import { getMaxIndex, getMinIndex } from '../../Date/SwiperUtils'

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

it('scrolls day numbers independently of the month title in single mode', async () => {
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
