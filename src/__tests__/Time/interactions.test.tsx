import { act, fireEvent, render } from '@testing-library/react-native'
import { findPress } from '../../testUtils'
import { Dimensions, PanResponder, Platform } from 'react-native'
import { DarkTheme, ThemeProvider } from 'react-native-paper'
import { DisplayModeContext } from '../../contexts/DisplayModeContext'
import AmPmSwitcher from '../../Time/AmPmSwitcher'
import AnalogClock from '../../Time/AnalogClock'
import AnalogClockHours from '../../Time/AnalogClockHours'
import AnalogClockMinutes from '../../Time/AnalogClockMinutes'
import AnimatedClockSwitcher from '../../Time/AnimatedClockSwitcher'
import TimeInput from '../../Time/TimeInput'
import TimeInputs from '../../Time/TimeInputs'
import TimePicker from '../../Time/TimePicker'
import TimePickerModal from '../../Time/TimePickerModal'
import { circleSize } from '../../Time/timeUtils'
import en from '../../translations/en'
import { registerTranslation } from '../../translations/utils'

registerTranslation('en', en)

const originalOS = Platform.OS
const savedWindow = Dimensions.get('window')

afterEach(() => {
  Platform.OS = originalOS
  Dimensions.set({ window: savedWindow, screen: savedWindow })
})

function setWindow(width: number, height: number) {
  Dimensions.set({
    window: { width, height, scale: 1, fontScale: 1 },
    screen: { width, height, scale: 1, fontScale: 1 },
  })
}

function clockEvent(x: number, y: number) {
  return { nativeEvent: { locationX: x, locationY: y } }
}

describe('analog clock', () => {
  it('tracks hours and minutes from pointer moves', async () => {
    const onChange = jest.fn()
    const configs: Array<Record<string, Function>> = []
    const create = PanResponder.create.bind(PanResponder)
    const spy = jest.spyOn(PanResponder, 'create').mockImplementation((config) => {
      configs.push(config as Record<string, Function>)
      return create(config)
    })
    const modes: Array<'AM' | 'PM' | undefined> = ['AM', 'PM', undefined]
    try {
      for (const mode of modes) {
        for (const focused of ['hours', 'minutes', 'seconds'] as const) {
          for (const is24Hour of [true, false]) {
            await render(
              <DisplayModeContext.Provider value={{ mode, setMode: () => null }}>
                <AnalogClock
                  hours={is24Hour ? 15 : 12}
                  minutes={30}
                  focused={focused as 'hours'}
                  is24Hour={is24Hour}
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
    await render(<AnalogClockHours is24Hour hours={0} />)
    await render(<AnalogClockHours is24Hour hours={12} />)
    await render(<AnalogClockHours is24Hour={false} hours={1} />)
    await render(<AnalogClockMinutes minutes={0} />)
    await render(<AnalogClockMinutes minutes={59} />)
    await render(<AnalogClockMinutes minutes={7} />)
    const minutes = await render(
      <AnimatedClockSwitcher
        focused="minutes"
        hours={<AnalogClockHours is24Hour={false} hours={1} />}
        minutes={<AnalogClockMinutes minutes={5} />}
      />
    )
    await minutes.rerender(
      <AnimatedClockSwitcher
        focused="hours"
        hours={<AnalogClockHours is24Hour hours={13} />}
        minutes={<AnalogClockMinutes minutes={5} />}
      />
    )
  })
})

describe('time inputs', () => {
  it('edits hours and minutes from the keyboard and the dial', async () => {
    const onChange = jest.fn()
    const onFocusInput = jest.fn()
    const keyboard = await render(
      <TimeInputs
        hours={9}
        minutes={5}
        focused="hours"
        inputType="keyboard"
        is24Hour={false}
        locale="en"
        onChange={onChange}
        onFocusInput={onFocusInput}
      />
    )
    keyboard.container
      .queryAll(
        (node: { props: { onChangeText?: Function } }) =>
          typeof node.props.onChangeText === 'function'
      )
      .forEach((node: { props: Record<string, Function | undefined> }) => {
      node.props.onChangeText('3')
      node.props.onChangeText('30')
      node.props.onChangeText('99')
      node.props.onChangeText('-')
      node.props.onFocus()
      node.props.onBlur()
      node.props.onSubmitEditing?.()
    })

    Platform.OS = 'android'
    await render(
      <ThemeProvider
        theme={{
          ...DarkTheme,
          roundness: 4,
          colors: { ...DarkTheme.colors, primary: '#000000' },
        }}
      >
        <TimeInputs
          hours={18}
          minutes={45}
          focused="minutes"
          inputType="picker"
          is24Hour
          onChange={onChange}
          onFocusInput={onFocusInput}
          inputFontSize={40}
        />
      </ThemeProvider>
    )

    setWindow(900, 400)
    const landscape = await render(
      <TimeInputs
        hours={1}
        minutes={0}
        focused="hours"
        inputType="picker"
        is24Hour={false}
        onChange={onChange}
        onFocusInput={onFocusInput}
      />
    )
    landscape.container.queryAll(
      (node: { props: { onPress?: Function; accessibilityLabel?: string } }) =>
        node.props.accessibilityLabel === 'PM' && node.props.onPress
    ).forEach((node: { props: { onPress: Function } }) => node.props.onPress())
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
      .forEach((node: { props: Record<string, unknown>; parent: null; unstable_fiber?: null }) => {
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
      .forEach((node: { unstable_fiber?: null; props: Record<string, unknown> }) => {
        findPress(node)?.()
      })

    await render(
      <AmPmSwitcher
        hours={2}
        inputType="picker"
        direction="horizontal"
        onChange={onChange}
      />
    )

    const input = await render(
      <TimeInput
        value={4}
        clockType="hours"
        pressed={false}
        inputType="picker"
        onChanged={jest.fn()}
        onPress={jest.fn()}
      />
    )
    input.container
      .queryAll((node: { props: { accessibilityRole?: string } }) => true)
      .forEach((node: { unstable_fiber?: null; props: Record<string, unknown> }) => {
        findPress(node)?.()
      })

    Platform.OS = 'android'
    const typed = await render(
      <TimeInput
        value={12}
        clockType="minutes"
        pressed
        inputType="keyboard"
        inputFontSize={20}
        onChanged={jest.fn()}
      />
    )
    await typed.rerender(
      <TimeInput
        value={8}
        clockType="minutes"
        pressed
        inputType="keyboard"
        onChanged={jest.fn()}
      />
    )
    expect(onChange).toHaveBeenCalled()
  })
})

describe('time picker modal', () => {
  it('confirms, cancels, and toggles the keyboard', async () => {
    const onDismiss = jest.fn()
    const onConfirm = jest.fn()
    const modal = await render(
      <TimePickerModal
        visible
        hours={15}
        minutes={45}
        locale="en"
        uppercase
        label=""
        onDismiss={onDismiss}
        onConfirm={onConfirm}
        defaultInputType="keyboard"
        use24HourClock={false}
        inputFontSize={48}
      />
    )
    await fireEvent.press(modal.getByLabelText('toggle keyboard'))
    await fireEvent.press(modal.getByText('OK'))
    await fireEvent.press(modal.getByText('CANCEL'))
    expect(onConfirm).toHaveBeenCalled()
    expect(onDismiss).toHaveBeenCalled()

    const defaults = await render(
      <TimePickerModal
        visible
        hours={undefined}
        minutes={null as unknown as number}
        onDismiss={onDismiss}
        onConfirm={onConfirm}
      />
    )
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
        locale="en-US"
        inputType="picker"
        focused="minutes"
        hours={0}
        minutes={0}
        use24HourClock={undefined}
        onChange={jest.fn()}
        onFocusInput={jest.fn()}
      />
    )
    await render(
      <TimePicker
        locale="en-GB"
        inputType="keyboard"
        focused="hours"
        hours={23}
        minutes={59}
        use24HourClock
        onChange={jest.fn()}
        onFocusInput={jest.fn()}
      />
    )
  })
})
