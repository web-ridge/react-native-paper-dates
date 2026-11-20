import { Dimensions } from 'react-native'

import DatePickerDocked, { placeDockedCard } from '../Date/DatePickerDocked'
import DatePickerInputWithoutModal from '../Date/DatePickerInputWithoutModal'
import DatePickerModalContentHeader from '../Date/DatePickerModalContentHeader'
import SelectionMenuItem from '../Date/SelectionMenuItem'
import { DisplayModeContext } from '../contexts/DisplayModeContext'
import AnalogClock from '../Time/AnalogClock'
import AmPmSwitcher from '../Time/AmPmSwitcher'
import ScrollTimePicker from '../Time/ScrollTimePicker'
import TimeInput from '../Time/TimeInput'
import TimePicker from '../Time/TimePicker'
import TimePickerModal from '../Time/TimePickerModal'
import {
  circleSize,
  getAngle,
  getHours,
  getHourType,
  getHourTypeFromOffset,
  getMinutes,
  hourTypes,
  inputTypes,
} from '../Time/timeUtils'
import { act, fireEvent, render, walkFibers } from '../testUtils'

const savedWindow = Dimensions.get('window')

afterEach(async () => {
  await act(async () => {
    Dimensions.set({ screen: savedWindow, window: savedWindow })
  })
})

type FiberNode = {
  child: FiberNode | null
  memoizedProps?: Record<string, unknown>
  pendingProps?: Record<string, unknown>
  return: FiberNode | null
  sibling: FiberNode | null
}

type HostNode = {
  props: Record<string, unknown>
  unstable_fiber?: FiberNode | null
}

function walk(fiber: FiberNode | null, visit: (fiber: FiberNode) => void) {
  walkFibers(fiber, visit)
}

function rootOf(node: HostNode) {
  let fiber = node.unstable_fiber ?? null
  while (fiber?.return) fiber = fiber.return
  return fiber
}

function focusRings(screen: { container: { queryAll: Function } }) {
  return hosts(screen, (node) => {
    const style = node.props.style
    const parts = (Array.isArray(style) ? style.flat(4) : [style]) as Array<
      { borderWidth?: number } | null | undefined
    >
    return parts.some((part) => part?.borderWidth === 3)
  })
}

function handler(node: HostNode, name: string) {
  const own = node.props[name]
  if (typeof own === 'function') return own as (...args: unknown[]) => void
  let fiber = node.unstable_fiber ?? null
  for (let depth = 0; fiber && depth < 16; depth += 1, fiber = fiber.return) {
    const props = fiber.memoizedProps ?? fiber.pendingProps
    const value = props?.[name]
    if (typeof value === 'function') {
      return value as (...args: unknown[]) => void
    }
  }
  throw new Error(`missing ${name}`)
}

function hosts(
  screen: { container: { queryAll: Function } },
  match: (node: HostNode) => boolean
) {
  return screen.container.queryAll(match) as HostNode[]
}

async function setWindow(width: number, height: number) {
  await act(async () => {
    Dimensions.set({
      screen: { fontScale: 1, height, scale: 1, width },
      window: { fontScale: 1, height, scale: 1, width },
    })
  })
}

function hourPick(
  x: number,
  y: number,
  hours: number,
  is24Hour: boolean,
  mode: 'AM' | 'PM'
) {
  const hours12AndPm = !is24Hour && mode === 'PM'
  const hours24AndPM =
    is24Hour && getHourTypeFromOffset(x, y, circleSize) === hourTypes.pm
  let picked = getHours(getAngle(x, y, circleSize), getHourType(hours))
  if (hours12AndPm || hours24AndPM) picked += 12
  const atTwelveCheck = picked
  if ((mode === 'AM' || is24Hour) && picked === 12) picked = 0
  const atDayCheck = picked
  return { atDayCheck, atTwelveCheck, hours12AndPm, hours24AndPM }
}

function point(label: string, accept: (x: number, y: number) => boolean) {
  for (let y = 0; y <= circleSize; y += 1) {
    for (let x = 0; x <= circleSize; x += 1) {
      if (accept(x, y)) return { x, y }
    }
  }
  throw new Error(`no clock point for ${label}`)
}

function clock(options: {
  disabled?: boolean
  focused?: 'hours' | 'minutes'
  hours: number
  is24Hour: boolean
  minutes?: number
  mode?: 'AM' | 'PM'
  onChange: (value: unknown) => void
}) {
  return (
    <DisplayModeContext.Provider
      value={{ mode: options.mode ?? 'AM', setMode: () => undefined }}
    >
      <AnalogClock
        disabled={options.disabled}
        focused={options.focused ?? 'hours'}
        hours={options.hours}
        is24Hour={options.is24Hour}
        locale="en"
        minutes={options.minutes ?? 0}
        onChange={options.onChange}
      />
    </DisplayModeContext.Provider>
  )
}

async function moveClock(
  screen: { container: { queryAll: Function } },
  x: number,
  y: number
) {
  const surface = hosts(
    screen,
    (node) => typeof node.props.onPointerMove === 'function'
  )[0]
  if (!surface) throw new Error('missing clock surface')
  await act(async () => {
    handler(
      surface,
      'onPointerMove'
    )({
      nativeEvent: { offsetX: x, offsetY: y },
    })
  })
  return surface
}

it('tracks focus, hover, and press on a selected menu row', async () => {
  const onPress = jest.fn()
  const menu = await render(
    <SelectionMenuItem label="March" onPress={onPress} selected />
  )
  const row = menu.getByLabelText('March') as HostNode
  await act(async () => {
    handler(row, 'onFocus')()
    handler(row, 'onHoverIn')()
    handler(row, 'onPressIn')()
  })
  await act(async () => {
    handler(row, 'onPress')()
    handler(row, 'onPressOut')()
    handler(row, 'onHoverOut')()
    handler(row, 'onBlur')()
  })
  expect(onPress).toHaveBeenCalledTimes(1)
})

it('ignores a period change that would leave the 12-hour range', async () => {
  const onChange = jest.fn()
  const switcher = await render(
    <AmPmSwitcher
      hours={3}
      inputType={inputTypes.keyboard}
      onChange={onChange}
    />
  )
  await fireEvent.press(switcher.getByLabelText('PM'))
  expect(onChange).toHaveBeenCalledTimes(1)
  expect(onChange).toHaveBeenCalledWith(15)
  await fireEvent.press(switcher.getByLabelText('AM'))
  expect(onChange).toHaveBeenCalledTimes(1)

  const morning = switcher.getByLabelText('AM') as HostNode
  await act(async () => {
    handler(morning, 'onFocus')()
    handler(morning, 'onPressIn')()
    handler(morning, 'onHoverOut')()
    handler(morning, 'onPressOut')()
    handler(morning, 'onBlur')()
  })

  const disabled = await render(
    <AmPmSwitcher
      disabled
      hours={3}
      inputType={inputTypes.keyboard}
      onChange={onChange}
    />
  )
  const locked = disabled.getByLabelText('AM') as HostNode
  await act(async () => {
    handler(locked, 'onFocus')()
    handler(locked, 'onPressIn')()
  })
  expect(onChange).toHaveBeenCalledTimes(1)
})

it('tracks pointer state on a keyboard time field and ignores edits while disabled', async () => {
  const onChanged = jest.fn()
  const field = await render(
    <TimeInput
      accessibilityLabel="Hour"
      clockType="hours"
      inputType={inputTypes.keyboard}
      onChanged={onChanged}
      pressed={false}
      value={4}
    />
  )
  const surface = hosts(
    field,
    (node) => typeof node.props.onPointerDown === 'function'
  )[0]
  if (!surface) throw new Error('missing time field')
  await act(async () => {
    handler(surface, 'onPointerDown')()
    handler(surface, 'onPointerUp')()
    handler(surface, 'onPointerCancel')()
  })
  await fireEvent.changeText(field.getByLabelText('Hour'), '8')
  expect(onChanged).toHaveBeenCalledWith(8)

  const locked = await render(
    <TimeInput
      accessibilityLabel="Hour"
      clockType="hours"
      disabled
      inputType={inputTypes.keyboard}
      onChanged={onChanged}
      pressed={false}
      value={4}
    />
  )
  const input = locked.getByLabelText('Hour') as HostNode
  await act(async () => {
    handler(input, 'onChangeText')('9')
    handler(input, 'onFocus')()
  })
  expect(onChanged).toHaveBeenCalledTimes(1)
})

it('releases a dial time field and ignores it while disabled', async () => {
  const onPress = jest.fn()
  const field = await render(
    <TimeInput
      accessibilityLabel="Hour"
      clockType="hours"
      inputType={inputTypes.picker}
      onChanged={jest.fn()}
      onPress={onPress}
      pressed
      value={4}
    />
  )
  const button = field.getByLabelText('Hour') as HostNode
  await act(async () => {
    handler(button, 'onFocus')()
    handler(button, 'onHoverIn')()
    handler(button, 'onPressIn')()
    handler(button, 'onPress')()
    handler(button, 'onPressOut')()
    handler(button, 'onHoverOut')()
    handler(button, 'onBlur')()
  })
  expect(onPress).toHaveBeenCalledWith('hours')

  const locked = await render(
    <TimeInput
      accessibilityLabel="Hour"
      clockType="hours"
      disabled
      inputType={inputTypes.picker}
      onChanged={jest.fn()}
      onPress={onPress}
      pressed={false}
      value={4}
    />
  )
  const disabledButton = locked.getByLabelText('Hour') as HostNode
  await act(async () => {
    handler(disabledButton, 'onFocus')()
    handler(disabledButton, 'onPress')()
  })
  expect(onPress).toHaveBeenCalledTimes(1)
})

it('follows the pointer around the dial, including noon and the inner ring', async () => {
  const amTwelve = point(
    '12-hour noon',
    (x, y) => hourPick(x, y, 3, false, 'AM').atTwelveCheck === 12
  )
  const amHour = point(
    '12-hour 3',
    (x, y) => hourPick(x, y, 3, false, 'AM').atDayCheck === 3
  )
  const pmHour = point('12-hour afternoon', (x, y) => {
    const pick = hourPick(x, y, 15, false, 'PM')
    return pick.hours12AndPm && pick.atDayCheck !== 24 && pick.atDayCheck !== 12
  })
  const pmNoon = point(
    '12-hour midnight rollover',
    (x, y) => hourPick(x, y, 15, false, 'PM').atDayCheck === 24
  )
  const inner = point('24-hour inner ring', (x, y) => {
    const pick = hourPick(x, y, 15, true, 'AM')
    return pick.hours24AndPM && pick.atDayCheck !== 24
  })
  const outer = point('24-hour outer ring', (x, y) => {
    const pick = hourPick(x, y, 3, true, 'AM')
    return !pick.hours24AndPM && pick.atTwelveCheck !== 12
  })
  const eveningTwelve = point('24-hour evening noon', (x, y) => {
    const pick = hourPick(x, y, 15, true, 'PM')
    return pick.atTwelveCheck === 12 && !pick.hours24AndPM
  })
  const minute = point(
    'minute 30',
    (x, y) => getMinutes(getAngle(x, y, circleSize)) === 30
  )

  const onChange = jest.fn()
  const morning = await render(clock({ hours: 3, is24Hour: false, onChange }))
  const surface = await moveClock(morning, amHour.x, amHour.y)
  await moveClock(morning, amTwelve.x, amTwelve.y)
  await act(async () => {
    handler(surface, 'onFocus')()
  })
  await act(async () => {
    handler(surface, 'onMouseLeave')()
    handler(surface, 'onBlur')()
  })
  expect(morning.getByLabelText('Hour 3 of 12')).toBeTruthy()

  const afternoon = await render(
    clock({ hours: 15, is24Hour: false, mode: 'PM', onChange })
  )
  await moveClock(afternoon, pmHour.x, pmHour.y)
  await moveClock(afternoon, pmNoon.x, pmNoon.y)

  const fullDay = await render(clock({ hours: 15, is24Hour: true, onChange }))
  await moveClock(fullDay, inner.x, inner.y)
  await moveClock(fullDay, outer.x, outer.y)

  const evening = await render(
    clock({ hours: 15, is24Hour: true, mode: 'PM', onChange })
  )
  await moveClock(evening, eveningTwelve.x, eveningTwelve.y)

  const minutes = await render(
    clock({
      focused: 'minutes',
      hours: 3,
      is24Hour: false,
      minutes: 30,
      onChange,
    })
  )
  await moveClock(minutes, minute.x, minute.y)
  expect(minutes.getByLabelText('Minute 30 of 60')).toBeTruthy()

  const disabled = await render(
    clock({ disabled: true, hours: 3, is24Hour: false, minutes: 30, onChange })
  )
  const locked = await moveClock(disabled, amHour.x, amHour.y)
  await act(async () => {
    handler(locked, 'onFocus')()
  })
  const presses: Array<(value: number) => void> = []
  walk(rootOf(locked), (fiber) => {
    const props = fiber.memoizedProps ?? fiber.pendingProps
    if (!props) return
    const onPress = props.onPress
    if (typeof onPress !== 'function') return
    if (!('hoveredHour' in props) && !('hoveredMinute' in props)) return
    if (!presses.includes(onPress as (value: number) => void)) {
      presses.push(onPress as (value: number) => void)
    }
  })
  expect(presses.length).toBeGreaterThan(0)
  await act(async () => {
    presses.forEach((onPress) => onPress(1))
  })
  expect(onChange).not.toHaveBeenCalled()
})

it('draws the dial focus ring on the focused label or the selected handle', async () => {
  const screen = await render(
    clock({
      hours: 5,
      is24Hour: false,
      minutes: 0,
      onChange: () => undefined,
    })
  )
  const hour = screen.getByLabelText('Hour 10 of 12') as HostNode
  await act(async () => {
    handler(hour, 'onFocus')()
  })
  expect(focusRings(screen)).toHaveLength(1)

  const selected = screen.getByLabelText('Hour 5 of 12') as HostNode
  await act(async () => {
    handler(hour, 'onBlur')()
    handler(selected, 'onFocus')()
  })
  expect(focusRings(screen)).toHaveLength(1)

  const surface = hosts(
    screen,
    (node) => typeof node.props.onPointerMove === 'function'
  )[0]
  await act(async () => {
    handler(selected, 'onBlur')()
    handler(surface, 'onFocus')()
  })
  expect(focusRings(screen)).toHaveLength(1)

  await act(async () => {
    handler(surface, 'onBlur')()
  })
  expect(focusRings(screen)).toHaveLength(0)
})

it('focuses a scroll wheel, ignores it while disabled, and hides the keyboard toggle', async () => {
  const onChange = jest.fn()
  const onFocusInput = jest.fn()
  const wheels = await render(
    <ScrollTimePicker
      focused="hours"
      hours={9}
      is24Hour={false}
      locale="en"
      minutes={45}
      onChange={onChange}
      onFocusInput={onFocusInput}
      onToggleKeyboard={jest.fn()}
    />
  )
  const hours = wheels.getByTestId('time-scroll-hours', {
    includeHiddenElements: true,
  }) as HostNode
  const hourControl = wheels.getByTestId('time-scroll-hours-control', {
    includeHiddenElements: true,
  }) as HostNode
  const minuteControl = wheels.getByTestId('time-scroll-minutes-control', {
    includeHiddenElements: true,
  }) as HostNode
  await act(async () => {
    handler(hourControl, 'onFocus')()
    handler(hourControl, 'onMouseEnter')()
    handler(hourControl, 'onTouchCancel')()
    handler(hourControl, 'onTouchEnd')()
    handler(minuteControl, 'onFocus')()
    handler(
      hours,
      'onScrollEndDrag'
    )({
      nativeEvent: { contentOffset: { x: 0, y: 0 } },
    })
  })
  expect(onFocusInput).toHaveBeenCalledWith('minutes')
  expect(wheels.getByLabelText('Toggle input picker')).toBeTruthy()

  const hiddenToggle = await render(
    <ScrollTimePicker
      focused="minutes"
      hours={9}
      is24Hour={false}
      locale="en"
      minutes={45}
      onChange={onChange}
      onFocusInput={onFocusInput}
      onToggleKeyboard={jest.fn()}
      showKeyboardToggle={false}
    />
  )
  expect(hiddenToggle.queryByLabelText('Toggle input picker')).toBeNull()

  const dayWheel = await render(
    <ScrollTimePicker
      focused="hours"
      hours={9}
      is24Hour
      locale="en"
      minutes={45}
      onChange={onChange}
      onFocusInput={onFocusInput}
      onToggleKeyboard={jest.fn()}
      showKeyboardToggle={false}
    />
  )
  expect(dayWheel.queryByLabelText('Toggle input picker')).toBeNull()

  const locked = await render(
    <ScrollTimePicker
      disabled
      focused="hours"
      hours={9}
      is24Hour={false}
      locale="en"
      minutes={45}
      onChange={onChange}
      onFocusInput={onFocusInput}
      onToggleKeyboard={jest.fn()}
    />
  )
  const lockedControl = locked.getByTestId('time-scroll-hours-control', {
    includeHiddenElements: true,
  }) as HostNode
  const lockedHours = locked.getByTestId('time-scroll-hours', {
    includeHiddenElements: true,
  }) as HostNode
  const calls = onChange.mock.calls.length
  await act(async () => {
    handler(lockedControl, 'onFocus')()
    handler(lockedControl, 'onTouchStart')()
    handler(
      lockedControl,
      'onAccessibilityAction'
    )({
      nativeEvent: { actionName: 'increment' },
    })
    handler(
      lockedHours,
      'onMomentumScrollEnd'
    )({
      nativeEvent: { contentOffset: { x: 0, y: 0 } },
    })
  })
  expect(onChange.mock.calls.length).toBe(calls)
})

it('keeps a disabled scroll picker from opening the keyboard', async () => {
  const picker = await render(
    <TimePicker
      disabled
      focused="hours"
      hours={9}
      inputType={inputTypes.scroll}
      locale="en"
      minutes={45}
      onChange={jest.fn()}
      onFocusInput={jest.fn()}
    />
  )
  const toggle = picker.getByTestId('time-scroll-keyboard') as HostNode
  await act(async () => {
    handler(toggle, 'onPress')()
  })
  expect(
    picker.getByTestId('time-scroll-hours', { includeHiddenElements: true })
  ).toBeTruthy()
})

it('reports a dial hour through the time picker', async () => {
  const onChange = jest.fn()
  const picker = await render(
    <TimePicker
      focused="hours"
      hours={9}
      inputType={inputTypes.picker}
      locale="en"
      minutes={30}
      onChange={onChange}
      onFocusInput={jest.fn()}
    />
  )
  await fireEvent(
    picker.getByLabelText('Hour 3 of 12'),
    'accessibilityAction',
    {
      nativeEvent: { actionName: 'activate' },
    }
  )
  expect(onChange).toHaveBeenCalledWith(
    expect.objectContaining({ hours: 3, minutes: 30 })
  )
})

it('confirms a portrait dial and ignores a disabled modal', async () => {
  await setWindow(400, 800)
  const onConfirm = jest.fn()
  const onDismiss = jest.fn()
  const modal = await render(
    <TimePickerModal
      cancelLabel="Dismiss"
      clockIcon="clock-outline"
      confirmLabel="Save"
      hours={9}
      keyboardIcon="keyboard-outline"
      locale="en"
      minutes={30}
      onConfirm={onConfirm}
      onDismiss={onDismiss}
      scrollIcon="unfold-more-horizontal"
      use24HourClock={false}
      visible
    />
  )
  await fireEvent(modal.getByLabelText('Hour 3 of 12'), 'accessibilityAction', {
    nativeEvent: { actionName: 'activate' },
  })
  await fireEvent(
    modal.getByLabelText('Minute 15 of 60'),
    'accessibilityAction',
    { nativeEvent: { actionName: 'activate' } }
  )
  await fireEvent.press(modal.getByText('Save'))
  expect(onConfirm).toHaveBeenCalledWith({ hours: 3, minutes: 15 })

  const hidden = await render(
    <TimePickerModal
      hours={9}
      minutes={30}
      onConfirm={onConfirm}
      onDismiss={onDismiss}
      visible={false}
    />
  )
  expect(hidden.queryByText('OK')).toBeNull()

  const locked = await render(
    <TimePickerModal
      disabled
      hours={9}
      locale="en"
      minutes={30}
      onConfirm={onConfirm}
      onDismiss={onDismiss}
      use24HourClock={false}
      visible
    />
  )
  await act(async () => {
    handler(
      locked.getByLabelText('Toggle input picker') as HostNode,
      'onPress'
    )()
    handler(locked.getByText('OK') as HostNode, 'onPress')()
  })
  expect(onConfirm).toHaveBeenCalledTimes(1)
})

it('places a docked calendar above the field when it does not fit below', async () => {
  expect(
    placeDockedCard({
      anchor: { height: 56, width: 280, x: 40, y: 700 },
      cardHeight: 480,
      cardWidth: 360,
      windowHeight: 800,
      windowWidth: 1200,
    }).top
  ).toBe(212)

  const onConfirm = jest.fn()
  const docked = await render(
    <DatePickerDocked
      date={new Date(2026, 0, 15)}
      locale="en"
      onConfirm={onConfirm}
      onDismiss={jest.fn()}
      visible
    />
  )
  const surface = docked.getByTestId(
    'react-native-paper-dates-docked-surface'
  ) as HostNode
  const month = docked.getByTestId(
    'react-native-paper-dates-docked-month'
  ) as HostNode
  await act(async () => {
    handler(month, 'onFocus')()
    handler(month, 'onPressIn')()
    handler(month, 'onPressOut')()
    handler(month, 'onBlur')()
    handler(
      surface,
      'onLayout'
    )({
      nativeEvent: { layout: { height: 520, width: 360, x: 0, y: 0 } },
    })
  })
  await act(async () => {
    handler(
      surface,
      'onLayout'
    )({
      nativeEvent: { layout: { height: 0, width: 360, x: 0, y: 0 } },
    })
  })
  expect(docked.getByText('Jan')).toBeTruthy()
})

it('uses fallback date errors when the locale is not registered', async () => {
  const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined)
  const onChange = jest.fn()
  const start = new Date(2026, 0, 10)
  const end = new Date(2026, 0, 20)

  const invalid = await render(
    <DatePickerInputWithoutModal
      inputMode="start"
      locale="fr"
      onChange={onChange}
      testID="date"
      value={undefined}
    />
  )
  await fireEvent(invalid.getByTestId('date'), 'focus')
  await fireEvent.changeText(invalid.getByTestId('date'), 'not-a-date')
  await fireEvent(invalid.getByTestId('date'), 'blur')
  expect(invalid.getByText('notAccordingToDateFormat')).toBeTruthy()

  const focused = await render(
    <DatePickerInputWithoutModal
      inputMode="start"
      locale="fr"
      onChange={onChange}
      testID="date"
      value={undefined}
    />
  )
  const input = focused.getByTestId('date')
  const mask = String((input as HostNode).props.placeholder ?? 'MM/DD/YYYY')
  const text = mask
    .replace('YYYY', '2026')
    .replace('AAAA', '2026')
    .replace('MM', '01')
    .replace('DD', '15')
  await fireEvent(input, 'focus')
  await fireEvent.changeText(focused.getByTestId('date'), text)
  await act(async () => {
    handler(focused.getByTestId('date') as HostNode, 'onSubmitEditing')({})
  })
  expect(onChange).toHaveBeenCalledWith(new Date(2026, 0, 15))

  async function reject(
    validRange: { endDate?: Date; startDate?: Date },
    month: string,
    day: string
  ) {
    const screen = await render(
      <DatePickerInputWithoutModal
        inputMode="start"
        locale="fr"
        onChange={onChange}
        testID="date"
        validRange={validRange}
        value={undefined}
      />
    )
    const rangeMask = String(
      (screen.getByTestId('date') as HostNode).props.placeholder ?? 'MM/DD/YYYY'
    )
    const typed = rangeMask
      .replace('YYYY', '2026')
      .replace('AAAA', '2026')
      .replace('MM', month)
      .replace('DD', day)
    await fireEvent(screen.getByTestId('date'), 'focus')
    await fireEvent.changeText(screen.getByTestId('date'), typed)
    await fireEvent(screen.getByTestId('date'), 'blur')
    return screen
  }

  expect(
    (await reject({ endDate: end, startDate: start }, '01', '01')).getByText(
      'mustBeBetween'
    )
  ).toBeTruthy()
  expect(
    (await reject({ startDate: start }, '01', '01')).getByText(
      'mustBeHigherThan'
    )
  ).toBeTruthy()
  expect(
    (await reject({ endDate: end }, '01', '25')).getByText('mustBeLowerThan')
  ).toBeTruthy()
  warn.mockRestore()
})

it('shows custom header labels and lists a short multiple selection', async () => {
  const dates = [new Date(2026, 0, 15), new Date(2026, 0, 16)]
  const multiple = await render(
    <DatePickerModalContentHeader
      collapsed
      emptyLabel="None"
      locale="en"
      mode="multiple"
      moreLabel="more"
      onToggle={jest.fn()}
      state={{
        date: undefined,
        dates,
        endDate: undefined,
        startDate: undefined,
      }}
    />
  )
  expect(multiple.getByText(/15.*16|16.*15/)).toBeTruthy()

  const range = await render(
    <DatePickerModalContentHeader
      collapsed={false}
      endLabel="Until"
      headerSeparator="to"
      locale="en"
      mode="range"
      onToggle={jest.fn()}
      startLabel="From"
      state={{
        date: undefined,
        dates: undefined,
        endDate: undefined,
        startDate: undefined,
      }}
    />
  )
  expect(range.getByText('From')).toBeTruthy()
  expect(range.getByText('to')).toBeTruthy()
  expect(range.getByText('Until')).toBeTruthy()

  const single = await render(
    <DatePickerModalContentHeader
      allowEditing
      collapsed={false}
      emptyLabel="None"
      locale="en"
      mode="single"
      onToggle={jest.fn()}
      state={{
        date: undefined,
        dates: undefined,
        endDate: undefined,
        startDate: undefined,
      }}
    />
  )
  expect(single.getByText('None')).toBeTruthy()
  expect(single.getByLabelText('Pick date from calendar')).toBeTruthy()
})
