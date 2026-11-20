import { act, render } from '@testing-library/react-native'
import { Platform, ScrollView } from 'react-native'

import DatePickerDocked, { placeDockedCard } from '../../Date/DatePickerDocked'
import DatePickerInput from '../../Date/DatePickerInput'
import MonthMenu from '../../Date/MonthMenu'
import { useDatePickerKeys } from '../../Date/datePickerKeys'
import { installDateKeyListener, pressNode, pressTestId } from '../../testUtils'

const anchor = { height: 56, width: 320, x: 24, y: 80 }

type Fiber = {
  memoizedProps?: Record<string, unknown>
  pendingProps?: Record<string, unknown>
  return: Fiber | null
}

function hoverHandlers(node: { unstable_fiber?: Fiber | null }) {
  let fiber = node.unstable_fiber ?? null
  for (let depth = 0; fiber && depth < 12; depth += 1, fiber = fiber.return) {
    const props = fiber.memoizedProps ?? fiber.pendingProps
    if (typeof props?.onHoverIn === 'function') return props
  }
  throw new Error('missing hover handlers')
}

it('docks the menu under the field and keeps it on screen', () => {
  expect(
    placeDockedCard({
      anchor: { height: 56, width: 280, x: 400, y: 120 },
      cardHeight: 480,
      cardWidth: 360,
      windowHeight: 900,
      windowWidth: 1200,
    })
  ).toEqual({ left: 400, top: 184 })

  expect(
    placeDockedCard({
      anchor: { height: 56, width: 240, x: 900, y: 120 },
      cardHeight: 480,
      cardWidth: 360,
      windowHeight: 900,
      windowWidth: 1200,
    }).left
  ).toBe(780)
})

it('docks a calendar under the field and confirms or dismisses it', async () => {
  const onChange = jest.fn()
  const input = await render(
    <DatePickerInput
      inputMode="start"
      locale="en"
      onChange={onChange}
      presentation="docked"
      testID="date"
      value={new Date(2026, 0, 15)}
    />
  )

  await pressTestId(input, 'date-icon-button')
  expect(
    input.getByTestId('react-native-paper-dates-docked-month')
  ).toBeTruthy()
  await pressTestId(input, 'react-native-paper-dates-docked-next')
  await pressTestId(input, 'react-native-paper-dates-docked-prev')
  await pressTestId(input, 'react-native-paper-dates-docked-month')
  expect(input.getByLabelText('March')).toBeTruthy()
  expect(
    input.getByTestId('react-native-paper-dates-docked-divider')
  ).toBeTruthy()
  await pressTestId(input, 'react-native-paper-dates-docked-month')
  await pressTestId(input, 'react-native-paper-dates-docked-year')
  expect(
    input.getByTestId('react-native-paper-dates-docked-divider')
  ).toBeTruthy()
  expect(input.getAllByLabelText('2026').length).toBeGreaterThan(0)
  await pressTestId(input, 'react-native-paper-dates-docked-year')
  await pressTestId(input, 'react-native-paper-dates-docked-confirm')
  expect(onChange).toHaveBeenCalledWith(new Date(2026, 0, 15))

  const onDismiss = jest.fn()
  const docked = await render(
    <DatePickerDocked
      anchor={anchor}
      date={new Date(2026, 5, 2)}
      locale="en"
      onConfirm={onChange}
      onDismiss={onDismiss}
      visible
    />
  )
  await pressTestId(docked, 'react-native-paper-dates-docked-cancel')
  expect(onDismiss).toHaveBeenCalled()
})

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

function dockedAt(date: Date, years?: { endYear: number; startYear: number }) {
  const onConfirm = jest.fn()
  return {
    onConfirm,
    view: (
      <DatePickerDocked
        anchor={anchor}
        date={date}
        endYear={years?.endYear}
        locale="en"
        onConfirm={onConfirm}
        onDismiss={jest.fn()}
        startYear={years?.startYear}
        visible
      />
    ),
  }
}

it('steps the year and stops at the first and last year', async () => {
  const { view } = dockedAt(new Date(2026, 5, 15), {
    endYear: 2027,
    startYear: 2026,
  })
  const screen = await render(view)
  const year = () => screen.getByTestId('react-native-paper-dates-docked-year')

  await pressTestId(screen, 'react-native-paper-dates-docked-year-next')
  expect(year()).toHaveTextContent('2027', { exact: false })
  await pressTestId(screen, 'react-native-paper-dates-docked-year-next')
  expect(year()).toHaveTextContent('2027', { exact: false })
  await pressTestId(screen, 'react-native-paper-dates-docked-year-prev')
  expect(year()).toHaveTextContent('2026', { exact: false })
  await pressTestId(screen, 'react-native-paper-dates-docked-year-prev')
  expect(year()).toHaveTextContent('2026', { exact: false })
})

it('opens the month menu on the selected month after android lays it out', async () => {
  const scrollTo = jest
    .spyOn(ScrollView.prototype, 'scrollTo')
    .mockImplementation(() => {})
  const layout = { height: 360, width: 360, x: 0, y: 0 }
  try {
    const screen = await render(dockedAt(new Date(2026, 7, 15)).view)
    await pressTestId(screen, 'react-native-paper-dates-docked-month')
    const list = screen.container.queryAll(
      (node: { props: { contentOffset?: { y?: number } } }) =>
        node.props.contentOffset?.y === 5 * 48
    )[0]
    expect(list).toBeTruthy()
    await act(() => {
      list.props.onLayout({ nativeEvent: { layout: { ...layout, height: 0 } } })
      list.props.onContentSizeChange(360, 0)
    })
    expect(scrollTo).not.toHaveBeenCalled()
    await act(() => {
      list.props.onLayout({ nativeEvent: { layout } })
      list.props.onContentSizeChange(360, 12 * 48)
    })
    expect(scrollTo).toHaveBeenCalledWith({ animated: false, y: 5 * 48 })

    scrollTo.mockClear()
    const empty = await render(
      <MonthMenu
        locale="en"
        onPressMonth={() => null}
        selectedMonth={undefined}
      />
    )
    const top = empty.container.queryAll(
      (node: { props: { contentOffset?: { y?: number } } }) =>
        node.props.contentOffset?.y === 0
    )[0]
    await act(() => {
      top.props.onLayout({ nativeEvent: { layout } })
      top.props.onContentSizeChange(360, 12 * 48)
    })
    expect(scrollTo).toHaveBeenCalledWith({ animated: false, y: 0 })
    await act(() => {
      jest.advanceTimersByTime(16)
    })
  } finally {
    scrollTo.mockRestore()
  }
})

it('chooses a month and a year from the menus', async () => {
  const { view } = dockedAt(new Date(2026, 5, 15), {
    endYear: 2028,
    startYear: 2024,
  })
  const screen = await render(view)

  await pressTestId(screen, 'react-native-paper-dates-docked-month')
  await pressLabel(screen, 'March')
  expect(
    screen.getByTestId('react-native-paper-dates-docked-month')
  ).toHaveTextContent('Mar', { exact: false })
  expect(
    screen.queryByTestId('react-native-paper-dates-docked-divider')
  ).toBeNull()

  await pressTestId(screen, 'react-native-paper-dates-docked-year')
  await pressLabel(screen, '2027')
  expect(
    screen.getByTestId('react-native-paper-dates-docked-year')
  ).toHaveTextContent('2027', { exact: false })
  expect(
    screen.queryByTestId('react-native-paper-dates-docked-divider')
  ).toBeNull()
})

it('saves the day that was pressed', async () => {
  const onConfirm = jest.fn()
  const screen = await render(
    <DatePickerDocked
      anchor={anchor}
      date={new Date(2026, 5, 15)}
      locale="en"
      onConfirm={onConfirm}
      onDismiss={jest.fn()}
      visible
    />
  )

  await pressTestId(screen, 'react-native-paper-dates-day-2026-5-20')
  await pressTestId(screen, 'react-native-paper-dates-docked-confirm')
  expect(onConfirm).toHaveBeenCalledWith({ date: new Date(2026, 5, 20) })
})

it('saves the end of a pressed day', async () => {
  const onConfirm = jest.fn()
  const screen = await render(
    <DatePickerDocked
      anchor={anchor}
      date={new Date(2026, 5, 15)}
      dateMode="end"
      locale="en"
      onConfirm={onConfirm}
      onDismiss={jest.fn()}
      visible
    />
  )

  await pressTestId(screen, 'react-native-paper-dates-day-2026-5-20')
  await pressTestId(screen, 'react-native-paper-dates-docked-confirm')
  expect(onConfirm).toHaveBeenCalledWith({
    date: new Date(2026, 5, 20, 23, 59, 59, 999),
  })
})

it('pages the focused day from the keyboard and stops at the year limits', async () => {
  const keys = installDateKeyListener()
  try {
    const onConfirm = jest.fn()
    const screen = await render(
      <DatePickerDocked
        anchor={anchor}
        date={new Date(2026, 5, 15)}
        endYear={2028}
        locale="en"
        onConfirm={onConfirm}
        onDismiss={jest.fn()}
        startYear={2024}
        visible
      />
    )

    await keys.press('PageDown')
    expect(
      screen.getByTestId('react-native-paper-dates-docked-month')
    ).toHaveTextContent('Jul', { exact: false })
    expect(dayFocused(screen, 'react-native-paper-dates-day-2026-6-15')).toBe(
      true
    )

    await keys.press('Home')
    expect(dayFocused(screen, 'react-native-paper-dates-day-2026-6-1')).toBe(
      true
    )
    await keys.press('Enter')
    expect(onConfirm).toHaveBeenCalledWith({ date: new Date(2026, 6, 1) })

    await keys.press('m', true)
    await pressLabel(screen, 'March')
    expect(
      screen.getByTestId('react-native-paper-dates-docked-month')
    ).toHaveTextContent('Mar', { exact: false })
    await keys.press('y', true)
    expect(screen.getAllByLabelText('2026').length).toBeGreaterThan(0)

    const end = await render(
      <DatePickerDocked
        anchor={anchor}
        date={new Date(2026, 11, 15)}
        endYear={2026}
        locale="en"
        onConfirm={jest.fn()}
        onDismiss={jest.fn()}
        startYear={2026}
        visible
      />
    )
    await keys.press('PageDown')
    expect(
      end.getByTestId('react-native-paper-dates-docked-month')
    ).toHaveTextContent('Dec', { exact: false })
    expect(dayFocused(end, 'react-native-paper-dates-day-2026-11-15')).toBe(
      true
    )

    const start = await render(
      <DatePickerDocked
        anchor={anchor}
        date={new Date(2026, 0, 15)}
        endYear={2026}
        locale="en"
        onConfirm={jest.fn()}
        onDismiss={jest.fn()}
        startYear={2026}
        visible
      />
    )
    await keys.press('PageUp')
    expect(
      start.getByTestId('react-native-paper-dates-docked-month')
    ).toHaveTextContent('Jan', { exact: false })
    expect(dayFocused(start, 'react-native-paper-dates-day-2026-0-15')).toBe(
      true
    )
  } finally {
    keys.restore()
  }
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

it('uses a pill target and state layers for the month and year', async () => {
  const docked = await render(
    <DatePickerDocked
      anchor={anchor}
      date={new Date(2026, 5, 2)}
      locale="en"
      onConfirm={jest.fn()}
      onDismiss={jest.fn()}
      visible
    />
  )

  for (const id of [
    'react-native-paper-dates-docked-month',
    'react-native-paper-dates-docked-year',
  ]) {
    expect(docked.getByTestId(id)).toHaveStyle({
      borderRadius: 20,
      overflow: 'hidden',
    })
  }

  const month = docked.getByTestId('react-native-paper-dates-docked-month')
  const handlers = hoverHandlers(month)
  const layers = () => {
    const found: object[] = []
    const walk = (node: {
      children?: Array<object | string>
      props?: { pointerEvents?: string; style?: unknown }
      type?: string
    }) => {
      const styles = [node.props?.style].flat(Infinity)
      const painted = styles.some(
        (style) =>
          !!style &&
          typeof style === 'object' &&
          'backgroundColor' in style &&
          style.backgroundColor !== 'transparent'
      )
      if (
        node.type === 'View' &&
        node.props?.pointerEvents === 'none' &&
        painted
      ) {
        found.push(node)
      }
      for (const child of node.children ?? []) {
        if (typeof child !== 'string') walk(child)
      }
    }
    walk(month)
    return found
  }
  expect(layers()).toHaveLength(0)
  await act(() => {
    ;(handlers.onHoverIn as () => void)()
  })
  expect(layers()).toHaveLength(1)
  await act(() => {
    ;(handlers.onHoverOut as () => void)()
  })
  expect(layers()).toHaveLength(0)
})

it('maps web keyboard shortcuts onto the date picker', async () => {
  const previousPlatform = Platform.OS
  Platform.OS = 'web'
  const listeners = new Map<string, (event: KeyboardEvent) => void>()
  const host = globalThis as { window?: Window & typeof globalThis }
  const previousWindow = host.window
  host.window = {
    addEventListener: (type: string, listener: EventListener) => {
      listeners.set(type, listener as (event: KeyboardEvent) => void)
    },
    removeEventListener: (type: string) => {
      listeners.delete(type)
    },
  } as unknown as Window & typeof globalThis

  const onConfirm = jest.fn()
  const onFocusDate = jest.fn()
  const onMoveMonth = jest.fn()
  const onOpenMonthMenu = jest.fn()
  const onOpenYearMenu = jest.fn()

  function Probe() {
    useDatePickerKeys(true, {
      getVisibleMonth: () => new Date(2026, 0, 15),
      onConfirm,
      onFocusDate,
      onMoveMonth,
      onOpenMonthMenu,
      onOpenYearMenu,
    })
    return null
  }

  try {
    await render(<Probe />)
    const keydown = listeners.get('keydown')
    expect(keydown).toEqual(expect.any(Function))
    const preventDefault = jest.fn()
    keydown?.({
      key: 'Enter',
      preventDefault,
      shiftKey: false,
      target: null,
    } as unknown as KeyboardEvent)
    keydown?.({
      key: 'PageUp',
      preventDefault,
      shiftKey: true,
      target: null,
    } as unknown as KeyboardEvent)
    keydown?.({
      key: 'Home',
      preventDefault,
      shiftKey: false,
      target: null,
    } as unknown as KeyboardEvent)
    keydown?.({
      key: 'End',
      preventDefault,
      shiftKey: false,
      target: null,
    } as unknown as KeyboardEvent)
    keydown?.({
      key: 'm',
      preventDefault,
      shiftKey: true,
      target: null,
    } as unknown as KeyboardEvent)
    keydown?.({
      key: 'Y',
      preventDefault,
      shiftKey: true,
      target: null,
    } as unknown as KeyboardEvent)
    keydown?.({
      key: 'Enter',
      preventDefault,
      shiftKey: false,
      target: { tagName: 'INPUT' },
    } as unknown as KeyboardEvent)

    expect(onConfirm).toHaveBeenCalledTimes(1)
    expect(onMoveMonth).toHaveBeenCalledWith(-12)
    expect(onFocusDate).toHaveBeenCalledWith(new Date(2026, 0, 1))
    expect(onFocusDate).toHaveBeenCalledWith(new Date(2026, 0, 31))
    expect(onOpenMonthMenu).toHaveBeenCalled()
    expect(onOpenYearMenu).toHaveBeenCalled()
  } finally {
    Platform.OS = previousPlatform
    globalThis.window = previousWindow as Window & typeof globalThis
  }
})
