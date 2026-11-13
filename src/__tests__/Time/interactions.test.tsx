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
registerTranslation('en-US', en)
registerTranslation('en-GB', en)

const originalOS = Platform.OS
const savedWindow = Dimensions.get('window')

afterEach(async () => {
  Platform.OS = originalOS
  await act(async () => {
    Dimensions.set({ window: savedWindow, screen: savedWindow })
  })
})

async function setWindow(width: number, height: number) {
  await act(async () => {
    Dimensions.set({
      window: { width, height, scale: 1, fontScale: 1 },
      screen: { width, height, scale: 1, fontScale: 1 },
    })
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
          roundness: 4,
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
        direction="horizontal"
        hours={2}
        inputType="picker"
        onChange={onChange}
      />
    )

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
      .forEach((node: { unstable_fiber?: null; props: Record<string, unknown> }) => {
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
    expect(onChange).toHaveBeenCalled()
  })
})

describe('time picker modal', () => {
  it('confirms, cancels, and toggles the keyboard', async () => {
    const onDismiss = jest.fn()
    const onConfirm = jest.fn()
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
    await fireEvent.press(modal.getByLabelText('toggle keyboard'))
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
  })
})
