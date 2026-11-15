import { act, fireEvent, render } from '@testing-library/react-native'
import { findPress } from '../../testUtils'
import { Dimensions, PanResponder, Platform, StyleSheet } from 'react-native'
import { DarkTheme, ThemeProvider } from 'react-native-paper'
import { DisplayModeContext } from '../../contexts/DisplayModeContext'
import AmPmSwitcher from '../../Time/AmPmSwitcher'
import AnalogClock from '../../Time/AnalogClock'
import AnalogClockHours from '../../Time/AnalogClockHours'
import AnalogClockMinutes from '../../Time/AnalogClockMinutes'
import ClockNumber from '../../Time/ClockNumber'
import AnimatedClockSwitcher from '../../Time/AnimatedClockSwitcher'
import TimeInput from '../../Time/TimeInput'
import TimeInputs from '../../Time/TimeInputs'
import TimePicker from '../../Time/TimePicker'
import TimePickerModal from '../../Time/TimePickerModal'
import { circleSize } from '../../Time/timeUtils'
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
    const modes: Array<'AM' | 'PM' | undefined> = ['AM', 'PM', undefined]
    const onChange = jest.fn()
    const spy = jest.spyOn(PanResponder, 'create').mockImplementation((config) => {
      configs.push(config as Record<string, Function>)
      return create(config)
    })
    try {
      for (const mode of modes) {
        for (const focused of ['hours', 'minutes', 'seconds'] as const) {
          for (const is24Hour of [true, false]) {
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
            expect(responder.onStartShouldSetPanResponder()).toBe(true)
            expect(responder.onStartShouldSetPanResponderCapture()).toBe(false)
            expect(responder.onMoveShouldSetPanResponder()).toBe(true)
            expect(responder.onMoveShouldSetPanResponderCapture()).toBe(true)
            expect(responder.onPanResponderTerminationRequest()).toBe(true)
            expect(responder.onShouldBlockNativeResponder()).toBe(true)
            for (let x = 0; x <= circleSize; x += 64) {
              for (let y = 0; y <= circleSize; y += 64) {
                responder.onPanResponderGrant(clockEvent(x, y))
                responder.onPanResponderMove(clockEvent(x, y))
                responder.onPanResponderRelease(clockEvent(x, y))
              }
            }
          }
        }
      }
    } finally {
      spy.mockRestore()
    }
    expect(onChange).toHaveBeenCalled()
  })

  it('highlights outer and inner hours and the zero minute', async () => {
    await render(<AnalogClockHours hours={0} is24Hour />)
    await render(<AnalogClockHours hours={12} is24Hour />)
    await render(<AnalogClockHours hours={1} is24Hour={false} />)
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
    await fireEvent(unlabeled.getByText('1'), 'accessibilityAction', {
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
    landscape.container.queryAll(
      (node: { props: { accessibilityLabel?: string; onPress?: Function } }) =>
        node.props.accessibilityLabel === 'PM' && node.props.onPress
    ).forEach((node: { props: { onPress: Function } }) => node.props.onPress())
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
        (node: { props: { accessibilityLabel?: string } }) =>
          node.props.accessibilityLabel === 'AM' ||
          node.props.accessibilityLabel === 'PM'
      )
      .forEach((node: { parent: null; props: Record<string, unknown>; unstable_fiber?: null }) => {
        const onPress = findPress(node)
        if (onPress) onPress()
      })

    const afternoon = await render(
      <AmPmSwitcher hours={14} inputType="keyboard" onChange={onChange} />
    )
    afternoon.container
      .queryAll(
        (node: { props: { accessibilityLabel?: string } }) =>
          node.props.accessibilityLabel === 'AM' ||
          node.props.accessibilityLabel === 'PM'
      )
      .forEach((node: { props: Record<string, unknown>; unstable_fiber?: null }) => {
        findPress(node)?.()
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
      .queryAll((node: { props: { accessibilityRole?: string } }) => true)
      .forEach((node: { props: Record<string, unknown>; unstable_fiber?: null }) => {
        findPress(node)?.()
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
      const color = StyleSheet.flatten(record.props?.style)?.backgroundColor
      const nested = backgrounds(record.children)
      return typeof color === 'string' ? [color, ...nested] : nested
    }
    const layer = (color: string) => backgrounds(states.toJSON()).includes(color)
    const hour = states.getByLabelText('Hour')
    await fireEvent(hour, 'focus')
    await fireEvent.changeText(hour, '99')
    expect(StyleSheet.flatten(hour.props.style).color).toBe('rgb(255, 0, 0)')
    await fireEvent(hour, 'blur')
    expect(StyleSheet.flatten(hour.props.style).color).toBe('rgb(0, 255, 0)')
    await fireEvent(hour.parent, 'mouseEnter')
    expect(layer('rgba(0, 255, 0, 0.08)')).toBe(true)

    const minute = states.getByLabelText('Minute')
    await fireEvent(minute, 'hoverIn')
    await fireEvent(minute, 'focus')
    await fireEvent(minute, 'pressIn')
    expect(layer('rgba(1, 2, 3, 0.28)')).toBe(true)

    const morning = states.getByLabelText('AM')
    await fireEvent(morning, 'hoverIn')
    expect(layer('rgba(10, 11, 12, 0.08)')).toBe(true)
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
    await fireEvent.press(modal.getByLabelText('Toggle clock'))
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
    expect(defaults.getByText('Select time')).toBeTruthy()
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
    expect(keyboardHeadline.getByText('Enter time')).toBeTruthy()
    const backdrop = defaults.container.queryAll(
      (node: { props: { onPress?: Function } }) => node.props.onPress === onDismiss
    )
    await act(() => {
      backdrop.forEach((node: { props: { onPress: Function } }) =>
        node.props.onPress()
      )
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
        onConfirm={onConfirm}
        onDismiss={onDismiss}
        visible
      />
    )
    expect(compact.queryByLabelText('Toggle keyboard')).toBeNull()
    expect(compact.queryByLabelText('Toggle clock')).toBeNull()
  })
})
