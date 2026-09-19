import { render, screen } from '@testing-library/react-native'
import { MD3LightTheme, Text } from 'react-native-paper'
import Day from '../../Date/Day'
import type { DayContentRenderer } from '../../Date/Calendar'

const defaultProps = {
  theme: MD3LightTheme,
  textColorOnPrimary: '#fff',
  day: 15,
  month: 0,
  year: 2025,
  selected: false,
  inRange: false,
  leftCrop: false,
  rightCrop: false,
  primaryColor: 'blue',
  selectColor: 'lightblue',
  isToday: false,
  disabled: false,
  onPressDate: () => null,
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
