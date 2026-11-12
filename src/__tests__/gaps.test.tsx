import React from 'react'
import { Dimensions, Platform, Pressable } from 'react-native'
import { DarkTheme, ThemeProvider } from 'react-native-paper'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import Calendar from '../Date/Calendar'
import CalendarEdit from '../Date/CalendarEdit'
import DatePickerInputWithoutModal from '../Date/DatePickerInputWithoutModal'
import DatePickerModal from '../Date/DatePickerModal'
import DatePickerModalContent from '../Date/DatePickerModalContent'
import DatePickerModalContentHeader, {
  HeaderContentMulti,
  HeaderContentRange,
} from '../Date/DatePickerModalContentHeader'
import Month from '../Date/Month'
import YearPicker from '../Date/YearPicker'
import { getInitialIndex, getStartAtIndex } from '../Date/dateUtils'
import Swiper from '../Date/Swiper'
import TimeInput from '../Time/TimeInput'
import TimeInputs from '../Time/TimeInputs'
import TimePicker from '../Time/TimePicker'
import TimePickerModal from '../Time/TimePickerModal'
import { findPress, pressTestId, render, walkFibers } from '../testUtils'
import en from '../translations/en'
import { registerTranslation } from '../translations/utils'

registerTranslation('en', en)

const originalOS = Platform.OS
const savedWindow = Dimensions.get('window')
const metrics = {
  frame: { x: 0, y: 0, width: 360, height: 800 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
}

afterEach(() => {
  Platform.OS = originalOS
  Dimensions.set({ window: savedWindow, screen: savedWindow })
  jest.restoreAllMocks()
})

function setWindow(width: number, height: number) {
  Dimensions.set({
    window: { width, height, scale: 1, fontScale: 1 },
    screen: { width, height, scale: 1, fontScale: 1 },
  })
}

function safe(children: React.ReactNode) {
  return (
    <SafeAreaProvider initialMetrics={metrics}>{children}</SafeAreaProvider>
  )
}

function callProps(
  screen: { container: { queryAll: Function } },
  match: (props: Record<string, unknown>) => boolean,
  invoke: (props: Record<string, unknown>) => void
) {
  const seed = screen.container.queryAll(() => true)[0] as {
    unstable_fiber?: Parameters<typeof walkFibers>[0]
  }
  let root = seed?.unstable_fiber
  while (root?.return) root = root.return
  walkFibers(root, (fiber) => {
    const props = (fiber.memoizedProps ?? {}) as Record<string, unknown>
    if (match(props)) invoke(props)
  })
}

describe('remaining date branches', () => {
  it('covers input chrome, modal sheets, and header copy', async () => {
    const onChange = jest.fn()
    await render(
      <ThemeProvider theme={{ ...DarkTheme, roundness: 4 }}>
        <DatePickerInputWithoutModal
          hasError
          hideValidationErrors
          inputMode="start"
          locale="en"
          onChange={onChange}
          value={new Date(2026, 10, 11)}
        />
      </ThemeProvider>
    )
    const invalid = await render(
      <DatePickerInputWithoutModal
        inputMode="start"
        keyboardAppearance="light"
        keyboardType="default"
        label="When"
        locale="en"
        onChange={onChange}
        validRange={{ startDate: new Date(2020, 0, 1), endDate: new Date(2020, 0, 2) }}
        value={undefined}
        withDateFormatInLabel={false}
      />
    )
    const field = invalid.container.queryAll(
      (node: { props: { onChangeText?: Function } }) =>
        typeof node.props.onChangeText === 'function'
    )[0]
    const { act } = require('@testing-library/react-native') as typeof import('@testing-library/react-native')
    await act(() => {
      field.props.onChangeText('06/12/2022')
    })

    setWindow(400, 400)
    Platform.OS = 'ios'
    await render(
      safe(
        <DatePickerModal
          date={new Date(2026, 10, 11)}
          locale="en"
          mode="single"
          onConfirm={jest.fn()}
          onDismiss={jest.fn()}
          presentationStyle="pageSheet"
          visible
        />
      )
    )
    setWindow(800, 800)
    await render(
      safe(
        <DatePickerModal
          date={new Date(2026, 10, 11)}
          locale="en"
          mode="single"
          onConfirm={jest.fn()}
          onDismiss={jest.fn()}
          presentationStyle="pageSheet"
          visible
        />
      )
    )
    Platform.OS = 'web'
    const content = await render(
      safe(
        <DatePickerModalContent
          dates={undefined}
          locale="en"
          mode="multiple"
          onConfirm={jest.fn()}
          onDismiss={jest.fn()}
        />
      )
    )
    await pressTestId(content, 'react-native-paper-dates-save')

    const color = '#6750A4'
    await render(
      <HeaderContentMulti
        collapsed={false}
        color={color}
        emptyLabel="None"
        locale="en"
        mode="multiple"
        moreLabel="more"
        onToggle={() => null}
        state={{ dates: [new Date(2026, 10, 1), new Date(2026, 10, 2)] }}
      />
    )
    await render(
      <>
        <HeaderContentRange
          collapsed={false}
          color={color}
          locale="en"
          mode="range"
          onToggle={() => null}
          state={{ startDate: new Date(2026, 10, 1), endDate: undefined }}
        />
        <HeaderContentRange
          collapsed={false}
          color={color}
          locale="en"
          mode="range"
          onToggle={() => null}
          state={{ startDate: undefined, endDate: new Date(2026, 10, 2) }}
        />
      </>
    )
    await render(
      <DatePickerModalContentHeader
        collapsed={false}
        locale={undefined}
        mode={'other' as 'single'}
        onToggle={() => null}
        state={{}}
      />
    )
  })

  it('covers month geometry and the year list on web', async () => {
    const index = getInitialIndex(new Date(2026, 10, 15))
    const shared = {
      index,
      locale: 'en',
      onPressDate: jest.fn(),
      onPressYear: jest.fn(),
      primaryColor: '#6200ee',
      roundness: 4,
      selectColor: '#eee',
      selectingYear: false,
      startWeekOnMonday: false,
    }
    await render(
      <Month
        {...shared}
        endDate={new Date(2026, 10, 1)}
        mode="range"
        scrollMode="horizontal"
        startDate={new Date(2026, 9, 20)}
      />
    )
    await render(
      <Month
        {...shared}
        endDate={new Date(2026, 11, 5)}
        mode="range"
        scrollMode="horizontal"
        startDate={new Date(2026, 10, 30)}
      />
    )
    await render(
      <Month
        {...shared}
        dates={[new Date(2026, 10, 1), new Date(2026, 10, 10), new Date(2026, 10, 11), new Date(2026, 10, 30)]}
        mode="multiple"
        scrollMode="horizontal"
      />
    )

    await render(
      <Month
        {...shared}
        date={new Date(2026, 10, 15)}
        mode={'none' as 'single'}
        scrollMode="horizontal"
      />
    )

    Platform.OS = 'web'
    await render(
      <>
        <Month {...shared} date={new Date(2026, 10, 11)} mode="single" scrollMode="horizontal" />
        <YearPicker
          endYear={2028}
          onPressYear={jest.fn()}
          selectedYear={2026}
          selectingYear
          startYear={2024}
        />
      </>
    )
    await render(
      <ThemeProvider theme={{ ...DarkTheme, roundness: 4 }}>
        <Month {...shared} date={new Date(2026, 10, 11)} mode="single" scrollMode="horizontal" />
        <YearPicker
          endYear={2028}
          onPressYear={jest.fn()}
          selectedYear={2026}
          selectingYear
          startYear={2024}
        />
      </ThemeProvider>
    )
  })

  it('focuses calendar fields and forwards their edits', async () => {
    const realUseRef = React.useRef
    let seen = 0
    jest.spyOn(React, 'useRef').mockImplementation((initial: unknown) => {
      seen += 1
      if (seen <= 3 && initial === null) {
        return { current: { focus: jest.fn(), blur: jest.fn() } }
      }
      return realUseRef(initial as never)
    })
    const onChange = jest.fn()
    const editing = await render(
      <CalendarEdit
        collapsed={false}
        locale="en"
        mode="range"
        onChange={onChange}
        state={{
          date: undefined,
          startDate: new Date(2026, 10, 1),
          endDate: new Date(2026, 10, 2),
          dates: undefined,
        }}
        validRange={undefined}
      />
    )
    callProps(
      editing,
      (props) =>
        (props.inputMode === 'start' || props.inputMode === 'end') &&
        typeof props.onChange === 'function',
      (props) => {
        ;(props.onChange as (value: Date) => void)(new Date(2026, 10, 3))
        ;(props.onSubmitEditing as (() => void) | undefined)?.()
      }
    )
    expect(onChange).toHaveBeenCalled()
  })
})

describe('branch edges', () => {
  it('covers fallthrough modes, empty refs, and clamped indexes', async () => {
    const unknown = await render(
      <Calendar
        initialLayout={{ width: 320, height: 480 }}
        locale="en"
        mode={'none' as 'single'}
        onChange={jest.fn()}
      />
    )
    const day = unknown.container.queryAll(
      (node: { props: { testID?: string } }) =>
        typeof node.props.testID === 'string' &&
        node.props.testID.startsWith('react-native-paper-dates-day-')
    )[0]
    if (day) {
      const press = findPress(day)
      if (press) press()
    }

    const refs: { current: unknown }[] = []
    const useRefSpy = jest.spyOn(React, 'useRef').mockImplementation((initial) => {
      const ref = { current: initial ?? null }
      refs.push(ref)
      return ref as never
    })
    const editing = await render(
      <CalendarEdit
        collapsed={false}
        locale="en"
        mode="range"
        onChange={jest.fn()}
        state={{
          date: undefined,
          startDate: undefined,
          endDate: undefined,
          dates: undefined,
        }}
        validRange={undefined}
      />
    )
    refs.forEach((ref) => {
      ref.current = null
    })
    let submits = 0
    callProps(
      editing,
      (props) => typeof props.onSubmitEditing === 'function',
      (props) => {
        submits += 1
        ;(props.onSubmitEditing as () => void)()
      }
    )
    if (submits === 0) {
      throw new Error('calendar edit submit was not found')
    }
    useRefSpy.mockRestore()

    const content = await render(
      safe(
        <DatePickerModalContent
          locale="en"
          mode={'none' as 'single'}
          onCalendarLayout={jest.fn()}
          onConfirm={jest.fn()}
          onDismiss={jest.fn()}
        />
      )
    )
    await pressTestId(content, 'react-native-paper-dates-save')
    const layout = content.container.queryAll(
      (node: { props: { onLayout?: Function } }) => typeof node.props.onLayout === 'function'
    )[0]
    layout.props.onLayout({ nativeEvent: { layout: { width: 0, height: 0 } } })

    const hours = await render(
      <TimeInput
        clockType="hours"
        inputType="keyboard"
        onChanged={jest.fn()}
        pressed={false}
        value={1}
      />
    )
    const typed = hours.container.queryAll(
      (node: { props: { onChangeText?: Function } }) =>
        typeof node.props.onChangeText === 'function'
    )[0]
    typed.props.onChangeText('-1')
    const focus = hours.container.queryAll(
      (node: { props: { onFocus?: Function } }) => typeof node.props.onFocus === 'function'
    )[0]
    focus.props.onFocus()

    const timeRefs: { current: unknown }[] = []
    const timeRefSpy = jest
      .spyOn(React, 'useRef')
      .mockImplementation((initial) => {
        const ref = { current: initial ?? null }
        timeRefs.push(ref)
        return ref as never
      })
    const inputs = await render(
      <TimeInputs
        focused="hours"
        hours={9}
        inputType="keyboard"
        is24Hour={false}
        locale="en"
        minutes={5}
        onChange={jest.fn()}
        onFocusInput={jest.fn()}
      />
    )
    timeRefs.forEach((ref) => {
      ref.current = null
    })
    callProps(
      inputs,
      (props) => typeof props.onSubmitEditing === 'function',
      (props) => {
        ;(props.onSubmitEditing as () => void)()
      }
    )
    timeRefSpy.mockRestore()

    const index = getStartAtIndex(2024, 2028)
    const swiper = await render(
      <Swiper
        endYear={2028}
        initialIndex={index}
        initialLayout={{ width: 300, height: 200 }}
        renderItem={() => null}
        scrollMode="horizontal"
        selectedYear={undefined}
        startWeekOnMonday={false}
        startYear={2024}
      />
    )
    const scroll = swiper.container.queryAll(
      (node: { props: { onMomentumScrollEnd?: Function } }) =>
        typeof node.props.onMomentumScrollEnd === 'function'
    )[0]
    scroll.props.onMomentumScrollEnd({
      nativeEvent: {
        contentOffset: { x: index * 300, y: 0 },
        layoutMeasurement: { width: 300, height: 200 },
      },
    })

    const edge = await render(
      <Swiper
        endYear={2027}
        initialIndex={100}
        initialLayout={{ width: 300, height: 200 }}
        renderItem={({ onNext, onPrev }) => (
          <>
            <Pressable onPress={onPrev} testID="gap-prev" />
            <Pressable onPress={onNext} testID="gap-next" />
          </>
        )}
        scrollMode="horizontal"
        selectedYear={undefined}
        startWeekOnMonday={false}
        startYear={2027}
      />
    )
    await pressTestId(edge, 'gap-prev')
    await pressTestId(edge, 'gap-next')

    await render(
      <Swiper
        endYear={2028}
        initialIndex={10}
        initialLayout={{ width: 300, height: 200 }}
        renderItem={() => null}
        scrollMode="horizontal"
        selectedYear={2020}
        startWeekOnMonday={false}
        startYear={2026}
      />
    )
  })
})

describe('remaining time branches', () => {
  it('forwards clock edits in both orientations', async () => {
    const onChange = jest.fn()
    const onFocusInput = jest.fn()
    setWindow(900, 400)
    const landscape = await render(
      <TimePicker
        focused="hours"
        hours={15}
        inputType="picker"
        locale="en"
        minutes={30}
        onChange={onChange}
        onFocusInput={onFocusInput}
        use24HourClock={false}
      />
    )
    callProps(
      landscape,
      (props) =>
        typeof props.onChange === 'function' &&
        typeof props.is24Hour === 'boolean' &&
        props.inputType === undefined,
      (props) => {
        ;(props.onChange as (value: { hours: number; minutes: number }) => void)({
          hours: 4,
          minutes: 10,
        })
      }
    )
    expect(onChange).toHaveBeenCalled()

    setWindow(400, 800)
    await render(
      <TimePicker
        focused="minutes"
        hours={3}
        inputType="keyboard"
        locale="en"
        minutes={5}
        onChange={onChange}
        onFocusInput={onFocusInput}
        use24HourClock
      />
    )

    const modal = await render(
      <TimePickerModal
        hours={9}
        inputType="keyboard"
        locale="en"
        minutes={15}
        onConfirm={jest.fn()}
        onDismiss={jest.fn()}
        visible
      />
    )
    callProps(
      modal,
      (props) => props.focused === 'hours' && typeof props.onFocusInput === 'function',
      (props) => {
        ;(props.onFocusInput as (type: 'minutes') => void)('minutes')
        const change = props.onChange as (value: {
          hours: number
          minutes: number
          focused?: 'minutes'
        }) => void
        change({ hours: 10, minutes: 20, focused: 'minutes' })
        change({ hours: 11, minutes: 21 })
      }
    )
    callProps(
      landscape,
      (props) => typeof props.direction === 'string' && typeof props.onChange === 'function',
      (props) => {
        ;(props.onChange as (hours: number) => void)(1)
      }
    )
  })
})
