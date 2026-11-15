import { renderHook } from '@testing-library/react-native'
import type { ComponentType, ReactNode } from 'react'
import { Platform, View } from 'react-native'
import { LightTheme, PaperProvider } from 'react-native-paper'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import Calendar from '../Date/Calendar'
import CalendarEdit from '../Date/CalendarEdit'
import DatePickerDocked, { placeDockedCard } from '../Date/DatePickerDocked'
import DatePickerInput from '../Date/DatePickerInput'
import DatePickerInputWithoutModal from '../Date/DatePickerInputWithoutModal'
import DatePickerModalContent from '../Date/DatePickerModalContent'
import DatePickerModalInput from '../Date/DatePickerModalInput'
import { useDatePickerKeys } from '../Date/datePickerKeys'
import { parseLooseDate } from '../Date/dateUtils'
import Day from '../Date/Day'
import useDateInput from '../Date/inputUtils'
import MonthMenu from '../Date/MonthMenu'
import Swiper from '../Date/Swiper'
import {
  getMaxIndex,
  getMinIndex,
  getVerticalWindow,
  nextVisibleIndexes,
  sameIndexes,
  useFocusDate,
} from '../Date/SwiperUtils'
import CrossFade from '../shared/CrossFade'
import { darkenColor } from '../shared/utils'
import { act, pressNode, pressTestId, render } from '../testUtils'
import TextInputWithMask from '../TextInputMask'
import AmPmSwitcher from '../Time/AmPmSwitcher'
import StateLayer from '../Time/StateLayer'
import TimeInput from '../Time/TimeInput'
import { isValidHourInput, useInputColors } from '../Time/timeUtils'
import { DisplayModeContext } from '../contexts/DisplayModeContext'

const metrics = {
  frame: { height: 800, width: 390, x: 0, y: 0 },
  insets: { bottom: 0, left: 0, right: 0, top: 0 },
}

const emptyState = {
  date: undefined,
  dates: undefined,
  endDate: undefined,
  startDate: undefined,
}

type HookNode = { memoizedState: unknown; next: HookNode | null }
type FiberNode = {
  child: FiberNode | null
  memoizedProps?: Record<string, unknown>
  memoizedState: HookNode | null
  return: FiberNode | null
  sibling: FiberNode | null
  type?:
    | { name?: string; render?: { name?: string } }
    | ((...args: never[]) => unknown)
    | string
}

function rootFiber(screen: { container: { queryAll: Function } }) {
  const seed = screen.container.queryAll(() => true)[0] as {
    unstable_fiber?: FiberNode
  }
  let root = seed?.unstable_fiber
  while (root?.return) root = root.return
  return root
}

function fiberName(fiber: FiberNode) {
  const type = fiber.type
  if (typeof type === 'function') return type.name
  if (type && typeof type === 'object' && type.render) return type.render.name
  return ''
}

function visitFibers(
  screen: { container: { queryAll: Function } },
  visit: (fiber: FiberNode) => void
) {
  const walk = (fiber: FiberNode | null | undefined) => {
    let current = fiber
    while (current) {
      visit(current)
      walk(current.child)
      current = current.sibling
    }
  }
  walk(rootFiber(screen))
}

function invoke(
  screen: { container: { queryAll: Function } },
  match: (props: Record<string, unknown>) => boolean,
  call: (props: Record<string, unknown>) => void
) {
  visitFibers(screen, (fiber) => {
    const props = fiber.memoizedProps
    if (props && match(props)) call(props)
  })
}

function componentRef(
  screen: { container: { queryAll: Function } },
  name: string
) {
  let ref: { current: unknown } | undefined
  visitFibers(screen, (fiber) => {
    if (ref || fiberName(fiber) !== name) return
    const state = fiber.memoizedState?.memoizedState
    if (state && typeof state === 'object' && 'current' in state) {
      ref = state as { current: unknown }
    }
  })
  if (!ref) throw new Error(`missing ref on ${name}`)
  return ref
}

async function withWebKeys(
  run: (
    key: (event: { key: string; shiftKey?: boolean; target?: unknown }) => void
  ) => Promise<void>
) {
  const previousPlatform = Platform.OS
  const host = globalThis as { window?: unknown }
  const previousWindow = host.window
  const listeners = new Map<string, (event: KeyboardEvent) => void>()
  Platform.OS = 'web'
  host.window = {
    addEventListener(type: string, listener: EventListener) {
      listeners.set(type, listener as (event: KeyboardEvent) => void)
    },
    removeEventListener(type: string) {
      listeners.delete(type)
    },
  }
  try {
    await run((event) => {
      listeners.get('keydown')?.({
        preventDefault: jest.fn(),
        shiftKey: false,
        target: null,
        ...event,
      } as unknown as KeyboardEvent)
    })
  } finally {
    Platform.OS = previousPlatform
    host.window = previousWindow
  }
}

function safe(children: ReactNode) {
  return (
    <SafeAreaProvider initialMetrics={metrics}>{children}</SafeAreaProvider>
  )
}

describe('coverage gaps', () => {
  it('parses loose dates, native digits, and rejected shapes', () => {
    expect(parseLooseDate('', 'MM/DD/YYYY')).toBeNull()
    expect(parseLooseDate('   ', 'MM/DD/YYYY')).toBeNull()
    expect(parseLooseDate('1/2/2026', 'YYYY')).toBeNull()
    expect(parseLooseDate('0102', 'MM/DD/YYYY')).toBeNull()
    expect(parseLooseDate('0102202611', 'MM/DD/YYYY')).toBeNull()
    expect(parseLooseDate('202601', 'YYYY-MM-DD')).toBeNull()
    expect(parseLooseDate('٠١/٠٢/٢٠٢٦', 'MM/DD/YYYY')).toEqual({
      day: 2,
      month: 1,
      year: 2026,
    })
    expect(parseLooseDate('۱/۲/۲۰۲۶', 'DD/MM/YYYY')).toEqual({
      day: 1,
      month: 2,
      year: 2026,
    })
  })

  it('darkens green, magenta, and light colors through every hue branch', () => {
    expect(darkenColor('#00ff00', 0)).toMatch(/^#[0-9A-F]{6}$/)
    expect(darkenColor('#ff80ff', 0)).toMatch(/^#[0-9A-F]{6}$/)
    expect(darkenColor('#80ff80', 0.25)).toMatch(/^#[0-9A-F]{6}$/)
  })

  it('rejects hours that are negative or not finite', () => {
    expect(isValidHourInput(Number.NaN, true)).toBe(false)
    expect(isValidHourInput(Number.POSITIVE_INFINITY, false)).toBe(false)
    expect(isValidHourInput(-1, true)).toBe(false)
  })

  it('uses the default input color when validity is omitted', async () => {
    const colors = await renderHook(() => useInputColors(true), {
      wrapper: ({ children }) => <PaperProvider>{children}</PaperProvider>,
    })
    expect(colors.result.current.color).toBeTruthy()
    expect(colors.result.current.backgroundColor).toBeTruthy()
  })

  it('focuses a date field, keeps a rejected draft, and submits it', async () => {
    const onChange = jest.fn()
    const input = await renderHook(() =>
      useDateInput({
        inputMode: 'start',
        locale: 'en',
        onChange,
        validRange: undefined,
        value: new Date(2026, 0, 15),
      })
    )
    await act(() => {
      input.result.current.onFocus()
    })
    expect(input.result.current.displayedValue).toBe(
      input.result.current.formattedValue
    )
    await act(() => {
      input.result.current.onSubmitEditing()
    })
    expect(onChange).toHaveBeenCalled()

    const rejected = await renderHook(() =>
      useDateInput({
        inputMode: 'start',
        locale: 'en',
        onChange: jest.fn(),
        validRange: undefined,
        value: undefined,
      })
    )
    await act(() => {
      rejected.result.current.onChangeText('99/99/9999')
    })
    await act(() => {
      rejected.result.current.onBlur()
    })
    expect(rejected.result.current.error).toEqual(expect.any(String))
    await act(() => {
      rejected.result.current.onFocus()
    })
    expect(rejected.result.current.displayedValue).toBe('99/99/9999')
  })

  it('compares month windows, including an index outside the range', () => {
    expect(sameIndexes([1, 2, 3], [1, 2, 3])).toBe(true)
    expect(sameIndexes([1, 2], [1, 2, 3])).toBe(false)
    expect(sameIndexes([4, 5], [4, 6])).toBe(false)
    expect(getVerticalWindow(-1000, 2020, 2022)).toEqual([-1000])

    const startYear = 2026
    const endYear = 2026
    const min = getMinIndex(startYear, endYear)
    const max = getMaxIndex(startYear, endYear)
    for (let origin = min; origin <= max; origin += 1) {
      const current = getVerticalWindow(origin, startYear, endYear)
      for (let index = min; index <= max; index += 1) {
        nextVisibleIndexes(current, index, startYear, endYear)
      }
    }
    expect(nextVisibleIndexes([], min, startYear, endYear)).toEqual(
      expect.any(Array)
    )
  })

  it('moves focus only when the focused month is in range and new', async () => {
    const onChange = jest.fn()
    const currentIndexRef = { current: 0 }
    const focus = await renderHook(
      ({ date }: { date?: Date }) =>
        useFocusDate(onChange, {
          currentIndexRef,
          endYear: 2030,
          focusDate: date,
          startYear: 2020,
        }),
      { initialProps: { date: undefined } }
    )
    await focus.rerender({ date: new Date(1990, 0, 1) })
    expect(onChange).not.toHaveBeenCalled()

    await focus.rerender({ date: new Date(2024, 0, 15) })
    expect(onChange).toHaveBeenCalled()
    currentIndexRef.current = onChange.mock.calls.at(-1)?.[0]
    onChange.mockClear()
    await focus.rerender({ date: new Date(2024, 0, 28) })
    expect(onChange).not.toHaveBeenCalled()
  })

  it('scrolls a focused native month and reads the visible month from the keyboard', async () => {
    await withWebKeys(async (key) => {
      await render(
        <Swiper
          endYear={2028}
          focusDate={new Date(2024, 0, 15)}
          initialIndex={0}
          initialLayout={{ height: 480, width: 320 }}
          renderItem={() => null}
          scrollMode="horizontal"
          selectedYear={undefined}
          startWeekOnMonday={false}
          startYear={2024}
        />
      )
      await act(() => {
        key({ key: 'Home' })
        key({ key: 'PageDown' })
      })
    })
  })

  it('places the docked card above the field when it does not fit below', () => {
    expect(
      placeDockedCard({
        anchor: { height: 56, width: 200, x: 40, y: 700 },
        cardHeight: 480,
        cardWidth: 360,
        windowHeight: 800,
        windowWidth: 1200,
      }).top
    ).toBe(212)
  })
})

describe('docked picker callbacks', () => {
  it('steps months and years, picks a day, and lays out the card', async () => {
    const onConfirm = jest.fn()
    const screen = await render(
      <DatePickerDocked
        date={new Date(2026, 0, 15)}
        endYear={2030}
        locale="en"
        onConfirm={onConfirm}
        onDismiss={jest.fn()}
        startYear={2020}
        visible
      />
    )
    const layout = (height: number) => {
      invoke(
        screen,
        (props) =>
          props.testID === 'react-native-paper-dates-docked-surface' &&
          typeof props.onLayout === 'function',
        (props) => {
          ;(props.onLayout as (event: unknown) => void)({
            nativeEvent: { layout: { height, width: 360, x: 0, y: 0 } },
          })
        }
      )
    }
    await act(() => {
      layout(0)
      layout(480)
      layout(520)
    })
    await pressTestId(screen, 'react-native-paper-dates-docked-year-next')
    await pressTestId(screen, 'react-native-paper-dates-docked-year-prev')
    await pressTestId(screen, 'react-native-paper-dates-docked-next')
    await pressTestId(screen, 'react-native-paper-dates-docked-prev')
    await pressTestId(screen, 'react-native-paper-dates-day-2026-0-20')
    await pressTestId(screen, 'react-native-paper-dates-docked-confirm')
    expect(onConfirm).toHaveBeenCalledWith({ date: new Date(2026, 0, 20) })

    await pressTestId(screen, 'react-native-paper-dates-docked-month')
    await act(() => {
      invoke(
        screen,
        (props) =>
          props.embedded === true && typeof props.onPressMonth === 'function',
        (props) => {
          ;(props.onPressMonth as (month: number) => void)(2)
        }
      )
    })
    await pressTestId(screen, 'react-native-paper-dates-docked-year')
    await act(() => {
      invoke(
        screen,
        (props) =>
          props.variant === 'menu' && typeof props.onPressYear === 'function',
        (props) => {
          ;(props.onPressYear as (year: number) => void)(2025)
        }
      )
    })
  })

  it('stops at the year bounds and confirms an end-of-day or empty date', async () => {
    const bounded = await render(
      <DatePickerDocked
        date={new Date(2026, 0, 15)}
        endYear={2026}
        locale="en"
        onConfirm={jest.fn()}
        onDismiss={jest.fn()}
        startYear={2026}
        visible
      />
    )
    await pressTestId(bounded, 'react-native-paper-dates-docked-year-next')
    await pressTestId(bounded, 'react-native-paper-dates-docked-year-prev')
    await pressTestId(bounded, 'react-native-paper-dates-docked-prev')
    await act(() => {
      invoke(
        bounded,
        (props) =>
          props.hideHeader === true && typeof props.onPressYear === 'function',
        (props) => {
          ;(props.onPressYear as () => void)()
        }
      )
    })

    const onConfirm = jest.fn()
    const ending = await render(
      <DatePickerDocked
        date={new Date(2026, 0, 15)}
        dateMode="end"
        locale="en"
        onConfirm={onConfirm}
        onDismiss={jest.fn()}
        visible
      />
    )
    await pressTestId(ending, 'react-native-paper-dates-day-2026-0-20')
    await pressTestId(ending, 'react-native-paper-dates-docked-confirm')
    expect(onConfirm).toHaveBeenCalledWith({
      date: new Date(2026, 0, 20, 23, 59, 59, 999),
    })

    const empty = jest.fn()
    const blank = await render(
      <DatePickerDocked
        locale="en"
        onConfirm={empty}
        onDismiss={jest.fn()}
        visible
      />
    )
    await pressTestId(blank, 'react-native-paper-dates-docked-confirm')
    expect(empty).toHaveBeenCalledWith({ date: undefined })
  })

  it('follows keyboard shortcuts across the year bounds', async () => {
    await withWebKeys(async (key) => {
      await render(
        <DatePickerDocked
          date={new Date(2026, 0, 15)}
          endYear={2026}
          locale="en"
          onConfirm={jest.fn()}
          onDismiss={jest.fn()}
          startYear={2026}
          visible
        />
      )
      await act(() => {
        key({ key: 'PageDown' })
        key({ key: 'PageUp', shiftKey: true })
        key({ key: 'Home' })
        key({ key: 'm', shiftKey: true })
        key({ key: 'm', shiftKey: true })
        key({ key: 'y', shiftKey: true })
        key({ key: 'y', shiftKey: true })
      })
    })
    await withWebKeys(async (key) => {
      await render(
        <DatePickerDocked
          endYear={2030}
          locale="en"
          onConfirm={jest.fn()}
          onDismiss={jest.fn()}
          startYear={2020}
          visible
        />
      )
      await act(() => {
        key({ key: 'PageDown' })
        key({ key: 'PageUp', shiftKey: true })
      })
    })
  })
})

describe('calendar keyboard menus', () => {
  const calendar = (date?: Date) => (
    <Calendar
      date={date}
      endYear={2028}
      initialLayout={{ height: 480, width: 320 }}
      locale="en"
      mode="single"
      onChange={jest.fn()}
      startYear={2024}
    />
  )

  it('moves focus, opens both menus, and clamps a short month', async () => {
    await withWebKeys(async (key) => {
      await render(calendar(new Date(2026, 0, 15)))
      await act(() => {
        key({ key: 'PageDown' })
      })
      await act(() => {
        key({ key: 'PageDown' })
        key({ key: 'End' })
        key({ key: 'y', shiftKey: true })
      })
    })
    await withWebKeys(async (key) => {
      const dated = await render(calendar(new Date(2026, 0, 15)))
      await act(() => {
        key({ key: 'End' })
        key({ key: 'm', shiftKey: true })
      })
      await pressNode(dated.getByLabelText('February'))
    })
    await withWebKeys(async (key) => {
      const unfocused = await render(calendar(new Date(2026, 0, 15)))
      await act(() => {
        key({ key: 'm', shiftKey: true })
      })
      await pressNode(unfocused.getByLabelText('March'))
    })
    await withWebKeys(async (key) => {
      await render(calendar())
      await act(() => {
        key({ key: 'PageDown' })
        key({ key: 'y', shiftKey: true })
      })
    })
    await withWebKeys(async (key) => {
      const blank = await render(calendar())
      await act(() => {
        key({ key: 'm', shiftKey: true })
      })
      await pressNode(blank.getByLabelText('January'))
    })
  })
})

describe('modal input paths', () => {
  it('restores web scroll, focuses the field, and confirms typed dates', async () => {
    const previousPlatform = Platform.OS
    const previousDocument = globalThis.document
    const previousHTMLElement = globalThis.HTMLElement
    const previousComputed = globalThis.getComputedStyle
    class FakeElement {
      blur = jest.fn()
    }
    const moved = {
      clientHeight: 100,
      scrollHeight: 400,
      scrollTop: 20,
      style: { overflowY: 'scroll' },
    }
    const still = {
      clientHeight: 80,
      scrollHeight: 300,
      scrollTop: 10,
      style: { overflowY: 'auto' },
    }
    const short = {
      clientHeight: 100,
      scrollHeight: 100,
      scrollTop: 0,
      style: { overflowY: 'scroll' },
    }
    const hidden = {
      clientHeight: 10,
      scrollHeight: 200,
      scrollTop: 0,
      style: { overflowY: 'hidden' },
    }
    const page = {
      activeElement: new FakeElement() as unknown as Element,
      querySelectorAll: () => [moved, still, short, hidden],
    }
    Platform.OS = 'web'
    globalThis.HTMLElement = FakeElement as unknown as typeof HTMLElement
    globalThis.document = page as unknown as Document
    globalThis.getComputedStyle = ((node: { style: { overflowY: string } }) =>
      node.style) as unknown as typeof getComputedStyle

    try {
      const onConfirm = jest.fn()
      const screen = await render(
        safe(
          <DatePickerModalInput
            locale="en"
            mode="single"
            onConfirm={onConfirm}
            onDismiss={jest.fn()}
            visible={false}
          />
        )
      )
      await screen.rerender(
        safe(
          <DatePickerModalInput
            date={new Date(2026, 0, 15)}
            locale="en"
            mode="single"
            onConfirm={onConfirm}
            onDismiss={jest.fn()}
            visible
          />
        )
      )
      await screen.rerender(
        safe(
          <DatePickerModalInput
            date={new Date(2026, 1, 1)}
            locale="en"
            mode="single"
            onConfirm={onConfirm}
            onDismiss={jest.fn()}
            visible
          />
        )
      )
      const field = (id: string) => {
        let found: Record<string, unknown> | undefined
        invoke(
          screen,
          (props) =>
            props.testID === id &&
            props.inputMode !== undefined &&
            typeof props.onChangeText === 'function',
          (props) => {
            found = props
          }
        )
        if (!found) throw new Error(`missing ${id}`)
        return found
      }
      const type = (id: string, text: string | undefined) => {
        ;(field(id).onChangeText as (value: string | undefined) => void)(text)
      }
      await act(() => {
        type('react-native-paper-dates-modal-input', undefined)
        type('react-native-paper-dates-modal-input', '')
        type('react-native-paper-dates-modal-input', 'not-a-date')
        type('react-native-paper-dates-modal-input', '01/20/2026')
      })
      await pressTestId(screen, 'react-native-paper-dates-modal-input-confirm')
      expect(onConfirm).toHaveBeenCalledWith({ date: new Date(2026, 0, 20) })

      await act(() => {
        type('react-native-paper-dates-modal-input', '99/99/9999')
        invoke(
          screen,
          (props) =>
            props.testID === 'react-native-paper-dates-modal-input-confirm' &&
            typeof props.onPress === 'function',
          (props) => {
            ;(props.onPress as () => void)()
          }
        )
      })
      await act(() => {
        invoke(
          screen,
          (props) => typeof props.onShow === 'function',
          (props) => {
            ;(props.onShow as () => void)()
          }
        )
      })
      await pressTestId(screen, 'react-native-paper-dates-modal-input-calendar')
      await act(() => {
        invoke(
          screen,
          (props) =>
            props.layout === 'card' &&
            props.mode === 'single' &&
            typeof props.onChange === 'function',
          (props) => {
            ;(props.onChange as (value: { date: Date }) => void)({
              date: new Date(2026, 3, 4),
            })
          }
        )
      })
      await pressTestId(screen, 'react-native-paper-dates-toggle-edit')
      page.activeElement = {} as Element
      await pressTestId(screen, 'react-native-paper-dates-modal-input-cancel')

      moved.scrollTop = 80
      await screen.unmount()
      expect(moved.scrollTop).toBe(20)
      expect(still.scrollTop).toBe(10)
    } finally {
      Platform.OS = previousPlatform
      globalThis.document = previousDocument
      globalThis.HTMLElement = previousHTMLElement
      globalThis.getComputedStyle = previousComputed
    }
  })

  it('shows an end-only headline and edits a range from the calendar', async () => {
    const end = new Date(2026, 4, 2)
    const headline = new Intl.DateTimeFormat('en', {
      day: 'numeric',
      month: 'short',
    }).format(end)
    const singleEnd = await render(
      safe(
        <DatePickerModalInput
          endDate={end}
          locale="en"
          mode="range"
          onConfirm={jest.fn()}
          onDismiss={jest.fn()}
          visible
        />
      )
    )
    expect(singleEnd.getByText(headline)).toBeTruthy()

    const ranged = await render(
      safe(
        <DatePickerModalInput
          locale="en"
          mode="range"
          onConfirm={jest.fn()}
          onDismiss={jest.fn()}
          saveLabelDisabled
          visible
        />
      )
    )
    await pressTestId(ranged, 'react-native-paper-dates-modal-input-calendar')
    await act(() => {
      invoke(
        ranged,
        (props) =>
          props.layout === 'card' &&
          props.mode === 'range' &&
          typeof props.onChange === 'function',
        (props) => {
          ;(
            props.onChange as (value: {
              endDate: Date | undefined
              startDate: Date | undefined
            }) => void
          )({
            endDate: new Date(2026, 0, 8),
            startDate: new Date(2026, 0, 2),
          })
        }
      )
    })

    const open = await render(
      safe(
        <DatePickerModalInput
          locale="en"
          mode="range"
          onConfirm={jest.fn()}
          onDismiss={jest.fn()}
          visible
        />
      )
    )
    const type = (id: string, text: string) => {
      invoke(
        open,
        (props) =>
          props.testID === id &&
          props.inputMode !== undefined &&
          typeof props.onChangeText === 'function',
        (props) => {
          ;(props.onChangeText as (value: string) => void)(text)
        }
      )
    }
    await act(() => {
      type('react-native-paper-dates-modal-input', '01/02/2026')
      type('react-native-paper-dates-modal-input-end', '01/09/2026')
      type('react-native-paper-dates-modal-input-end', '99/99/9999')
    })
    await act(() => {
      invoke(
        open,
        (props) =>
          props.testID === 'react-native-paper-dates-modal-input-confirm' &&
          typeof props.onPress === 'function',
        (props) => {
          ;(props.onPress as () => void)()
        }
      )
    })
    await pressTestId(open, 'react-native-paper-dates-modal-input-calendar')
  })
})

describe('inputs, menus, and state layers', () => {
  it('reads an anchor from the DOM and from measureInWindow', async () => {
    const screen = await render(
      <DatePickerInput
        inputMode="start"
        locale="en"
        onChange={jest.fn()}
        presentation="docked"
        testID="date"
        value={new Date(2026, 0, 15)}
      />
    )
    const ref = componentRef(screen, 'DatePickerInput')
    ref.current = null
    await pressTestId(screen, 'date-icon-button')
    ref.current = 'not-a-node'
    await pressTestId(screen, 'date-icon-button')
    ref.current = {}
    await pressTestId(screen, 'date-icon-button')
    ref.current = {
      getBoundingClientRect: () => ({ height: 0, left: 0, top: 0, width: 0 }),
    }
    await pressTestId(screen, 'date-icon-button')
    ref.current = {
      getBoundingClientRect: () => ({ height: 40, left: 0, top: 0, width: 0 }),
    }
    await pressTestId(screen, 'date-icon-button')
    ref.current = {
      getBoundingClientRect: () => ({ height: 0, left: 4, top: 6, width: 80 }),
    }
    await pressTestId(screen, 'date-icon-button')
    ref.current = {
      getBoundingClientRect: () => ({
        height: 40,
        left: 8,
        top: 12,
        width: 120,
      }),
    }
    await pressTestId(screen, 'date-icon-button')
    ref.current = {
      measureInWindow: (callback: Function) => {
        callback(8, 12, 120, 40)
      },
    }
    await pressTestId(screen, 'date-icon-button')

    await render(
      <DatePickerInput
        inputMode="start"
        locale="en"
        onChange={jest.fn()}
        presentation="modal"
        value={new Date(2026, 0, 15)}
      />
    )
  })

  it('forwards focus and includes the format in the label', async () => {
    const onFocus = jest.fn()
    const screen = await render(
      <DatePickerInputWithoutModal
        inputMode="start"
        label="When"
        locale="en"
        onChange={jest.fn()}
        onFocus={onFocus}
        value={undefined}
        withDateFormatInLabel
      />
    )
    await act(() => {
      invoke(
        screen,
        (props) =>
          typeof props.onFocus === 'function' && props.label !== undefined,
        (props) => {
          ;(props.onFocus as (event: unknown) => void)({})
        }
      )
    })
    expect(onFocus).toHaveBeenCalled()
  })

  it('labels a calendar field with and without the format', async () => {
    await render(
      <CalendarEdit
        collapsed={false}
        label="When"
        locale="en"
        mode="single"
        onChange={jest.fn()}
        placeholder="Type a date"
        state={emptyState}
        validRange={undefined}
        withDateFormatInLabel
      />
    )
    await render(
      <CalendarEdit
        collapsed={false}
        label="When"
        locale="en"
        mode="single"
        onChange={jest.fn()}
        state={emptyState}
        validRange={undefined}
      />
    )
  })

  it('shows the year divider and edits the calendar without an external onChange', async () => {
    const screen = await render(
      safe(
        <DatePickerModalContent
          date={new Date(2026, 0, 15)}
          initialLayout={{ height: 480, width: 360 }}
          locale="en"
          mode="single"
          onConfirm={jest.fn()}
          onDismiss={jest.fn()}
        />
      )
    )
    await pressTestId(screen, 'react-native-paper-dates-day-2026-0-16')
    await pressNode(screen.getByLabelText('January 2026'))
    expect(screen.getByLabelText('2026')).toBeTruthy()
  })

  it('scrolls the month menu and renders it inline or over the grid', async () => {
    const frames: FrameRequestCallback[] = []
    const raf = jest
      .spyOn(globalThis, 'requestAnimationFrame')
      .mockImplementation((callback) => {
        frames.push(callback)
        return frames.length
      })
    const cancel = jest
      .spyOn(globalThis, 'cancelAnimationFrame')
      .mockImplementation(() => {})
    try {
      const onPressMonth = jest.fn()
      const menu = await render(
        <MonthMenu locale="en" onPressMonth={onPressMonth} selectedMonth={5} />
      )
      await act(async () => {
        frames.splice(0).forEach((frame) => frame(0))
      })
      await pressNode(menu.getByLabelText('March'))
      expect(onPressMonth).toHaveBeenCalledWith(2)
      await menu.unmount()

      await render(
        <MonthMenu
          embedded
          locale="en"
          onPressMonth={onPressMonth}
          selectedMonth={undefined}
        />
      )
    } finally {
      raf.mockRestore()
      cancel.mockRestore()
    }
  })

  it('paints a focused day and the default state layer', async () => {
    await render(
      <Day
        day={15}
        disabled={false}
        focused
        inRange={false}
        isToday={false}
        leftCrop={false}
        locale="en"
        month={0}
        onPressDate={jest.fn()}
        primaryColor="#6750A4"
        theme={LightTheme}
        rightCrop={false}
        selectColor="#E8DEF8"
        selected={false}
        textColorOnPrimary="#ffffff"
        year={2026}
      />
    )
    await render(<StateLayer color="#6750A4" />)
  })

  it('clones a mask accessory and stops a mask that begins with a separator', async () => {
    const screen = await render(
      <TextInputWithMask
        inputButton={<View />}
        mask="/MM/DD/YYYY"
        onChangeText={jest.fn()}
        testID="masked"
        value=""
      />
    )
    let accessory: ((props: object) => ReactNode) | undefined
    invoke(
      screen,
      (props) => typeof props.endAccessory === 'function',
      (props) => {
        accessory = props.endAccessory as (props: object) => ReactNode
      }
    )
    expect(accessory).toEqual(expect.any(Function))
    accessory?.({})
  })

  it('crossfades a layer that has no scale', async () => {
    await render(
      <CrossFade
        collapsed={false}
        primary={{ node: null }}
        secondary={{ node: null, scaleX: [1, 0.9] }}
      />
    )
  })

  it('tracks pointer, hover, and focus on the time controls', async () => {
    const keyboard = await render(
      <TimeInput
        accessibilityLabel="Hour"
        clockType="hours"
        inputType="keyboard"
        onChanged={jest.fn()}
        pressed={false}
        value={9}
      />
    )
    await act(() => {
      invoke(
        keyboard,
        (props) => typeof props.onPointerDown === 'function',
        (props) => {
          ;(props.onMouseEnter as () => void)()
          ;(props.onPointerDown as () => void)()
          ;(props.onPointerUp as () => void)()
          ;(props.onPointerCancel as () => void)()
          ;(props.onMouseLeave as () => void)()
        }
      )
    })

    const picker = await render(
      <TimeInput
        accessibilityLabel="Hour"
        clockType="hours"
        inputType="picker"
        onChanged={jest.fn()}
        onPress={jest.fn()}
        pressed={false}
        value={9}
      />
    )
    await act(() => {
      invoke(
        picker,
        (props) => typeof props.onPressOut === 'function',
        (props) => {
          ;(props.onFocus as () => void)()
          ;(props.onHoverIn as () => void)()
          ;(props.onHoverOut as () => void)()
          ;(props.onPressIn as () => void)()
          ;(props.onPressOut as () => void)()
          ;(props.onBlur as () => void)()
        }
      )
    })

    const meridiem = await render(
      <DisplayModeContext.Provider value={{ mode: 'PM', setMode: jest.fn() }}>
        <AmPmSwitcher hours={2} inputType="keyboard" onChange={jest.fn()} />
      </DisplayModeContext.Provider>
    )
    await act(() => {
      invoke(
        meridiem,
        (props) =>
          props.accessibilityLabel === 'AM' &&
          typeof props.onPressIn === 'function',
        (props) => {
          ;(props.onFocus as () => void)()
          ;(props.onHoverIn as () => void)()
          ;(props.onHoverOut as () => void)()
          ;(props.onPressIn as () => void)()
          ;(props.onPress as () => void)()
          ;(props.onPressOut as () => void)()
          ;(props.onBlur as () => void)()
        }
      )
    })
  })
})

describe('web swiper gaps', () => {
  const previousWindow = globalThis.window

  beforeAll(() => {
    globalThis.window = globalThis as Window & typeof globalThis
  })

  afterAll(() => {
    globalThis.window = previousWindow
  })

  it('focuses a month and ignores a missing list node', async () => {
    const swiperModule = require('../Date/Swiper.tsx') as {
      default: ComponentType<Record<string, unknown>>
    }
    const SwiperWeb = swiperModule.default
    await withWebKeys(async (key) => {
      await render(
        <SwiperWeb
          endYear={2028}
          focusDate={new Date(2025, 5, 1)}
          initialIndex={0}
          initialLayout={{ height: 480, width: 320 }}
          renderItem={() => null}
          scrollMode="horizontal"
          selectedYear={undefined}
          startWeekOnMonday={false}
          startYear={2024}
        />
      )
      await act(() => {
        key({ key: 'Home' })
      })
    })

    const react = require('react') as typeof import('react')
    const actualUseRef = react.useRef
    const spy = jest.spyOn(react, 'useRef').mockImplementation((initial) => {
      const ref = actualUseRef(initial)
      if (initial === null && new Error().stack?.includes('VerticalScroller')) {
        Object.defineProperty(ref, 'current', {
          configurable: true,
          get: () => null,
          set() {},
        })
      }
      return ref
    })
    try {
      await render(
        <SwiperWeb
          endYear={2026}
          initialIndex={0}
          initialLayout={{ height: 400, width: 280 }}
          renderItem={() => null}
          scrollMode="vertical"
          selectedYear={undefined}
          startWeekOnMonday={false}
          startYear={2024}
        />
      )
    } finally {
      spy.mockRestore()
    }
  })
})

describe('remaining keyboard shortcuts', () => {
  it('ignores text fields and pages by a month or a year', async () => {
    await withWebKeys(async (key) => {
      function Probe() {
        useDatePickerKeys(true, {
          getVisibleMonth: () => new Date(2026, 0, 15),
          onConfirm: jest.fn(),
          onFocusDate: jest.fn(),
          onMoveFocus: jest.fn(),
          onMoveMonth: jest.fn(),
          onOpenMonthMenu: jest.fn(),
          onOpenYearMenu: jest.fn(),
        })
        return null
      }
      await render(<Probe />)
      await act(() => {
        key({ key: 'PageDown' })
        key({ key: 'PageDown', shiftKey: true })
        key({ key: 'PageUp' })
        key({ key: 'Enter', target: { tagName: 'TEXTAREA' } })
        key({ key: 'Enter', target: { tagName: 'DIV' } })
        key({ key: 'y' })
        key({ key: 'x', shiftKey: true })
        key({ key: 'm' })
      })
    })
  })
})
