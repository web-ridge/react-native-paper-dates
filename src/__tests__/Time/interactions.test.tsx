import { act, fireEvent, render, within } from '@testing-library/react-native'
import { useState } from 'react'
import {
  Dimensions,
  PanResponder,
  Platform,
  ScrollView,
  StyleSheet,
} from 'react-native'
import { DarkTheme, PaperProvider, ThemeProvider } from 'react-native-paper'

import { DisplayModeContext } from '../../contexts/DisplayModeContext'
import { withAlpha } from '../../shared/utils'
import { findPress } from '../../testUtils'
import AmPmSwitcher from '../../Time/AmPmSwitcher'
import AnalogClock from '../../Time/AnalogClock'
import AnalogClockHours from '../../Time/AnalogClockHours'
import AnalogClockMinutes from '../../Time/AnalogClockMinutes'
import AnimatedClockSwitcher from '../../Time/AnimatedClockSwitcher'
import ClockNumber from '../../Time/ClockNumber'
import {
  asWheelTarget,
  bindTrackpadWheel,
  loopCopies,
  wheelSpan,
} from '../../Time/ScrollTimePicker'
import TimeInput from '../../Time/TimeInput'
import TimeInputs from '../../Time/TimeInputs'
import TimePicker from '../../Time/TimePicker'
import TimePickerModal from '../../Time/TimePickerModal'
import { scrollItemHeight, timeSeparatorWidth } from '../../Time/timeUtils'
import en from '../../translations/en'
import { registerTranslation } from '../../translations/utils'

registerTranslation('en', en)

registerTranslation('en-US', en)

registerTranslation('en-GB', en)

const originalOS = Platform.OS

const savedWindow = Dimensions.get('window')

afterEach(async () => {
  Platform.OS = originalOS
  jest.useFakeTimers()
  await act(async () => {
    Dimensions.set({ screen: savedWindow, window: savedWindow })
    jest.clearAllTimers()
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
  it('commits a drag only when the snapped minute changes', async () => {
    const configs: Array<Record<string, Function>> = []
    const create = PanResponder.create.bind(PanResponder)
    const spy = jest
      .spyOn(PanResponder, 'create')
      .mockImplementation((config) => {
        configs.push(config as Record<string, Function>)
        return create(config)
      })
    const changes: number[] = []
    function Harness() {
      const [minutes, setMinutes] = useState(30)
      return (
        <AnalogClock
          focused="minutes"
          hours={9}
          is24Hour={false}
          minutes={minutes}
          onChange={(next) => {
            changes.push(next.minutes)
            setMinutes(next.minutes)
          }}
        />
      )
    }
    try {
      await render(<Harness />)
      const responder = configs[configs.length - 1]
      await act(async () => {
        responder.onPanResponderGrant(clockEvent(128, 0))
      })
      for (const x of [128.5, 129, 129.5]) {
        await act(async () => {
          responder.onPanResponderMove(clockEvent(x, 0))
        })
      }
      await act(async () => {
        responder.onPanResponderMove(clockEvent(256, 128))
      })
      await act(async () => {
        responder.onPanResponderRelease(clockEvent(256, 128))
      })
      expect(changes).toEqual([0, 15])
      expect(configs).toHaveLength(1)
    } finally {
      spy.mockRestore()
    }
  })

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
        expect.stringContaining(
          'The locale xx is not registered, see https://web-ridge.github.io/react-native-paper-dates/guide/localization'
        )
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
        onSurfaceVariant: 'rgb(7, 8, 9)',
        onTertiaryContainer: 'rgb(10, 11, 12)',
        primary: 'rgb(4, 5, 6)',
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
    expect(StyleSheet.flatten(hour.props.style).color).toBe('rgb(0, 255, 0)')
    await fireEvent(hour, 'blur')
    expect(StyleSheet.flatten(hour.props.style).color).toBe('rgb(0, 255, 0)')
    if (hour.parent) await fireEvent(hour.parent, 'mouseEnter')
    expect(layer('rgba(20, 21, 22, 0.08)')).toBe(true)

    const minute = states.getByLabelText('Minute')
    await fireEvent(minute, 'hoverIn')
    await fireEvent(minute, 'focus')
    await fireEvent(minute, 'pressIn')
    expect(layer('rgba(20, 21, 22, 0.1)')).toBe(true)
    expect(layer('rgba(20, 21, 22, 0.28)')).toBe(false)

    const morning = states.getByLabelText('AM')
    await fireEvent(morning, 'hoverIn')
    expect(layer('rgba(1, 2, 3, 0.08)')).toBe(true)
  })
})

describe('time picker modal', () => {
  it('appears with a fade instead of sliding up', async () => {
    const props = {
      hours: 15,
      minutes: 45,
      onConfirm: jest.fn(),
      onDismiss: jest.fn(),
      visible: true as const,
    }
    const animationTypeOf = (screen: { container: { queryAll: Function } }) =>
      screen.container.queryAll(
        (node: { props?: { animationType?: string } }) =>
          typeof node.props?.animationType === 'string'
      )[0]?.props.animationType

    Platform.OS = 'android'
    const android = await render(<TimePickerModal {...props} />)
    expect(animationTypeOf(android)).toBe('fade')

    const reduced = await render(
      <PaperProvider reduceMotion="on">
        <TimePickerModal {...props} />
      </PaperProvider>
    )
    expect(animationTypeOf(reduced)).toBe('fade')

    const sliding = await render(
      <TimePickerModal {...props} animationType="slide" />
    )
    expect(animationTypeOf(sliding)).toBe('slide')

    Platform.OS = 'ios'
    const ios = await render(<TimePickerModal {...props} />)
    expect(animationTypeOf(ios)).toBe('fade')

    Platform.OS = 'web'
    const web = await render(<TimePickerModal {...props} />)
    expect(animationTypeOf(web)).toBe('none')
  })

  it('mounts no picker content while hidden', async () => {
    const modal = await render(
      <TimePickerModal
        hours={15}
        locale="en"
        minutes={45}
        onConfirm={jest.fn()}
        onDismiss={jest.fn()}
        visible={false}
      />
    )
    expect(modal.toJSON()).toBeNull()
  })

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

  it('confirms a valid time when a consumer error is set', async () => {
    const onConfirm = jest.fn()
    const modal = await render(
      <TimePickerModal
        defaultInputType="keyboard"
        error
        errorText="Outside hours"
        hours={8}
        locale="en"
        minutes={0}
        onConfirm={onConfirm}
        onDismiss={jest.fn()}
        use24HourClock
        visible
      />
    )
    expect(modal.getByText('Outside hours')).toBeTruthy()
    await fireEvent.press(modal.getByText('OK'))
    expect(onConfirm).toHaveBeenCalledWith({ hours: 8, minutes: 0 })
  })

  it('switches an inline scroll picker to the keyboard and back without remounting', async () => {
    function Controlled() {
      const [hours, setHours] = useState(9)
      const [minutes, setMinutes] = useState(45)
      return (
        <TimePicker
          focused="hours"
          hours={hours}
          inputType="scroll"
          locale="en"
          minutes={minutes}
          onChange={(next) => {
            setHours(next.hours)
            setMinutes(next.minutes)
          }}
          onFocusInput={jest.fn()}
          use24HourClock={false}
        />
      )
    }

    const picker = await render(<Controlled />)
    const wheelBefore = picker.getByTestId('time-scroll-hours', {
      includeHiddenElements: true,
    })

    await fireEvent.press(picker.getByLabelText('Toggle input picker'))
    expect(picker.getByLabelText('Hour')).toBeTruthy()
    expect(picker.queryByTestId('time-scroll-hours')).toBeNull()
    expect(
      picker.getByTestId('time-scroll-hours', { includeHiddenElements: true })
    ).toBe(wheelBefore)

    await fireEvent.changeText(picker.getByLabelText('Hour'), '11')

    const scrollTo = jest
      .spyOn(ScrollView.prototype, 'scrollTo')
      .mockImplementation(() => {})
    try {
      await fireEvent.press(picker.getByLabelText('Toggle scroll picker'))
      expect(
        picker.getByTestId('time-scroll-hours', { includeHiddenElements: true })
      ).toBe(wheelBefore)
      expect(picker.queryByLabelText('Hour')).toBeNull()
      const expectedHourIndex = Math.floor(loopCopies(12) / 2) * 12 + 10
      expect(scrollTo).toHaveBeenCalledWith({
        animated: false,
        y: expectedHourIndex * scrollItemHeight,
      })
    } finally {
      scrollTo.mockRestore()
    }
  })

  it('toggles a scroll modal back to the wheels without remounting', async () => {
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
    const wheelBefore = modal.getByTestId('time-scroll-hours', {
      includeHiddenElements: true,
    })
    await fireEvent.press(modal.getByLabelText('Toggle input picker'))
    expect(modal.getByLabelText('Hour')).toBeTruthy()
    expect(modal.queryByTestId('time-scroll-hours')).toBeNull()
    await fireEvent.press(modal.getByLabelText('Toggle scroll picker'))
    expect(
      modal.getByTestId('time-scroll-hours', { includeHiddenElements: true })
    ).toBe(wheelBefore)
    expect(modal.queryByLabelText('Hour')).toBeNull()
  })

  it('separates the scroll wheels with a colon in a slot wider than the focus ring', async () => {
    const picker = await render(
      <TimePicker
        focused="hours"
        hours={9}
        inputType="scroll"
        locale="en"
        minutes={45}
        onChange={jest.fn()}
        onFocusInput={jest.fn()}
        use24HourClock
      />
    )
    const colon = picker.getByTestId('time-separator')
    expect(colon).toHaveProp('accessible', false)
    expect(StyleSheet.flatten(colon.props.style).width).toBe(timeSeparatorWidth)
    await picker.unmount()
  })

  it('keeps the 12h scroll modal keyboard toggle in the action row', async () => {
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
    expect(modal.queryByTestId('time-scroll-keyboard')).toBeNull()
    expect(modal.getAllByLabelText('Toggle input picker')).toHaveLength(1)
    await modal.unmount()
  })

  it('sizes the scroll field 140dp inline and 120dp in the modal (M3 Expressive)', async () => {
    const wheelPadding = (screen: Awaited<ReturnType<typeof render>>) =>
      StyleSheet.flatten(
        screen.getByTestId('time-scroll-hours', { includeHiddenElements: true })
          .props.contentContainerStyle
      ).paddingVertical
    const inline = await render(
      <TimePicker
        focused="hours"
        hours={9}
        inputType="scroll"
        locale="en"
        minutes={45}
        onChange={jest.fn()}
        onFocusInput={jest.fn()}
        use24HourClock
      />
    )
    expect(wheelPadding(inline)).toBe((140 - scrollItemHeight) / 2)
    await inline.unmount()
    const modal = await render(
      <TimePickerModal
        defaultInputType="scroll"
        hours={9}
        locale="en"
        minutes={45}
        onConfirm={jest.fn()}
        onDismiss={jest.fn()}
        use24HourClock
        visible
      />
    )
    expect(wheelPadding(modal)).toBe((120 - scrollItemHeight) / 2)
    await modal.unmount()
  })

  it('keeps minutes focused when AM or PM is pressed in dial mode', async () => {
    const modal = await render(
      <TimePickerModal
        defaultInputType="picker"
        hours={9}
        locale="en"
        minutes={45}
        onConfirm={jest.fn()}
        onDismiss={jest.fn()}
        use24HourClock={false}
        visible
      />
    )

    await fireEvent.press(modal.getByLabelText('Minute'))
    expect(modal.getByLabelText('Minute')).toHaveProp(
      'accessibilityState',
      expect.objectContaining({ selected: true })
    )

    await fireEvent.press(modal.getByLabelText('PM'))

    expect(modal.getByLabelText('Minute')).toHaveProp(
      'accessibilityState',
      expect.objectContaining({ selected: true })
    )
    expect(modal.getByLabelText('Hour')).toHaveProp(
      'accessibilityState',
      expect.objectContaining({ selected: false })
    )
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
    const view = await render(
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
    )
    await act(() => {
      jest.advanceTimersByTime(16)
    })
    return {
      onChange,
      onFocusInput,
      ...view,
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

  async function flushWheel() {
    await act(() => {
      jest.runAllTicks()
    })
  }

  async function scrollWheel(
    wheel: Parameters<typeof fireEvent.scroll>[0],
    y: number
  ) {
    await fireEvent.scroll(wheel, scrollEvent(y))
    await flushWheel()
  }

  function animatedRowStyle(node: { props: object }) {
    const animated = (
      node.props as {
        jestAnimatedStyle?: {
          value?: { color?: string; transform?: { scale?: number }[] }
        }
      }
    ).jestAnimatedStyle
    return animated?.value
  }

  function rowsShowing(
    picker: { queryAllByText: (text: string, options: object) => unknown[] },
    label: string
  ) {
    return picker.queryAllByText(label, { includeHiddenElements: true }).length
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
    await flushWheel()
    expect(picker.onChange.mock.calls.length).toBe(callsBeforeRecenter)
    await fireEvent(
      hours,
      'scrollEndDrag',
      scrollEvent(9 * scrollItemHeight, 0)
    )
    await fireEvent(
      hours,
      'momentumScrollEnd',
      scrollEvent(9 * scrollItemHeight)
    )
    await flushWheel()
    expect(picker.onChange).toHaveBeenCalledWith(
      expect.objectContaining({ hours: 10 })
    )
    await fireEvent(
      hours,
      'momentumScrollEnd',
      scrollEvent(21 * scrollItemHeight)
    )
    await flushWheel()
    await fireEvent.press(picker.getByLabelText('PM'))
    expect(picker.onChange).toHaveBeenCalledWith(
      expect.objectContaining({ hours: 21 })
    )
    expect(picker.onChange).not.toHaveBeenCalledWith(
      expect.objectContaining({ focused: 'hours', hours: 21 })
    )
  })

  it('keeps the minutes wheel focused when AM or PM is pressed', async () => {
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

    await fireEvent(
      modal.getByTestId('time-scroll-minutes-control', {
        includeHiddenElements: true,
      }),
      'touchStart'
    )

    const minutesWheel = () =>
      modal.getByTestId('time-scroll-minutes-control', {
        includeHiddenElements: true,
      })
    const hoursWheel = () =>
      modal.getByTestId('time-scroll-hours-control', {
        includeHiddenElements: true,
      })

    expect(minutesWheel()).toHaveProp(
      'accessibilityState',
      expect.objectContaining({ selected: true })
    )
    expect(hoursWheel()).toHaveProp(
      'accessibilityState',
      expect.objectContaining({ selected: false })
    )

    await fireEvent.press(modal.getByLabelText('PM'))

    expect(minutesWheel()).toHaveProp(
      'accessibilityState',
      expect.objectContaining({ selected: true })
    )
    expect(hoursWheel()).toHaveProp(
      'accessibilityState',
      expect.objectContaining({ selected: false })
    )
  })

  it('never moves an Android wheel mid-scroll and recenters it once it settles', async () => {
    Platform.OS = 'android'
    const scrollTo = jest
      .spyOn(ScrollView.prototype, 'scrollTo')
      .mockImplementation(() => {})
    try {
      const picker = await renderScroll({ hours: 1, minutes: 0 })
      expect(rowsShowing(picker, '00')).toBe(loopCopies(60))
      const hours = picker.getByTestId('time-scroll-hours', {
        includeHiddenElements: true,
      })
      const home = hours.props.contentOffset.y as number
      const cycle = 12 * scrollItemHeight
      const far = home + 300 * cycle + scrollItemHeight

      scrollTo.mockClear()
      await fireEvent(hours, 'scrollBeginDrag', scrollEvent(home))
      await scrollWheel(hours, home - 300 * cycle)
      await scrollWheel(hours, far)
      await fireEvent(hours, 'scrollEndDrag', scrollEvent(far, 4))
      expect(scrollTo).not.toHaveBeenCalled()

      await fireEvent(hours, 'momentumScrollEnd', scrollEvent(far))
      await flushWheel()
      expect(scrollTo).toHaveBeenCalledWith({
        animated: false,
        y: home + scrollItemHeight,
      })
      expect(picker.onChange).toHaveBeenCalledTimes(1)
      expect(picker.onChange).toHaveBeenCalledWith(
        expect.objectContaining({ hours: 2 })
      )
    } finally {
      scrollTo.mockRestore()
    }
  })

  it('gives every Android wheel a long runway past its mounted rows', async () => {
    Platform.OS = 'android'
    const picker = await renderScroll({ hours: 1, minutes: 59 })
    for (const [id, count] of [
      ['time-scroll-hours', 12],
      ['time-scroll-minutes', 60],
    ] as const) {
      const wheel = picker.getByTestId(id, { includeHiddenElements: true })
      const home = wheel.props.contentOffset.y as number
      const maxY = (wheelSpan(count) * count - 1) * scrollItemHeight
      expect(home).toBeGreaterThanOrEqual(250000)
      expect(maxY - home).toBeGreaterThanOrEqual(250000)
    }
    for (const count of [12, 24, 60]) {
      expect(wheelSpan(count, false)).toBe(loopCopies(count, false))
      expect(
        (wheelSpan(count, true) - loopCopies(count, true)) * count * 32
      ).toBeGreaterThanOrEqual(250000)
    }
    expect(loopCopies(12, true)).toBe(11)
    expect(loopCopies(24, true)).toBe(7)
    expect(loopCopies(60, true)).toBe(5)
    expect(loopCopies(12, false)).toBe(5)
    expect(loopCopies(24, false)).toBe(3)
    expect(loopCopies(60, false)).toBe(3)
  })

  it('leaves rows away from the center alone while an Android wheel scrolls', async () => {
    Platform.OS = 'android'
    const worklet = globalThis as { _WORKLET?: boolean }
    const previous = worklet._WORKLET
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {})
    const picker = await renderScroll({ hours: 1, minutes: 0 })
    try {
      const minutes = picker.getByTestId('time-scroll-minutes', {
        includeHiddenElements: true,
      })
      const home = minutes.props.contentOffset.y as number
      const middle = (label: string) =>
        within(minutes).getAllByText(label, { includeHiddenElements: true })[
          Math.floor(loopCopies(60) / 2)
        ]
      const farStyle = animatedRowStyle(middle('30'))
      await fireEvent(minutes, 'scrollBeginDrag', scrollEvent(home))
      worklet._WORKLET = true
      for (const rows of [1, 2, 3]) {
        await fireEvent.scroll(
          minutes,
          scrollEvent(home + rows * scrollItemHeight)
        )
      }
      worklet._WORKLET = previous
      await act(() => {
        jest.advanceTimersByTime(32)
      })
      expect(animatedRowStyle(middle('03'))?.transform?.[0]?.scale).toBe(1)
      expect(animatedRowStyle(middle('30'))).toBe(farStyle)
    } finally {
      worklet._WORKLET = previous
      warn.mockRestore()
    }
  })

  it('keeps the mounted Android rows under the viewport anywhere in the range', async () => {
    Platform.OS = 'android'
    const worklet = globalThis as { _WORKLET?: boolean }
    const previous = worklet._WORKLET
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {})
    const picker = await renderScroll({ hours: 1, minutes: 0 })
    try {
      const hours = picker.getByTestId('time-scroll-hours', {
        includeHiddenElements: true,
      })
      const home = hours.props.contentOffset.y as number
      const cycle = 12 * scrollItemHeight
      const middleTwo = () =>
        within(hours).getAllByText('02', { includeHiddenElements: true })[
          Math.floor(loopCopies(12) / 2)
        ]
      await fireEvent(hours, 'scrollBeginDrag', scrollEvent(home))
      await fireEvent(hours, 'scrollEndDrag', scrollEvent(home, 4))
      worklet._WORKLET = true
      await fireEvent.scroll(
        hours,
        scrollEvent(home - 40 * cycle + scrollItemHeight)
      )
      worklet._WORKLET = previous
      await act(() => {
        jest.advanceTimersByTime(32)
      })
      expect(animatedRowStyle(middleTwo())?.transform?.[0]?.scale).toBe(1)
    } finally {
      worklet._WORKLET = previous
      warn.mockRestore()
    }
  })

  it('keeps an Android wheel scroll that arrives without a drag going', async () => {
    Platform.OS = 'android'
    const scrollTo = jest
      .spyOn(ScrollView.prototype, 'scrollTo')
      .mockImplementation(() => {})
    try {
      const picker = await renderScroll({ hours: 1, minutes: 0 })
      const hours = picker.getByTestId('time-scroll-hours', {
        includeHiddenElements: true,
      })
      const home = hours.props.contentOffset.y as number

      await fireEvent(hours, 'momentumScrollEnd', scrollEvent(home))
      await flushWheel()

      scrollTo.mockClear()
      await scrollWheel(hours, home + scrollItemHeight)
      expect(scrollTo).not.toHaveBeenCalled()

      await fireEvent(hours, 'momentumScrollBegin', scrollEvent(home))
      await scrollWheel(hours, home + 13 * scrollItemHeight)
      expect(scrollTo).not.toHaveBeenCalled()

      await fireEvent(
        hours,
        'momentumScrollEnd',
        scrollEvent(home + 13 * scrollItemHeight)
      )
      await flushWheel()
      expect(scrollTo).toHaveBeenCalledWith({
        animated: false,
        y: home + scrollItemHeight,
      })
      expect(picker.onChange).toHaveBeenCalledTimes(1)
      expect(picker.onChange).toHaveBeenCalledWith(
        expect.objectContaining({ hours: 2 })
      )
    } finally {
      scrollTo.mockRestore()
    }
  })

  it('ignores stale settle and prop resyncs once a new minutes drag begins', async () => {
    Platform.OS = 'android'
    const scrollTo = jest
      .spyOn(ScrollView.prototype, 'scrollTo')
      .mockImplementation(() => {})
    try {
      const picker = await renderScroll({
        focused: 'minutes',
        hours: 1,
        minutes: 0,
      })
      const minutes = picker.getByTestId('time-scroll-minutes', {
        includeHiddenElements: true,
      })
      const control = picker.getByTestId('time-scroll-minutes-control', {
        includeHiddenElements: true,
      })
      const home = minutes.props.contentOffset.y as number
      const cycle = 60 * scrollItemHeight

      await fireEvent(minutes, 'scrollBeginDrag', scrollEvent(home))
      await fireEvent(minutes, 'scrollEndDrag', scrollEvent(home - 200, 4))
      await scrollWheel(minutes, home - cycle + 10 * scrollItemHeight)

      scrollTo.mockClear()
      await fireEvent(control, 'touchStart')
      await fireEvent(minutes, 'scrollBeginDrag', scrollEvent(home - cycle))
      await fireEvent(
        minutes,
        'momentumScrollEnd',
        scrollEvent(home - cycle + 10 * scrollItemHeight)
      )
      await flushWheel()
      expect(scrollTo).not.toHaveBeenCalled()
      expect(picker.onChange).not.toHaveBeenCalled()

      await picker.rerender(
        <TimePicker
          focused="minutes"
          hours={1}
          inputType="scroll"
          locale="en"
          minutes={5}
          onChange={picker.onChange}
          onFocusInput={picker.onFocusInput}
          use24HourClock={false}
        />
      )
      expect(scrollTo).not.toHaveBeenCalled()

      await fireEvent(
        minutes,
        'scrollEndDrag',
        scrollEvent(home - 2 * scrollItemHeight, 4)
      )
      await fireEvent(control, 'touchEnd')
      await fireEvent(
        minutes,
        'momentumScrollEnd',
        scrollEvent(home + 2 * scrollItemHeight)
      )
      await flushWheel()
      expect(picker.onChange).toHaveBeenCalledWith(
        expect.objectContaining({ minutes: 2 })
      )
      expect(scrollTo).toHaveBeenCalledWith({
        animated: false,
        y: home + 2 * scrollItemHeight,
      })
    } finally {
      scrollTo.mockRestore()
    }
  })

  it('reports a settled wheel value only once', async () => {
    const picker = await renderScroll({ hours: 9, minutes: 0 })
    const minutes = picker.getByTestId('time-scroll-minutes', {
      includeHiddenElements: true,
    })
    const home = minutes.props.contentOffset.y as number
    const next = home + 2 * scrollItemHeight
    await fireEvent(minutes, 'scrollBeginDrag', scrollEvent(home))
    await fireEvent(minutes, 'scrollEndDrag', scrollEvent(next, 4))
    await fireEvent(minutes, 'momentumScrollEnd', scrollEvent(next))
    await flushWheel()
    await fireEvent(minutes, 'momentumScrollEnd', scrollEvent(next))
    await flushWheel()
    expect(picker.onChange).toHaveBeenCalledTimes(1)
    expect(picker.onChange).toHaveBeenCalledWith(
      expect.objectContaining({ hours: 9, minutes: 2 })
    )
  })

  it('does not report a value the parent already applied', async () => {
    const onChange = jest.fn()
    const picker = await renderScroll({ hours: 9, minutes: 0, onChange })
    const minutes = picker.getByTestId('time-scroll-minutes', {
      includeHiddenElements: true,
    })
    const home = minutes.props.contentOffset.y as number
    await picker.rerender(
      <TimePicker
        focused="hours"
        hours={9}
        inputType="scroll"
        locale="en"
        minutes={2}
        onChange={onChange}
        onFocusInput={picker.onFocusInput}
        use24HourClock={false}
      />
    )
    await fireEvent(
      minutes,
      'momentumScrollEnd',
      scrollEvent(home + 2 * scrollItemHeight)
    )
    await flushWheel()
    expect(onChange).not.toHaveBeenCalled()
  })

  it('scrolls a web wheel to the selected value after its rows mount', async () => {
    Platform.OS = 'web'
    const scrollTo = jest
      .spyOn(ScrollView.prototype, 'scrollTo')
      .mockImplementation(() => {})
    try {
      await renderScroll({ hours: 9, minutes: 45 })
      const hourIndex = Math.floor(loopCopies(12) / 2) * 12 + 8
      const minuteIndex = Math.floor(loopCopies(60) / 2) * 60 + 45
      expect(scrollTo).toHaveBeenCalledWith({
        animated: false,
        y: hourIndex * scrollItemHeight,
      })
      expect(scrollTo).toHaveBeenCalledWith({
        animated: false,
        y: minuteIndex * scrollItemHeight,
      })
    } finally {
      scrollTo.mockRestore()
    }
  })

  it('keeps all rows mounted across scrolls without unmounting', async () => {
    const picker = await renderScroll({ focused: 'minutes', minutes: 0 })
    const minutes = picker.getByTestId('time-scroll-minutes', {
      includeHiddenElements: true,
    })
    const home = minutes.props.contentOffset.y as number
    const hidden = { includeHiddenElements: true }
    const expectedCopies = loopCopies(60)
    expect(rowsShowing(picker, '00')).toBe(expectedCopies)
    expect(rowsShowing(picker, '30')).toBe(expectedCopies)

    await fireEvent(minutes, 'scrollBeginDrag', scrollEvent(home))
    await scrollWheel(minutes, home + 30 * scrollItemHeight)

    expect(rowsShowing(picker, '00')).toBe(expectedCopies)
    expect(rowsShowing(picker, '30')).toBe(expectedCopies)
    expect(
      picker.getByTestId('time-scroll-minutes-previous', hidden)
    ).toBeTruthy()
    expect(picker.getByTestId('time-scroll-minutes-next', hidden)).toBeTruthy()
  })

  it('moves the highlight with the scroll and commits only on settle', async () => {
    const picker = await renderScroll({ focused: 'minutes', minutes: 0 })
    const minutes = picker.getByTestId('time-scroll-minutes', {
      includeHiddenElements: true,
    })
    const home = minutes.props.contentOffset.y as number
    const centerCopy = Math.floor(loopCopies(60) / 2)
    const rowText = (label: string) =>
      within(minutes).getAllByText(label, { includeHiddenElements: true })[
        centerCopy
      ]

    await fireEvent(minutes, 'scrollBeginDrag', scrollEvent(home))
    await scrollWheel(minutes, home + scrollItemHeight)
    await scrollWheel(minutes, home + 2 * scrollItemHeight)
    await act(() => {
      jest.advanceTimersByTime(32)
    })

    const twoStyle = animatedRowStyle(rowText('02'))
    const zeroStyle = animatedRowStyle(rowText('00'))
    expect(twoStyle?.transform?.[0]?.scale).toBe(1)
    expect(zeroStyle?.transform?.[0]?.scale).toBeLessThan(1)
    expect(twoStyle?.color).not.toBe(zeroStyle?.color)
    expect(picker.onChange).not.toHaveBeenCalled()

    await fireEvent(
      minutes,
      'scrollEndDrag',
      scrollEvent(home + 2 * scrollItemHeight)
    )
    await fireEvent(
      minutes,
      'momentumScrollEnd',
      scrollEvent(home + 2 * scrollItemHeight)
    )
    await flushWheel()
    expect(picker.onChange).toHaveBeenCalledTimes(1)
    expect(picker.onChange).toHaveBeenCalledWith(
      expect.objectContaining({ minutes: 2 })
    )
  })

  it('wraps a spin past 12 without sticking on the last row', async () => {
    const picker = await renderScroll({ hours: 12, minutes: 0 })
    const hours = picker.getByTestId('time-scroll-hours', {
      includeHiddenElements: true,
    })
    const home = hours.props.contentOffset.y as number
    await fireEvent(hours, 'scrollBeginDrag', scrollEvent(home))
    await fireEvent.scroll(hours, scrollEvent(home))
    await fireEvent(
      hours,
      'scrollEndDrag',
      scrollEvent(home + scrollItemHeight, 1)
    )
    await fireEvent.scroll(hours, scrollEvent(home + scrollItemHeight))
    await fireEvent.scroll(hours, scrollEvent(0))
    await fireEvent.scroll(hours, scrollEvent(10000 * scrollItemHeight))
    await fireEvent(
      hours,
      'momentumScrollEnd',
      scrollEvent(home + scrollItemHeight)
    )
    await flushWheel()
    expect(picker.onChange).toHaveBeenCalledWith(
      expect.objectContaining({ hours: 13 })
    )
    await fireEvent(hours, 'momentumScrollEnd', scrollEvent(home))
    await flushWheel()
    expect(picker.onChange).toHaveBeenCalledWith(
      expect.objectContaining({ hours: 12 })
    )
    expect(picker.onChange).toHaveBeenCalledTimes(2)
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

  it('keeps a hard trackpad flick on the wheel', () => {
    const listeners: {
      capture: boolean
      listener: (event: WheelEvent) => void
      passive: boolean
      type: string
    }[] = []
    const node = {
      addEventListener: (
        type: 'pointerenter' | 'pointerleave' | 'wheel',
        listener: (event: WheelEvent) => void,
        options?: boolean | AddEventListenerOptions
      ) => {
        const capture =
          typeof options === 'boolean' ? options : options?.capture === true
        const passive =
          typeof options === 'object' && options?.passive === false
            ? false
            : true
        listeners.push({ capture, listener, passive, type })
      },
      ownerDocument: {
        defaultView: {
          getComputedStyle: (el: { style?: { overflowY?: string } }) => ({
            overflowY: el.style?.overflowY ?? 'visible',
          }),
        },
      },
      parentElement: {
        clientHeight: 400,
        ownerDocument: undefined as
          | {
              defaultView?: {
                getComputedStyle?: (el: { style?: { overflowY?: string } }) => {
                  overflowY?: string
                }
              }
            }
          | undefined,
        parentElement: null,
        scrollHeight: 2000,
        scrollTop: 250,
        style: { overflowY: 'auto' },
      },
      removeEventListener: (
        _type: 'pointerenter' | 'pointerleave' | 'wheel',
        listener: (event: WheelEvent) => void
      ) => {
        const index = listeners.findIndex((item) => item.listener === listener)
        if (index >= 0) listeners.splice(index, 1)
      },
      scrollTop: 68 * scrollItemHeight,
      style: {} as { overscrollBehavior?: string },
    }
    node.parentElement.ownerDocument = node.ownerDocument
    const onFocus = jest.fn()
    const onSettle = jest.fn()
    const state = {
      current: { copies: 11, count: 12, onFocus, onSettle },
    }
    const wheel = (deltaY: number, extra: Partial<WheelEvent> = {}) =>
      ({
        ctrlKey: false,
        deltaMode: 0,
        deltaX: 0,
        deltaY,
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
        ...extra,
      }) as WheelEvent

    expect(asWheelTarget(null)).toBeNull()
    expect(asWheelTarget({ scrollTop: 0 })).toBeNull()
    expect(asWheelTarget({ getScrollableNode: 1 })).toBeNull()
    expect(asWheelTarget({ getScrollableNode: () => 4 })).toBeNull()
    expect(
      asWheelTarget({
        getScrollableNode: () => {
          throw new Error('native')
        },
      })
    ).toBeNull()
    expect(asWheelTarget(node)).toBe(node)
    expect(asWheelTarget({ getScrollableNode: () => node })).toBe(node)

    const unbind = bindTrackpadWheel(node, state)
    expect(node.style.overscrollBehavior).toBe('none')
    const wheelListener = listeners.find((item) => item.type === 'wheel')
    expect(wheelListener).toEqual(
      expect.objectContaining({
        capture: true,
        passive: false,
        type: 'wheel',
      })
    )

    const pinch = wheel(800, { ctrlKey: true })
    wheelListener?.listener(pinch)
    expect(pinch.preventDefault).not.toHaveBeenCalled()

    const sideways = wheel(10, { deltaX: 40, deltaY: 4 })
    wheelListener?.listener(sideways)
    expect(node.parentElement.style.overflowY).toBe('hidden')
    expect(sideways.preventDefault).toHaveBeenCalled()
    expect(node.scrollTop).toBe(68 * scrollItemHeight + 4)
    node.scrollTop = 68 * scrollItemHeight

    const locked = wheel(500, { cancelable: false })
    wheelListener?.listener(locked)
    expect(locked.preventDefault).not.toHaveBeenCalled()
    expect(locked.stopPropagation).toHaveBeenCalled()
    expect(node.scrollTop).toBe(68 * scrollItemHeight)
    node.parentElement.scrollTop = 900

    const idle = wheel(0)
    wheelListener?.listener(idle)
    expect(idle.preventDefault).not.toHaveBeenCalled()

    const flick = wheel(100 * scrollItemHeight)
    wheelListener?.listener(flick)
    expect(flick.preventDefault).toHaveBeenCalled()
    expect(flick.stopPropagation).toHaveBeenCalled()
    expect(onFocus).toHaveBeenCalled()
    expect(node.scrollTop).toBe(60 * scrollItemHeight)
    expect(node.parentElement.scrollTop).toBe(250)

    const notch = wheel(2, { deltaMode: 1 })
    wheelListener?.listener(notch)
    expect(node.scrollTop).toBe(62 * scrollItemHeight)
    wheelListener?.listener(wheel(1, { deltaMode: 2 }))

    jest.advanceTimersByTime(120)
    expect(onSettle).toHaveBeenCalledTimes(1)
    expect(onSettle).toHaveBeenCalledWith(node.scrollTop)
    expect(node.parentElement.style.overflowY).toBe('auto')

    unbind()
    expect(listeners).toHaveLength(0)
    jest.advanceTimersByTime(120)
    expect(onSettle).toHaveBeenCalledTimes(1)

    const plain = { ...node, style: undefined }
    bindTrackpadWheel(plain, state)()
    expect(plain.style).toBeUndefined()
  })

  it('hides page scrolling while the pointer is over a wheel', () => {
    const scrollListeners: (() => void)[] = []
    const page = {
      addEventListener: (_type: 'scroll', listener: () => void) => {
        scrollListeners.push(listener)
      },
      clientHeight: 400,
      parentElement: null,
      removeEventListener: (_type: 'scroll', listener: () => void) => {
        const index = scrollListeners.indexOf(listener)
        if (index >= 0) scrollListeners.splice(index, 1)
      },
      scrollHeight: 2000,
      scrollTop: 180,
      style: { overflowY: 'auto' },
    }
    const listeners: Record<string, () => void> = {}
    const node = {
      addEventListener: (
        type: 'pointerenter' | 'pointerleave' | 'wheel',
        listener: (event: WheelEvent) => void
      ) => {
        listeners[type] = listener as () => void
      },
      ownerDocument: {
        defaultView: {
          getComputedStyle: (el: { style?: { overflowY?: string } }) => ({
            overflowY: el.style?.overflowY ?? 'visible',
          }),
        },
        scrollingElement: page,
      },
      parentElement: page,
      removeEventListener: (
        type: 'pointerenter' | 'pointerleave' | 'wheel',
        _listener: (event: WheelEvent) => void
      ) => {
        delete listeners[type]
      },
      scrollTop: 0,
      style: {} as { overscrollBehavior?: string },
    }
    const otherListeners: Record<string, () => void> = {}
    const other = {
      ...node,
      addEventListener: (
        type: 'pointerenter' | 'pointerleave' | 'wheel',
        listener: (event: WheelEvent) => void
      ) => {
        otherListeners[type] = listener as () => void
      },
      removeEventListener: (
        type: 'pointerenter' | 'pointerleave' | 'wheel',
        _listener: (event: WheelEvent) => void
      ) => {
        delete otherListeners[type]
      },
      style: {} as { overscrollBehavior?: string },
    }
    const state = {
      current: {
        copies: 11,
        count: 12,
        onFocus: jest.fn(),
        onSettle: jest.fn(),
      },
    }
    const unbind = bindTrackpadWheel(node, state)
    const unbindOther = bindTrackpadWheel(other, state)

    listeners.pointerenter()
    expect(page.style.overflowY).toBe('hidden')
    otherListeners.pointerenter()
    listeners.pointerleave()
    expect(page.style.overflowY).toBe('hidden')

    page.scrollTop = 900
    scrollListeners.forEach((listener) => listener())
    expect(page.scrollTop).toBe(180)

    otherListeners.pointerleave()
    expect(page.style.overflowY).toBe('auto')
    expect(scrollListeners).toHaveLength(0)

    unbind()
    unbindOther()
  })

  it('applies a trackpad flick to the hour wheel on web', async () => {
    Platform.OS = 'web'
    const picker = await renderScroll({ hours: 9, minutes: 45 })
    const nodes = ['time-scroll-hours', 'time-scroll-minutes'].map((id) => {
      const bound: ((event: WheelEvent) => void)[] = []
      const node = {
        __nativeTag: 1,
        addEventListener: (
          type: string,
          listener: (event: WheelEvent) => void
        ) => {
          if (type === 'wheel') bound.push(listener)
        },
        bound,
        removeEventListener: (
          _type: string,
          listener: (event: WheelEvent) => void
        ) => {
          const index = bound.indexOf(listener)
          if (index >= 0) bound.splice(index, 1)
        },
        scrollTop: 68 * scrollItemHeight,
        style: {} as { overscrollBehavior?: string },
      }
      const host = picker.getByTestId(id, { includeHiddenElements: true })
      let fiber = (
        host as {
          unstable_fiber?: {
            return: unknown
            stateNode?: { getScrollableNode?: () => unknown }
          } | null
        }
      ).unstable_fiber
      let instance: { getScrollableNode?: () => unknown } | null = null
      for (let depth = 0; fiber && depth < 8; depth += 1) {
        if (typeof fiber.stateNode?.getScrollableNode === 'function') {
          instance = fiber.stateNode
          break
        }
        fiber = fiber.return as typeof fiber
      }
      if (!instance) throw new Error(`missing scroll view for ${id}`)
      instance.getScrollableNode = () => node
      return node
    })
    const props = {
      focused: 'hours' as const,
      hours: 9,
      inputType: 'scroll' as const,
      locale: 'en',
      minutes: 45,
      onChange: picker.onChange,
      onFocusInput: picker.onFocusInput,
    }
    await picker.rerender(<TimePicker disabled {...props} />)
    await picker.rerender(<TimePicker {...props} />)
    const flick = {
      ctrlKey: false,
      deltaMode: 0,
      deltaX: 0,
      deltaY: scrollItemHeight,
      preventDefault: jest.fn(),
      stopPropagation: jest.fn(),
    } as unknown as WheelEvent
    const scrollTo = jest
      .spyOn(ScrollView.prototype, 'scrollTo')
      .mockImplementation(() => {})
    try {
      await act(async () => {
        nodes[0].bound[0](flick)
        jest.advanceTimersByTime(120)
      })
      const parked = nodes[0].scrollTop
      scrollTo.mockClear()
      await act(async () => {
        nodes[0].bound[0](flick)
      })
      expect(nodes[0].scrollTop).not.toBe(parked)
      await fireEvent.scroll(
        picker.getByTestId('time-scroll-hours', {
          includeHiddenElements: true,
        }),
        scrollEvent(nodes[0].scrollTop)
      )
      expect(scrollTo).not.toHaveBeenCalled()
    } finally {
      scrollTo.mockRestore()
    }
    expect(flick.preventDefault).toHaveBeenCalled()
    expect(picker.onFocusInput).toHaveBeenCalledWith('hours')
    expect(picker.onChange).toHaveBeenCalledWith(
      expect.objectContaining({ focused: 'hours', hours: 10, minutes: 45 })
    )
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
