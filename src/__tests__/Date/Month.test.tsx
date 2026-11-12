import { render, within } from '@testing-library/react-native'
import Month from '../../Date/Month'
import { getStartAtIndex } from '../../Date/dateUtils'

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
