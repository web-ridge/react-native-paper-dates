import { render } from '@testing-library/react-native'

import Calendar from '../../Date/Calendar'
import { pressTestId } from '../../testUtils'

it('shows one month without a pager', async () => {
  const screen = await render(
    <Calendar
      date={new Date(2026, 0, 15)}
      locale="en"
      mode="single"
      onChange={() => null}
      singleMonth
    />
  )
  expect(
    screen.getByTestId('react-native-paper-dates-day-2026-0-15')
  ).toBeTruthy()
})

it('renders Calendar', async () => {
  const fixedDate = new Date('2025-01-15')
  const { toJSON } = await render(
    <Calendar
      date={fixedDate}
      locale="en"
      mode="single"
      onChange={() => null}
    />
  )
  expect(toJSON()).toMatchSnapshot()
})

it('draws the month on the first render when initialLayout is given', async () => {
  const fixedDate = new Date('2025-01-15')
  const { queryByText, rerender } = await render(
    <Calendar
      date={fixedDate}
      locale="en"
      mode="single"
      onChange={() => null}
    />
  )
  expect(queryByText('January 2025')).toBeNull()

  await rerender(
    <Calendar
      date={fixedDate}
      initialLayout={{ height: 400, width: 320 }}
      locale="en"
      mode="single"
      onChange={() => null}
    />
  )
  expect(queryByText('January 2025')).toBeTruthy()
})

it('starts the month pager on the current month instead of at 0', async () => {
  const fixedDate = new Date('2025-01-15')
  const { root } = await render(
    <Calendar
      date={fixedDate}
      initialLayout={{ height: 400, width: 320 }}
      locale="en"
      mode="single"
      onChange={() => null}
    />
  )
  const pager = root!.queryAll((node) => node.type === 'RCTScrollView')[0]
  expect(pager.props.contentOffset).toEqual({
    x: 320,
    y: 0,
  })
})

it('does not complete a range on the same day', async () => {
  const onChange = jest.fn()
  const start = new Date(2026, 10, 10)
  const screen = await render(
    <Calendar
      endDate={undefined}
      initialLayout={{ height: 800, width: 320 }}
      locale="en"
      mode="range"
      onChange={onChange}
      startDate={start}
    />
  )

  await pressTestId(screen, 'react-native-paper-dates-day-2026-10-10')
  expect(onChange).toHaveBeenLastCalledWith({
    endDate: undefined,
    startDate: new Date(2026, 10, 10),
  })

  await pressTestId(screen, 'react-native-paper-dates-day-2026-10-12')
  expect(onChange).toHaveBeenLastCalledWith({
    endDate: new Date(2026, 10, 12, 23, 59, 59, 999),
    startDate: start,
  })
})
