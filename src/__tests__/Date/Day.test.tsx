import { render, screen } from '@testing-library/react-native'
import { LightTheme, Text } from 'react-native-paper'
import Day from '../../Date/Day'
import type { DayContentRenderer } from '../../Date/Calendar'

const defaultProps = {
  day: 15,
  disabled: false,
  inRange: false,
  isToday: false,
  leftCrop: false,
  month: 0,
  onPressDate: () => null,
  primaryColor: 'blue',
  rightCrop: false,
  selectColor: 'lightblue',
  selected: false,
  textColorOnPrimary: '#fff',
  theme: LightTheme,
  year: 2025,
}

it('renders no day content by default', async () => {
  await render(<Day {...defaultProps} />)
  expect(screen.queryByTestId('day-content')).toBeNull()
})

it('renders dayContent with the day it belongs to', async () => {
  const dayContent: DayContentRenderer = ({ date, day, month, year }) => (
    <Text testID="day-content">
      {`${date.getDate()}|${day}|${month}|${year}`}
    </Text>
  )
  await render(<Day {...defaultProps} dayContent={dayContent} />)
  expect(screen.getByTestId('day-content')).toHaveTextContent('15|15|0|2025')
})

it('does not let day content swallow presses', async () => {
  const dayContent: DayContentRenderer = () => (
    <Text testID="day-content">•</Text>
  )
  await render(<Day {...defaultProps} dayContent={dayContent} />)
  expect(screen.getByTestId('day-content').parent).toHaveProp(
    'pointerEvents',
    'none'
  )
})

it('renders day content at the given position with extra styles', async () => {
  const dayContent: DayContentRenderer = () => (
    <Text testID="day-content">•</Text>
  )
  await render(
    <Day
      {...defaultProps}
      dayContent={dayContent}
      dayContentPosition="top-right"
      dayContentStyle={{ marginTop: -3 }}
    />
  )
  expect(screen.getByTestId('day-content').parent).toHaveStyle({
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    marginTop: -3,
  })
})
