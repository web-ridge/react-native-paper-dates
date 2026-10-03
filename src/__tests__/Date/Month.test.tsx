import { render, within } from '@testing-library/react-native'
import Month from '../../Date/Month'
import { getStartAtIndex } from '../../Date/dateUtils'

const defaultProps = {
  locale: 'en',
  index: getStartAtIndex(),
  onPressYear: () => null,
  selectingYear: false,
  onPressDate: () => null,
  primaryColor: '#000',
  selectColor: '#ccc',
  roundness: 4,
  startWeekOnMonday: false,
}

it('scrolls day numbers independently of the month title in single mode', async () => {
  const { getByTestId, getByText } = await render(
    <Month
      {...defaultProps}
      mode="single"
      date={new Date('2025-01-15')}
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
      mode="range"
      startDate={new Date('2025-01-10')}
      endDate={new Date('2025-01-20')}
      scrollMode="vertical"
    />
  )
  expect(queryByTestId('react-native-paper-dates-month-days-scroll')).toBeNull()
})
