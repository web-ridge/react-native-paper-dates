import { act, fireEvent, render } from '@testing-library/react-native'
import { Dimensions, PanResponder, Platform, StyleSheet } from 'react-native'
import { DarkTheme, ThemeProvider } from 'react-native-paper'

import { DisplayModeContext } from '../../contexts/DisplayModeContext'
import { withAlpha } from '../../shared/utils'
import { findPress } from '../../testUtils'
import AmPmSwitcher from '../../Time/AmPmSwitcher'
import AnalogClock from '../../Time/AnalogClock'
import AnalogClockHours from '../../Time/AnalogClockHours'
import AnalogClockMinutes from '../../Time/AnalogClockMinutes'
import AnimatedClockSwitcher from '../../Time/AnimatedClockSwitcher'
import ClockNumber from '../../Time/ClockNumber'
import TimeInput from '../../Time/TimeInput'
import TimeInputs from '../../Time/TimeInputs'
import TimePicker from '../../Time/TimePicker'
import TimePickerModal from '../../Time/TimePickerModal'
import { scrollItemHeight } from '../../Time/timeUtils'
import en from '../../translations/en'
import { registerTranslation } from '../../translations/utils'

registerTranslation('en', en)

registerTranslation('en-US', en)

registerTranslation('en-GB', en)

const originalOS = Platform.OS

const savedWindow = Dimensions.get('window')

afterEach(async () => {
  Platform.OS = originalOS
  await act(async () => {
    Dimensions.set({ screen: savedWindow, window: savedWindow })
  })
})

function clockEvent(x: number, y: number) {
  return { nativeEvent: { locationX: x, locationY: y } }
}

async function setWindow(width: number, height: number) {
  await act(async () => {
    Dimensions.set({
      screen: { fontScale: 1, height, scale: 1, width },
      window: { fontScale: 1, height, scale: 1, width },
    })
  })
}

describe('analog clock', () => {
  it('tracks hours and minutes from pointer moves', async () => {
    const configs: Array<Record<string, Function>> = []
    const create = PanResponder.create.bind(PanResponder)
    const onChange = jest.fn()
    const spy = jest
      .spyOn(PanResponder, 'create')
      .mockImplementation((config) => {
        configs.push(config as Record<string, Function>)
        return create(config)
      })

    async function drag(
      mode: 'AM' | 'PM' | undefined,
      focused: 'hours' | 'minutes' | 'seconds',
      is24Hour: boolean,
      points: Array<readonly [number, number]>
    ) {
      await render(
        <DisplayModeContext.Provider value={{ mode, setMode: () => null }}>
          <AnalogClock
            focused={focused as 'hours'}
            hours={is24Hour ? 15 : 12}
            is24Hour={is24Hour}
            minutes={30}
            onChange={onChange}
          />
        </DisplayModeContext.Provider>
      )
      const responder = configs[configs.length - 1]
      for (const [x, y] of points) {
        const event = clockEvent(x, y)
        responder.onPanResponderGrant(event)
        responder.onPanResponderMove(event)
        responder.onPanResponderRelease(event)
      }
      return responder
    }

    try {
      // Each point lands on a different hour path: outer ring, inner noon,
      // midnight, and the hour that is already selected.
      const responder = await drag('AM', 'hours', true, [
        [0, 0],
        [112, 48],
        [96, 0],
        [144, 128],
      ])
      expect(responder.onStartShouldSetPanResponder()).toBe(true)
      expect(responder.onStartShouldSetPanResponderCapture()).toBe(false)
      expect(responder.onMoveShouldSetPanResponder()).toBe(true)
      expect(responder.onMoveShouldSetPanResponderCapture()).toBe(true)
      expect(responder.onPanResponderTerminationRequest()).toBe(true)
      expect(responder.onShouldBlockNativeResponder()).toBe(true)

      await drag('PM', 'hours', false, [
        [0, 0],
        [96, 0],
      ])
      await drag(undefined, 'hours', false, [[96, 0]])
      await drag('PM', 'hours', true, [[96, 0]])
      await drag('AM', 'minutes', false, [
        [0, 0],
        [128, 144],
      ])
      await drag('AM', 'seconds', false, [[0, 0]])
    } finally {
      spy.mockRestore()
    }
    expect(onChange).toHaveBeenCalled()
  })

  it('highlights outer and inner hours and the zero minute', async () => {
    await render(<AnalogClockHours hours={0} is24Hour />)
    await render(<AnalogClockHours hours={12} is24Hour />)
    await render(<AnalogClockHours hours={1} is24Hour={false} />)
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {})
    try {
      await render(
        <AnalogClockHours
          hours={15}
          is24Hour
          locale="xx"
          onPress={() => null}
        />
      )
      await render(
        <AnalogClockMinutes locale="xx" minutes={20} onPress={() => null} />
      )
      expect(warn).toHaveBeenCalledWith(
        expect.stringContaining('The locale xx is not registered')
      )
    } finally {
      warn.mockRestore()
    }
    await render(<AnalogClockMinutes minutes={0} />)
    await render(<AnalogClockMinutes minutes={59} />)
    await render(<AnalogClockMinutes minutes={7} />)
    const minutes = await render(
      <AnimatedClockSwitcher
        focused="minutes"
        hours={<AnalogClockHours hours={1} is24Hour={false} />}
        minutes={<AnalogClockMinutes minutes={5} />}
      />
    )
    await minutes.rerender(
      <AnimatedClockSwitcher
        focused="hours"
        hours={<AnalogClockHours hours={13} is24Hour />}
        minutes={<AnalogClockMinutes minutes={5} />}
      />
    )
  })

  it('activates a dial hour from assistive technology', async () => {
    const onChange = jest.fn()
    const clock = await render(
      <AnalogClock
        focused="hours"
        hours={7}
        is24Hour={false}
        locale="en"
        minutes={30}
        onChange={onChange}
      />
    )
    await fireEvent(
      clock.getByLabelText('Hour 3 of 12'),
      'accessibilityAction',
      { nativeEvent: { actionName: 'activate' } }
    )
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ focused: 'minutes', hours: 3, minutes: 30 })
    )
    await fireEvent(clock.getByLabelText('Hour 4 of 12'), 'click')
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ focused: 'minutes', hours: 4, minutes: 30 })
    )

    const inner = await render(
      <AnalogClock
        focused="hours"
        hours={15}
        is24Hour
        locale="en"
        minutes={10}
        onChange={onChange}
      />
    )
    await fireEvent(
      inner.getByLabelText('Hour 15 of 24'),
      'accessibilityAction',
      { nativeEvent: { actionName: 'activate' } }
    )

    const minuteClock = await render(
      <AnalogClock
        focused="minutes"
        hours={7}
        is24Hour={false}
        locale="en"
        minutes={30}
        onChange={onChange}
      />
    )
    await fireEvent(
      minuteClock.getByLabelText('Minute 15 of 60'),
      'accessibilityAction',
      { nativeEvent: { actionName: 'activate' } }
    )
    await fireEvent(
      minuteClock.getByLabelText('Minute 15 of 60'),
      'accessibilityAction',
      { nativeEvent: { actionName: 'longpress' } }
    )

    const unlabeled = await render(<ClockNumber left={10} top={10} value={1} />)
    let dial = unlabeled.getByText('1')
    while (
      dial.parent &&
      typeof dial.props.onAccessibilityAction !== 'function'
    ) {
      dial = dial.parent
    }
    await fireEvent(dial, 'accessibilityAction', {
      nativeEvent: { actionName: 'activate' },
    })
  })
})

describe('time inputs', () => {
  it('edits hours and minutes from the keyboard and the dial', async () => {
    const onChange = jest.fn()
    const onFocusInput = jest.fn()
    const keyboard = await render(
      <TimeInputs
        focused="hours"
        hours={9}
        inputType="keyboard"
        is24Hour={false}
        locale="en"
        minutes={5}
        onChange={onChange}
        onFocusInput={onFocusInput}
      />
    )
    const fields = keyboard.container.queryAll(
      (node: { props: { onChangeText?: Function } }) =>
        typeof node.props.onChangeText === 'function'
    ) as Array<{ props: Record<string, Function | undefined> }>
    await act(() => {
      fields.forEach((node) => {
        node.props.onChangeText?.('3')
        node.props.onChangeText?.('30')
        node.props.onChangeText?.('99')
        node.props.onChangeText?.('-')
        node.props.onFocus?.()
        node.props.onBlur?.()
        node.props.onSubmitEditing?.()
      })
    })

    Platform.OS = 'android'
    await render(
      <ThemeProvider
        theme={{
          ...DarkTheme,
          colors: { ...DarkTheme.colors, primary: '#000000' },
          roundness: 4,
        }}
      >
        <TimeInputs
          focused="minutes"
          hours={18}
          inputFontSize={40}
          inputType="picker"
          is24Hour
          minutes={45}
          onChange={onChange}
          onFocusInput={onFocusInput}
        />
      </ThemeProvider>
    )

    await setWindow(900, 400)
    const landscape = await render(
      <TimeInputs
        focused="hours"
        hours={1}
        inputType="picker"
        is24Hour={false}
        minutes={0}
        onChange={onChange}
        onFocusInput={onFocusInput}
      />
    )
    landscape.container
      .queryAll(
        (node) =>
          node.props.accessibilityLabel === 'PM' &&
          typeof node.props.onPress === 'function'
      )
      .forEach((node) => {
        ;(node.props.onPress as () => void)()
      })
    await fireEvent.press(landscape.getByLabelText('PM'))
    expect(onChange).toHaveBeenCalled()
  })

  it('switches meridiem and types into a single field', async () => {
    const onChange = jest.fn()
    const vertical = await render(
      <AmPmSwitcher hours={2} inputType="keyboard" onChange={onChange} />
    )
    vertical.container
      .queryAll(
        (node) =>
          node.props.accessibilityLabel === 'AM' ||
          node.props.accessibilityLabel === 'PM'
      )
      .forEach((node) => {
        const onPress = findPress(node as Parameters<typeof findPress>[0])
        if (onPress) onPress()
      })

    const afternoon = await render(
      <AmPmSwitcher hours={14} inputType="keyboard" onChange={onChange} />
    )
    afternoon.container
      .queryAll(
        (node) =>
          node.props.accessibilityLabel === 'AM' ||
          node.props.accessibilityLabel === 'PM'
      )
      .forEach((node) => {
        findPress(node as Parameters<typeof findPress>[0])?.()
      })

    await render(
      <AmPmSwitcher
        direction="horizontal"
        hours={2}
        inputType="picker"
        onChange={onChange}
      />
    )

    const evening = await render(
      <DisplayModeContext.Provider value={{ mode: 'PM', setMode: () => null }}>
        <AmPmSwitcher hours={14} inputType="keyboard" onChange={onChange} />
      </DisplayModeContext.Provider>
    )
    await fireEvent.press(evening.getByLabelText('AM'))
    await fireEvent.press(evening.getByLabelText('PM'))

    const input = await render(
      <TimeInput
        clockType="hours"
        inputType="picker"
        onChanged={jest.fn()}
        onPress={jest.fn()}
        pressed={false}
        value={4}
      />
    )
    input.container
      .queryAll(() => true)
      .forEach((node) => {
        findPress(node as Parameters<typeof findPress>[0])?.()
      })

    Platform.OS = 'android'
    const typed = await render(
      <TimeInput
        clockType="minutes"
        inputFontSize={20}
        inputType="keyboard"
        onChanged={jest.fn()}
        pressed
        value={12}
      />
    )
    await typed.rerender(
      <TimeInput
        clockType="minutes"
        inputType="keyboard"
        onChanged={jest.fn()}
        pressed
        value={8}
      />
    )
    const minuteField = typed.getByDisplayValue('08')
    await fireEvent(minuteField, 'focus')
    expect(minuteField.props.value).toBe('08')

    const replacing = await render(
      <TimeInput
        clockType="hours"
        inputType="keyboard"
        onChanged={jest.fn()}
        pressed
        value={12}
      />
    )
    const hourField = replacing.getByDisplayValue('12')
    await fireEvent(hourField, 'focus')
    await fireEvent.changeText(hourField, '05')
    await replacing.rerender(
      <TimeInput
        clockType="hours"
        inputType="keyboard"
        onChanged={jest.fn()}
        pressed
        value={5}
      />
    )
    expect(replacing.getByDisplayValue('05')).toBeTruthy()

    const onClear = jest.fn()
    const cleared = await render(
      <TimeInputs
        focused="minutes"
        hours={8}
        inputType="keyboard"
        is24Hour={false}
        locale="en"
        minutes={30}
        onChange={onClear}
        onFocusInput={jest.fn()}
      />
    )
    const clearedHour = cleared.getByLabelText('Hour')
    const clearedMinute = cleared.getByLabelText('Minute')
    expect(clearedHour.props.placeholder).toBeUndefined()
    expect(clearedMinute.props.placeholder).toBeUndefined()
    await fireEvent(clearedHour, 'focus')
    await fireEvent.changeText(clearedHour, '')
    await fireEvent(clearedHour, 'blur')
    await fireEvent(clearedMinute, 'focus')
    await fireEvent.changeText(clearedMinute, '0')
    await fireEvent.changeText(clearedMinute, '')
    await cleared.rerender(
      <TimeInputs
        focused="minutes"
        hours={8}
        inputType="keyboard"
        is24Hour={false}
        locale="en"
        minutes={0}
        onChange={onClear}
        onFocusInput={jest.fn()}
      />
    )
    await fireEvent(cleared.getByLabelText('Minute'), 'blur')
    expect(cleared.getByLabelText('Hour').props.value).toBe('')
    expect(cleared.getByLabelText('Minute').props.value).toBe('')
    const invalid = await render(
      <TimeInput
        accessibilityLabel="Hour"
        clockType="hours"
        inputType="keyboard"
        is24Hour
        onChanged={jest.fn()}
        pressed
        value={12}
      />
    )
    const invalidHour = invalid.getByLabelText('Hour')
    await fireEvent(invalidHour, 'focus')
    await fireEvent.changeText(invalidHour, '99')
    await fireEvent.changeText(invalidHour, '9a')
    await fireEvent.changeText(invalidHour, '-')
    await fireEvent.changeText(invalidHour, '1.5')
    expect(invalid.getByLabelText('Hour').props.value).toBe('99')
    expect(onChange).toHaveBeenCalled()
  })

  it('follows the material state layers and error text color', async () => {
    const theme = {
      ...DarkTheme,
      colors: {
        ...DarkTheme.colors,
        error: 'rgb(255, 0, 0)',
        errorContainer: 'rgb(0, 0, 255)',
        onErrorContainer: 'rgb(0, 255, 0)',
        onPrimaryContainer: 'rgb(1, 2, 3)',
        onSurface: 'rgb(20, 21, 22)',
        primary: 'rgb(4, 5, 6)',
        onSurfaceVariant: 'rgb(7, 8, 9)',
        onTertiaryContainer: 'rgb(10, 11, 12)',
      },
    }
    const states = await render(
      <ThemeProvider theme={theme}>
        <TimeInput
          accessibilityLabel="Hour"
          clockType="hours"
          inputType="keyboard"
          is24Hour
          onChanged={jest.fn()}
          pressed={false}
          value={12}
        />
        <TimeInput
          accessibilityLabel="Minute"
          clockType="minutes"
          inputType="picker"
          onChanged={jest.fn()}
          onPress={jest.fn()}
          pressed
          value={30}
        />
        <AmPmSwitcher hours={8} inputType="keyboard" onChange={jest.fn()} />
      </ThemeProvider>
    )
    const backgrounds = (node: unknown): string[] => {
      if (Array.isArray(node)) {
        return node.flatMap(backgrounds)
      }
      if (!node || typeof node !== 'object') {
        return []
      }
      const record = node as {
        children?: unknown
        props?: { style?: unknown }
      }
      const color = StyleSheet.flatten(
        record.props?.style as Parameters<typeof StyleSheet.flatten>[0]
      )?.backgroundColor
      const nested = backgrounds(record.children)
      return typeof color === 'string' ? [color, ...nested] : nested
    }
    const layer = (color: string) =>
      backgrounds(states.toJSON()).includes(color)
    const hour = states.getByLabelText('Hour')
    await fireEvent(hour, 'focus')
    await fireEvent.changeText(hour, '99')
    expect(StyleSheet.flatten(hour.props.style).color).toBe('rgb(255, 0, 0)')
    await fireEvent(hour, 'blur')
    expect(StyleSheet.flatten(hour.props.style).color).toBe('rgb(0, 255, 0)')
    if (hour.parent) await fireEvent(hour.parent, 'mouseEnter')
    expect(layer('rgba(20, 21, 22, 0.08)')).toBe(true)

    const minute = states.getByLabelText('Minute')
    await fireEvent(minute, 'hoverIn')
    await fireEvent(minute, 'focus')
    await fireEvent(minute, 'pressIn')
    expect(layer('rgba(20, 21, 22, 0.28)')).toBe(true)

    const morning = states.getByLabelText('AM')
    await fireEvent(morning, 'hoverIn')
    expect(layer('rgba(1, 2, 3, 0.08)')).toBe(true)
  })
})

describe('time picker modal', () => {
  it('confirms, cancels, and toggles the keyboard', async () => {
    const onConfirm = jest.fn()
    const onDismiss = jest.fn()
    const modal = await render(
      <TimePickerModal
        defaultInputType="keyboard"
        hours={15}
        inputFontSize={48}
        label=""
        locale="en"
        minutes={45}
        onConfirm={onConfirm}
        onDismiss={onDismiss}
        uppercase
        use24HourClock={false}
        visible
      />
    )
    await fireEvent.press(modal.getByLabelText('Toggle dial picker'))
    await fireEvent.press(modal.getByText('OK'))
    await fireEvent.press(modal.getByText('CANCEL'))
    expect(onConfirm).toHaveBeenCalled()
    expect(onDismiss).toHaveBeenCalled()

    const defaults = await render(
      <TimePickerModal
        hours={undefined}
        minutes={null as unknown as number}
        onConfirm={onConfirm}
        onDismiss={onDismiss}
        visible
      />
    )
    expect(defaults.queryByText('Select time')).toBeNull()
    expect(defaults.getByText('OK')).toBeTruthy()
    const keyboardHeadline = await render(
      <TimePickerModal
        defaultInputType="keyboard"
        hours={8}
        minutes={15}
        onConfirm={onConfirm}
        onDismiss={onDismiss}
        visible
      />
    )
    expect(keyboardHeadline.queryByText('Enter time')).toBeNull()
    const labeled = await render(
      <TimePickerModal
        hours={8}
        label="Alarm"
        minutes={15}
        onConfirm={onConfirm}
        onDismiss={onDismiss}
        visible
      />
    )
    expect(labeled.getByText('Alarm')).toBeTruthy()
    const backdrop = defaults.container.queryAll(
      (node) => node.props.onPress === onDismiss
    )
    await act(() => {
      backdrop.forEach((node) => {
        ;(node.props.onPress as () => void)()
      })
    })

    await render(
      <TimePicker
        focused="minutes"
        hours={0}
        inputType="picker"
        locale="en-US"
        minutes={0}
        onChange={jest.fn()}
        onFocusInput={jest.fn()}
        use24HourClock={undefined}
      />
    )
    await render(
      <TimePicker
        focused="hours"
        hours={23}
        inputType="keyboard"
        locale="en-GB"
        minutes={59}
        onChange={jest.fn()}
        onFocusInput={jest.fn()}
        use24HourClock
      />
    )

    await setWindow(320, 360)
    const compact = await render(
      <TimePickerModal
        hours={9}
        minutes={45}
        onConfirm={onConfirm}
        onDismiss={onDismiss}
        use24HourClock={false}
        visible
      />
    )
    expect(
      compact.getByTestId('time-scroll-hours', { includeHiddenElements: true })
    ).toBeTruthy()
    expect(compact.getByLabelText('Toggle input picker')).toBeTruthy()
    await fireEvent.press(compact.getByLabelText('Toggle input picker'))
    expect(compact.getByLabelText('Hour')).toBeTruthy()
    expect(compact.getByLabelText('Toggle scroll picker')).toBeTruthy()
    await fireEvent.press(compact.getByLabelText('Toggle scroll picker'))
    expect(
      compact.getByTestId('time-scroll-hours', { includeHiddenElements: true })
    ).toBeTruthy()
  })

  it('does not confirm an out-of-range keyboard time', async () => {
    const onConfirm = jest.fn()
    const modal = await render(
      <TimePickerModal
        defaultInputType="keyboard"
        hours={10}
        locale="en"
        minutes={15}
        onConfirm={onConfirm}
        onDismiss={jest.fn()}
        use24HourClock
        visible
      />
    )
    const hour = modal.getByLabelText('Hour')
    await fireEvent(hour, 'focus')
    await fireEvent.changeText(hour, '99')
    expect(modal.getByText('Invalid time')).toBeTruthy()
    expect(modal.getByLabelText('Hour').props.accessibilityHint).toBeUndefined()
    await fireEvent.press(modal.getByText('OK'))
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it('switches an inline scroll picker to the keyboard and back', async () => {
    const picker = await render(
      <TimePicker
        focused="hours"
        hours={9}
        inputType="scroll"
        locale="en"
        minutes={45}
        onChange={jest.fn()}
        onFocusInput={jest.fn()}
        use24HourClock={false}
      />
    )
    await fireEvent.press(picker.getByLabelText('Toggle input picker'))
    expect(picker.getByLabelText('Hour')).toBeTruthy()
    await fireEvent.press(picker.getByLabelText('Toggle scroll picker'))
    expect(
      picker.getByTestId('time-scroll-hours', { includeHiddenElements: true })
    ).toBeTruthy()
    expect(picker.queryByLabelText('Hour')).toBeNull()
  })

  it('toggles a scroll modal back to the wheels', async () => {
    const modal = await render(
      <TimePickerModal
        defaultInputType="scroll"
        hours={9}
        locale="en"
        minutes={45}
        onConfirm={jest.fn()}
        onDismiss={jest.fn()}
        use24HourClock={false}
        visible
      />
    )
    await fireEvent.press(modal.getByLabelText('Toggle input picker'))
    expect(modal.getByLabelText('Hour')).toBeTruthy()
    await fireEvent.press(modal.getByLabelText('Toggle scroll picker'))
    expect(
      modal.getByTestId('time-scroll-hours', { includeHiddenElements: true })
    ).toBeTruthy()
    expect(modal.queryByLabelText('Hour')).toBeNull()
  })
})

describe('scroll time picker', () => {
  async function renderScroll({
    focused = 'hours' as 'hours' | 'minutes',
    hours = 9,
    is24Hour = false,
    minutes = 45,
    onChange = jest.fn(),
    onFocusInput = jest.fn(),
  } = {}) {
    return {
      onChange,
      onFocusInput,
      ...(await render(
        <TimePicker
          focused={focused}
          hours={hours}
          inputType="scroll"
          locale="en"
          minutes={minutes}
          onChange={onChange}
          onFocusInput={onFocusInput}
          use24HourClock={is24Hour}
        />
      )),
    }
  }

  function scrollEvent(y: number, velocityY = 0) {
    return {
      nativeEvent: {
        contentOffset: { x: 0, y },
        velocity: { x: 0, y: velocityY },
      },
    }
  }

  it('steps hours and minutes from neighbors, actions, and the wheels', async () => {
    const picker = await renderScroll()
    expect(picker.getByTestId('time-scroll-keyboard')).toBeTruthy()
    await fireEvent.press(
      picker.getByTestId('time-scroll-hours-next', {
        includeHiddenElements: true,
      })
    )
    expect(picker.onChange).toHaveBeenCalledWith(
      expect.objectContaining({ focused: 'hours', hours: 10, minutes: 45 })
    )
    await fireEvent.press(
      picker.getByTestId('time-scroll-hours-previous', {
        includeHiddenElements: true,
      })
    )
    expect(picker.onChange).toHaveBeenCalledWith(
      expect.objectContaining({ hours: 8, minutes: 45 })
    )
    await fireEvent(
      picker.getByTestId('time-scroll-minutes-control', {
        includeHiddenElements: true,
      }),
      'accessibilityAction',
      { nativeEvent: { actionName: 'increment' } }
    )
    expect(picker.onChange).toHaveBeenCalledWith(
      expect.objectContaining({ focused: 'minutes', minutes: 46 })
    )
    await fireEvent(
      picker.getByTestId('time-scroll-minutes-control', {
        includeHiddenElements: true,
      }),
      'accessibilityAction',
      { nativeEvent: { actionName: 'decrement' } }
    )
    expect(picker.onChange).toHaveBeenCalledWith(
      expect.objectContaining({ minutes: 44 })
    )
    await fireEvent(
      picker.getByTestId('time-scroll-hours-control', {
        includeHiddenElements: true,
      }),
      'accessibilityAction',
      { nativeEvent: { actionName: 'activate' } }
    )
    await fireEvent(
      picker.getByTestId('time-scroll-hours-control', {
        includeHiddenElements: true,
      }),
      'touchStart'
    )
    expect(picker.onFocusInput).toHaveBeenCalledWith('hours')

    const hours = picker.getByTestId('time-scroll-hours', {
      includeHiddenElements: true,
    })
    const callsBeforeRecenter = picker.onChange.mock.calls.length
    await fireEvent.scroll(hours, scrollEvent(8 * scrollItemHeight))
    await fireEvent(
      hours,
      'momentumScrollEnd',
      scrollEvent(8 * scrollItemHeight)
    )
    await fireEvent(
      hours,
      'momentumScrollEnd',
      scrollEvent(20 * scrollItemHeight)
    )
    hours.props.onScrollEndDrag(scrollEvent(9 * scrollItemHeight, 2))
    expect(picker.onChange.mock.calls.length).toBe(callsBeforeRecenter)
    await fireEvent(
      hours,
      'scrollEndDrag',
      scrollEvent(9 * scrollItemHeight, 0)
    )
    expect(picker.onChange).toHaveBeenCalledWith(
      expect.objectContaining({ hours: 10 })
    )
    await fireEvent(
      hours,
      'momentumScrollEnd',
      scrollEvent(21 * scrollItemHeight)
    )
    await fireEvent.press(picker.getByLabelText('PM'))
    expect(picker.onChange).toHaveBeenCalledWith(
      expect.objectContaining({ hours: 21 })
    )
  })

  it('keeps 12 on the current side of noon and wraps a 24-hour wheel', async () => {
    const morning = await renderScroll({ hours: 8, minutes: 0 })
    await fireEvent(
      morning.getByTestId('time-scroll-hours-control', {
        includeHiddenElements: true,
      }),
      'accessibilityAction',
      { nativeEvent: { actionName: 'increment' } }
    )
    morning.onChange.mockClear()
    const noon = await renderScroll({ hours: 0, minutes: 15 })
    await fireEvent.press(
      noon.getByTestId('time-scroll-hours-previous', {
        includeHiddenElements: true,
      })
    )
    expect(noon.onChange).toHaveBeenCalledWith(
      expect.objectContaining({ hours: 11 })
    )
    await fireEvent.press(
      noon.getByTestId('time-scroll-hours-next', {
        includeHiddenElements: true,
      })
    )
    expect(noon.onChange).toHaveBeenCalledWith(
      expect.objectContaining({ hours: 1 })
    )
    const evening = await renderScroll({ hours: 12, minutes: 0 })
    await fireEvent.press(
      evening.getByTestId('time-scroll-hours-previous', {
        includeHiddenElements: true,
      })
    )
    expect(evening.onChange).toHaveBeenCalledWith(
      expect.objectContaining({ hours: 23 })
    )

    const beforeNoon = await renderScroll({ hours: 11, minutes: 0 })
    await fireEvent.press(
      beforeNoon.getByTestId('time-scroll-hours-next', {
        includeHiddenElements: true,
      })
    )
    expect(beforeNoon.onChange).toHaveBeenCalledWith(
      expect.objectContaining({ hours: 0 })
    )
    const afterNoon = await renderScroll({ hours: 13, minutes: 0 })
    await fireEvent.press(
      afterNoon.getByTestId('time-scroll-hours-previous', {
        includeHiddenElements: true,
      })
    )
    expect(afterNoon.onChange).toHaveBeenCalledWith(
      expect.objectContaining({ hours: 12 })
    )

    const fullDay = await renderScroll({
      hours: 23,
      is24Hour: true,
      minutes: 59,
    })
    expect(fullDay.queryByLabelText('AM')).toBeNull()
    expect(fullDay.getByTestId('time-scroll-keyboard')).toBeTruthy()
    await fireEvent(
      fullDay.getByTestId('time-scroll-hours-control', {
        includeHiddenElements: true,
      }),
      'accessibilityAction',
      { nativeEvent: { actionName: 'increment' } }
    )
    expect(fullDay.onChange).toHaveBeenCalledWith(
      expect.objectContaining({ hours: 0, minutes: 59 })
    )
    await fireEvent(
      fullDay.getByTestId('time-scroll-hours-control', {
        includeHiddenElements: true,
      }),
      'accessibilityAction',
      { nativeEvent: { actionName: 'decrement' } }
    )
    expect(fullDay.onChange).toHaveBeenCalledWith(
      expect.objectContaining({ hours: 22 })
    )
  })

  it('moves the focused wheel from the arrow keys on web', async () => {
    const previousOS = Platform.OS
    Platform.OS = 'web'
    const listeners = new Set<(event: KeyboardEvent) => void>()
    const previousWindow = globalThis.window
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: {
        addEventListener: (
          _type: string,
          listener: (event: KeyboardEvent) => void
        ) => {
          listeners.add(listener)
        },
        removeEventListener: (
          _type: string,
          listener: (event: KeyboardEvent) => void
        ) => {
          listeners.delete(listener)
        },
      },
    })
    const key = (name: string, target: EventTarget | null = null) =>
      ({
        key: name,
        preventDefault: jest.fn(),
        target,
      }) as unknown as KeyboardEvent

    try {
      const picker = await renderScroll({
        hours: 9,
        is24Hour: true,
        minutes: 30,
      })
      expect(listeners.size).toBe(1)
      const hourListener = [...listeners][0]
      hourListener(key('ArrowLeft'))
      hourListener(
        key('ArrowDown', { tagName: 'INPUT' } as unknown as EventTarget)
      )
      hourListener(
        key('ArrowDown', { tagName: 'TEXTAREA' } as unknown as EventTarget)
      )
      hourListener(key('ArrowDown', 1 as unknown as EventTarget))
      hourListener(key('ArrowDown'))
      hourListener(key('ArrowDown', {} as unknown as EventTarget))
      hourListener(key('ArrowUp'))
      hourListener(
        key('ArrowDown', { tagName: 'DIV' } as unknown as EventTarget)
      )
      expect(picker.onChange).toHaveBeenCalledWith(
        expect.objectContaining({ hours: 10 })
      )
      expect(picker.onChange).toHaveBeenCalledWith(
        expect.objectContaining({ hours: 8 })
      )

      const idle = await renderScroll({
        focused: 'minutes',
        hours: 9,
        is24Hour: true,
        minutes: 30,
      })
      const minuteListener = [...listeners].find(
        (listener) => listener !== hourListener
      )
      minuteListener?.(key('ArrowDown'))
      expect(idle.onChange).toHaveBeenCalledWith(
        expect.objectContaining({ focused: 'minutes', minutes: 31 })
      )

      Object.defineProperty(globalThis, 'window', {
        configurable: true,
        value: {},
      })
      await renderScroll({ hours: 4, is24Hour: true, minutes: 0 })
    } finally {
      Platform.OS = previousOS
      Object.defineProperty(globalThis, 'window', {
        configurable: true,
        value: previousWindow,
      })
    }
  })
})

describe('disabled time picker', () => {
  const theme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      onPrimary: 'rgb(30, 31, 32)',
      onSurface: 'rgb(20, 21, 22)',
      primary: 'rgb(4, 5, 6)',
    },
  }
  const content = withAlpha(theme.colors.onSurface, 0.38)
  const container = withAlpha(theme.colors.onSurface, 0.12)

  function paint(
    node: unknown,
    key: 'backgroundColor' | 'borderColor' | 'color'
  ): string[] {
    if (Array.isArray(node)) return node.flatMap((child) => paint(child, key))
    if (!node || typeof node !== 'object') return []
    const record = node as { children?: unknown; props?: { style?: unknown } }
    const value = StyleSheet.flatten(
      record.props?.style as Parameters<typeof StyleSheet.flatten>[0]
    )?.[key]
    const nested = paint(record.children, key)
    return typeof value === 'string' ? [value, ...nested] : nested
  }

  it('fades the fields and ignores edits', async () => {
    const onChange = jest.fn()
    const picker = await render(
      <ThemeProvider theme={theme}>
        <TimePicker
          disabled
          focused="hours"
          hours={9}
          inputType="scroll"
          locale="en"
          minutes={45}
          onChange={onChange}
          onFocusInput={jest.fn()}
        />
      </ThemeProvider>
    )
    expect(paint(picker.toJSON(), 'color')).toContain(content)
    expect(paint(picker.toJSON(), 'backgroundColor')).toContain(container)

    await fireEvent.press(
      picker.getByTestId('time-scroll-hours-next', {
        includeHiddenElements: true,
      })
    )
    await fireEvent(
      picker.getByTestId('time-scroll-hours-control', {
        includeHiddenElements: true,
      }),
      'accessibilityAction',
      { nativeEvent: { actionName: 'increment' } }
    )
    await fireEvent.press(picker.getByLabelText('PM'))
    await fireEvent.press(picker.getByLabelText('Toggle input picker'))
    expect(onChange).not.toHaveBeenCalled()
    expect(picker.queryByLabelText('Hour')).toBeNull()

    const keyboard = await render(
      <ThemeProvider theme={theme}>
        <TimePicker
          disabled
          focused="hours"
          hours={9}
          inputType="keyboard"
          locale="en"
          minutes={45}
          onChange={onChange}
          onFocusInput={jest.fn()}
        />
      </ThemeProvider>
    )
    const hour = keyboard.getByLabelText('Hour')
    expect(hour.props.editable).toBe(false)
    expect(StyleSheet.flatten(hour.props.style).color).toBe(content)
    expect(paint(keyboard.toJSON(), 'borderColor')).toContain(content)
    await fireEvent.changeText(hour, '11')
    await fireEvent.press(keyboard.getByLabelText('PM'))
    expect(onChange).not.toHaveBeenCalled()
    expect(hour.props.value).toBe('09')
  })

  it('blocks the dial and the modal confirm button', async () => {
    const configs: Array<Record<string, Function>> = []
    const create = PanResponder.create.bind(PanResponder)
    const onChange = jest.fn()
    const spy = jest
      .spyOn(PanResponder, 'create')
      .mockImplementation((config) => {
        configs.push(config as Record<string, Function>)
        return create(config)
      })
    const onConfirm = jest.fn()
    const onDismiss = jest.fn()

    try {
      await setWindow(800, 900)
      const dial = await render(
        <ThemeProvider theme={theme}>
          <TimePicker
            disabled
            focused="hours"
            hours={9}
            inputType="picker"
            locale="en"
            minutes={30}
            onChange={onChange}
            onFocusInput={jest.fn()}
          />
        </ThemeProvider>
      )
      const responder = configs[configs.length - 1]
      expect(responder.onStartShouldSetPanResponder()).toBe(false)
      responder.onPanResponderGrant(clockEvent(0, 0))
      responder.onPanResponderRelease(clockEvent(96, 0))
      await fireEvent(
        dial.getByLabelText('Hour 3 of 12'),
        'accessibilityAction',
        { nativeEvent: { actionName: 'activate' } }
      )
      expect(onChange).not.toHaveBeenCalled()
      expect(paint(dial.toJSON(), 'color')).toContain(
        withAlpha(theme.colors.onPrimary, 0.38)
      )
      expect(paint(dial.toJSON(), 'backgroundColor')).toContain(
        withAlpha(theme.colors.primary, 0.38)
      )

      const modal = await render(
        <TimePickerModal
          defaultInputType="keyboard"
          disabled
          hours={10}
          locale="en"
          minutes={15}
          onConfirm={onConfirm}
          onDismiss={onDismiss}
          use24HourClock
          visible
        />
      )
      await fireEvent.press(modal.getByText('OK'))
      await fireEvent.press(modal.getByLabelText('Toggle dial picker'))
      expect(onConfirm).not.toHaveBeenCalled()
      expect(modal.getByLabelText('Hour')).toBeTruthy()
      await fireEvent.press(modal.getByText('Cancel'))
      expect(onDismiss).toHaveBeenCalledTimes(1)
    } finally {
      spy.mockRestore()
    }
  })
})
