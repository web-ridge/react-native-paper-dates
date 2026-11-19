import { act, render } from '@testing-library/react-native'
import { StyleSheet } from 'react-native'
import { LightTheme, Text } from 'react-native-paper'

import type { DayContentRenderer } from '../../Date/Calendar'
import Day from '../../Date/Day'
import { withAlpha } from '../../shared/utils'

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

function painted(
  node: {
    children?: Array<object | string>
    props?: { style?: unknown }
  } | null
): { background: string[]; border: string[] } {
  if (!node) return { background: [], border: [] }
  const style = StyleSheet.flatten(
    node.props?.style as Parameters<typeof StyleSheet.flatten>[0]
  )
  const background =
    typeof style?.backgroundColor === 'string' ? [style.backgroundColor] : []
  const border =
    typeof style?.borderColor === 'string' ? [style.borderColor] : []
  for (const child of node.children ?? []) {
    if (typeof child === 'string') continue
    const nested = painted(child as typeof node)
    background.push(...nested.background)
    border.push(...nested.border)
  }
  return { background, border }
}

it('follows the material date states', async () => {
  const unselected = await render(<Day {...defaultProps} />)
  const button = dayHandlers(
    unselected.getByTestId('react-native-paper-dates-day-2025-0-15')
  )
  expect(painted(unselected.toJSON()).border).not.toContain(
    LightTheme.colors.secondary
  )
  await act(async () => {
    ;(button.onHoverIn as () => void)()
  })
  expect(painted(unselected.toJSON()).background).toContain(
    withAlpha(LightTheme.colors.onSurfaceVariant, 0.08)
  )
  await act(async () => {
    ;(button.onFocus as () => void)()
  })
  expect(painted(unselected.toJSON()).border).toContain(
    LightTheme.colors.secondary
  )

  const today = await render(<Day {...defaultProps} isToday />)
  const todayButton = dayHandlers(
    today.getByTestId('react-native-paper-dates-day-2025-0-15')
  )
  expect(today.getByText('15').parent).toHaveStyle({
    borderColor: LightTheme.colors.primary,
  })
  expect(today.getByText('15')).toHaveStyle({
    color: LightTheme.colors.primary,
  })
  await act(async () => {
    ;(todayButton.onPressIn as () => void)()
  })
  expect(painted(today.toJSON()).background).toContain(
    withAlpha(LightTheme.colors.primary, 0.1)
  )

  const disabledToday = await render(<Day {...defaultProps} disabled isToday />)
  expect(disabledToday.getByText('15').parent).toHaveStyle({
    borderColor: LightTheme.colors.primary,
  })
  expect(disabledToday.getByText('15')).toHaveStyle({ opacity: 0.38 })
  const disabledButton = dayHandlers(
    disabledToday.getByTestId('react-native-paper-dates-day-2025-0-15')
  )
  await act(async () => {
    ;(disabledButton.onHoverIn as () => void)()
    ;(disabledButton.onFocus as () => void)()
  })
  expect(painted(disabledToday.toJSON()).border).not.toContain(
    LightTheme.colors.secondary
  )
  expect(painted(disabledToday.toJSON()).background).not.toContain(
    withAlpha(LightTheme.colors.onSurfaceVariant, 0.08)
  )

  const range = await render(<Day {...defaultProps} inRange />)
  const rangeButton = dayHandlers(
    range.getByTestId('react-native-paper-dates-day-2025-0-15')
  )
  expect(range.getByText('15')).toHaveStyle({
    color: LightTheme.colors.onSecondaryContainer,
  })
  await act(async () => {
    ;(rangeButton.onHoverIn as () => void)()
  })
  expect(painted(range.toJSON()).background).toContain(
    withAlpha(LightTheme.colors.onPrimaryContainer, 0.08)
  )

  const selected = await render(<Day {...defaultProps} selected />)
  const selectedButton = dayHandlers(
    selected.getByTestId('react-native-paper-dates-day-2025-0-15')
  )
  await act(async () => {
    ;(selectedButton.onHoverIn as () => void)()
  })
  expect(painted(selected.toJSON()).background).toContain(
    withAlpha(LightTheme.colors.onPrimary, 0.08)
  )
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
