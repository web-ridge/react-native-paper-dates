import { render } from '@testing-library/react-native'
import { Platform } from 'react-native'

import DatePickerDocked, { placeDockedCard } from '../../Date/DatePickerDocked'
import DatePickerInput from '../../Date/DatePickerInput'
import { useDatePickerKeys } from '../../Date/datePickerKeys'
import { pressTestId } from '../../testUtils'

const anchor = { height: 56, width: 320, x: 24, y: 80 }

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
