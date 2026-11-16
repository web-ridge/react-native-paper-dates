import { act, render } from '@testing-library/react-native'
import { LightTheme, Text } from 'react-native-paper'

import type { DayContentRenderer } from '../../Date/Calendar'
import Day from '../../Date/Day'

type Fiber = {
  memoizedProps?: Record<string, unknown>
  pendingProps?: Record<string, unknown>
  return: Fiber | null
}

function dayHandlers(node: { unstable_fiber?: Fiber | null }) {
  let fiber = node.unstable_fiber ?? null
  for (let depth = 0; fiber && depth < 12; depth += 1, fiber = fiber.return) {
    const props = fiber.memoizedProps ?? fiber.pendingProps
    if (typeof props?.onHoverIn === 'function') return props
  }
  throw new Error('missing day handlers')
}

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

it('uses the contrast color and exposes the date when selected', async () => {
  const view = await render(
    <Day
      {...defaultProps}
      locale="en-US"
      selected
      textColorOnPrimary="#123456"
    />
  )
  expect(view.getByText('15')).toHaveStyle({ color: '#123456' })
  const button = view.getByTestId('react-native-paper-dates-day-2025-0-15')
  expect(button).toHaveProp(
    'accessibilityState',
    expect.objectContaining({ disabled: false, selected: true })
  )
  expect(button.props.accessibilityLabel).toContain('2025')
  expect(button.props.accessibilityLabel).toContain('15')
})

it('tracks focus, hover, and press on a day', async () => {
  const onPressDate = jest.fn()
  const view = await render(<Day {...defaultProps} onPressDate={onPressDate} />)
  const button = dayHandlers(
    view.getByTestId('react-native-paper-dates-day-2025-0-15')
  )
  await act(async () => {
    ;(button.onFocus as () => void)()
    ;(button.onHoverIn as () => void)()
    ;(button.onPressIn as () => void)()
    ;(button.onPress as () => void)()
    ;(button.onPressOut as () => void)()
    ;(button.onHoverOut as () => void)()
    ;(button.onBlur as () => void)()
  })
  expect(onPressDate).toHaveBeenCalledWith(new Date(2025, 0, 15))
})

it('renders no day content by default', async () => {
  const view = await render(<Day {...defaultProps} />)
  expect(view.queryByTestId('day-content')).toBeNull()
})

it('renders dayContent with the day it belongs to', async () => {
  const dayContent: DayContentRenderer = ({ date, day, month, year }) => (
    <Text testID="day-content">
      {`${date.getDate()}|${day}|${month}|${year}`}
    </Text>
  )
  const view = await render(<Day {...defaultProps} dayContent={dayContent} />)
  expect(view.getByTestId('day-content')).toHaveTextContent('15|15|0|2025')
})

it('does not let day content swallow presses', async () => {
  const dayContent: DayContentRenderer = () => (
    <Text testID="day-content">•</Text>
  )
  const view = await render(<Day {...defaultProps} dayContent={dayContent} />)
  expect(view.getByTestId('day-content').parent).toHaveProp(
    'pointerEvents',
    'none'
  )
})

it('shrinks the day when the row is shorter than the default cell', async () => {
  const dayContent: DayContentRenderer = () => (
    <Text testID="day-content">•</Text>
  )
  const view = await render(
    <Day {...defaultProps} cellHeight={24} dayContent={dayContent} />
  )
  expect(
    view.getByTestId('react-native-paper-dates-day-2025-0-15')
  ).toHaveStyle({ height: 24 })
  expect(view.getByText('15').parent).toHaveStyle({
    borderRadius: 12,
    height: 24,
    width: 24,
  })
  expect(view.getByTestId('day-content').parent).toHaveStyle({
    height: 24,
    width: 24,
  })
})

it('renders day content at the given position with extra styles', async () => {
  const dayContent: DayContentRenderer = () => (
    <Text testID="day-content">•</Text>
  )
  const view = await render(
    <Day
      {...defaultProps}
      dayContent={dayContent}
      dayContentPosition="top-right"
      dayContentStyle={{ marginTop: -3 }}
    />
  )
  expect(view.getByTestId('day-content').parent).toHaveStyle({
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    marginTop: -3,
  })
})
