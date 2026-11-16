import { render } from '@testing-library/react-native'

import Calendar from '../../Date/Calendar'
import { installDateKeyListener, pressNode, pressTestId } from '../../testUtils'

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

function dayFocused(
  screen: {
    getAllByTestId: (testId: string) => Array<{
      children?: Array<object | string>
      props?: { pointerEvents?: string }
    }>
  },
  testId: string
) {
  const focused = (node: {
    children?: Array<object | string>
    props?: { pointerEvents?: string }
  }): boolean => {
    if (node.props?.pointerEvents === 'none') return true
    return (node.children ?? []).some(
      (child) => typeof child !== 'string' && focused(child)
    )
  }
  return screen.getAllByTestId(testId).some((day) => focused(day))
}

async function pressLabel(
  screen: { container: { queryAll: Function } },
  label: string
) {
  const node = screen.container.queryAll(
    (item: { props: { accessibilityLabel?: string } }) =>
      item.props.accessibilityLabel === label
  )[0]
  if (!node) {
    throw new Error(`missing ${label}`)
  }
  await pressNode(node)
}

it('moves the focused day from the keyboard and clamps a short month', async () => {
  const keys = installDateKeyListener()
  const layout = { height: 400, width: 320 }
  try {
    const screen = await render(
      <Calendar
        date={new Date(2026, 0, 31)}
        endYear={2028}
        initialLayout={layout}
        locale="en"
        mode="single"
        onChange={() => null}
        startYear={2024}
      />
    )

    await keys.press('m', true)
    await pressLabel(screen, 'February')
    expect(dayFocused(screen, 'react-native-paper-dates-day-2026-1-28')).toBe(
      true
    )
    expect(screen.queryByLabelText('June')).toBeNull()

    await keys.press('PageDown')
    expect(dayFocused(screen, 'react-native-paper-dates-day-2026-2-28')).toBe(
      true
    )
    expect(screen.getByText('March 2026')).toBeTruthy()

    await keys.press('y', true)
    await pressLabel(screen, '2027')
    expect(screen.getByText('March 2027')).toBeTruthy()

    const last = await render(
      <Calendar
        date={new Date(2026, 11, 15)}
        endYear={2026}
        initialLayout={layout}
        locale="en"
        mode="single"
        onChange={() => null}
        startYear={2026}
      />
    )
    await keys.press('PageDown')
    expect(last.getByText('December 2026')).toBeTruthy()
    expect(last.queryByText('January 2027')).toBeNull()

    const first = await render(
      <Calendar
        date={new Date(2026, 0, 15)}
        endYear={2026}
        initialLayout={layout}
        locale="en"
        mode="single"
        onChange={() => null}
        startYear={2026}
      />
    )
    await keys.press('PageUp')
    expect(first.getByText('January 2026')).toBeTruthy()
    expect(first.queryByText('December 2025')).toBeNull()
  } finally {
    keys.restore()
  }
})
