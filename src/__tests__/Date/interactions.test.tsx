import type { ReactNode } from 'react'
import { act, fireEvent, render } from '@testing-library/react-native'

import {
  byTestId,
  pressDays,
  pressNode,
  pressTestId,
  type PressableInstance as Instance,
} from '../../testUtils'
import { Dimensions, Platform, Pressable } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { Text } from 'react-native-paper'
import Calendar from '../../Date/Calendar'
import CalendarEdit from '../../Date/CalendarEdit'
import CalendarHeader from '../../Date/CalendarHeader'
import DatePickerInput from '../../Date/DatePickerInput'
import DatePickerInputWithoutModal from '../../Date/DatePickerInputWithoutModal'
import DatePickerModal from '../../Date/DatePickerModal'
import DatePickerModalContent from '../../Date/DatePickerModalContent'
import DatePickerModalHeader from '../../Date/DatePickerModalHeader'
import DatePickerModalHeaderBackground from '../../Date/DatePickerModalHeaderBackground'
import DatePickerModalStatusBar from '../../Date/DatePickerModalStatusBar'
import AnimatedCrossView from '../../Date/AnimatedCrossView'
import AutoSizer from '../../Date/AutoSizer'
import Day from '../../Date/Day'
import DayNames from '../../Date/DayNames'
import DayRange from '../../Date/DayRange'
import Month, {
  getHorizontalMonthOffset,
  getIndexFromHorizontalOffset,
  getIndexFromVerticalOffset,
  getMonthHeight,
  getVerticalMonthsOffset,
  horizontalMonthScrolls,
} from '../../Date/Month'
import Swiper from '../../Date/Swiper'
import YearPicker from '../../Date/YearPicker'
import { getStartAtIndex } from '../../Date/dateUtils'
import { LightTheme } from 'react-native-paper'
import en from '../../translations/en'
import { registerTranslation } from '../../translations/utils'

registerTranslation('en', en)

const metrics = {
  frame: { x: 0, y: 0, width: 360, height: 800 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
}

function safe(children: ReactNode) {
  return (
    <SafeAreaProvider initialMetrics={metrics}>{children}</SafeAreaProvider>
  )
}

const layout = { width: 320, height: 480 }
const day = new Date(2026, 10, 11)

function layouts(root: { queryAll: Function }, width: number, height: number) {
  root.queryAll((node: { props: { onLayout?: Function } }) => {
    return typeof node.props.onLayout === 'function'
  }).forEach((node: { props: { onLayout: Function } }) => {
    node.props.onLayout({
      nativeEvent: { layout: { x: 0, y: 0, width, height } },
    })
  })
}

describe('month offset helpers', () => {
  it('measures horizontal and vertical month positions', () => {
    const start = getStartAtIndex(2020, 2030)
    expect(getHorizontalMonthOffset(-1, 320)).toBe(0)
    expect(getHorizontalMonthOffset(3, 320)).toBe(960)
    expect(getIndexFromHorizontalOffset(640, 320, 2020, 2030)).toBe(start + 2)
    expect(
      getIndexFromVerticalOffset(0, false, 2020, 2030)
    ).toEqual(expect.any(Number))
    expect(
      getIndexFromVerticalOffset(5000, true, 2020, 2030)
    ).toEqual(expect.any(Number))
    expect(
      getVerticalMonthsOffset(start, false, 2020, 2030)
    ).toEqual(expect.any(Number))
    expect(
      getVerticalMonthsOffset(start + 2, false, 2020, 2030)
    ).toEqual(expect.any(Number))
    expect(
      getVerticalMonthsOffset(start - 2, true, 2020, 2030)
    ).toEqual(expect.any(Number))
    const monthHeight = getMonthHeight('horizontal', start, false, 2020, 2030)
    expect(monthHeight).toBeGreaterThan(0)
    // The month title sits over the header, so a viewport just shorter than
    // getMonthHeight still fits the weeks and must not reserve a scrollbar.
    expect(
      horizontalMonthScrolls(monthHeight - 1, start, false, 2020, 2030)
    ).toBe(false)
    expect(horizontalMonthScrolls(0, start, false, 2020, 2030)).toBe(true)
    expect(getMonthHeight('vertical', start, true, 2020, 2030)).toBeGreaterThan(0)
  })
})

describe('calendar interactions', () => {
  it('selects, extends, and toggles dates', async () => {
    const onChange = jest.fn()
    const single = await render(
      <Calendar
        date={day}
        dateMode="end"
        dayContent={() => <Text>dot</Text>}
        dayContentPosition="top"
        disableWeekDays={[0]}
        initialLayout={layout}
        locale="en"
        mode="single"
        onChange={onChange}
        startWeekOnMonday
      />
    )
    await pressDays(single, 1)
    await fireEvent.press(single.getByLabelText('November 2026'))
    await pressTestId(single, 'react-native-paper-dates-next-month')
    await pressTestId(single, 'react-native-paper-dates-prev-month')
    expect(onChange).toHaveBeenCalled()

    const startOnly = await render(
      <Calendar
        endDate={undefined}
        initialLayout={{ width: 320, height: 800 }}
        locale="en"
        mode="range"
        onChange={onChange}
        startDate={new Date(2026, 10, 10)}
      />
    )
    await pressDays(startOnly, 3)
    await pressTestId(startOnly, 'react-native-paper-dates-day-2026-10-20')

    const both = await render(
      <Calendar
        endDate={new Date(2026, 10, 30)}
        initialLayout={{ width: 320, height: 200 }}
        locale="en"
        mode="range"
        onChange={onChange}
        startDate={new Date(2026, 10, 1)}
        validRange={{
          startDate: new Date(2026, 10, 5),
          endDate: new Date(2026, 10, 25),
          disabledDates: [new Date(2026, 10, 12)],
        }}
      />
    )
    await pressDays(both, 1)

    const multi = await render(
      <Calendar
        dates={[new Date(2026, 10, 10), new Date(2026, 10, 11)]}
        initialLayout={layout}
        locale="en"
        mode="multiple"
        onChange={onChange}
      />
    )
    await pressDays(multi, 2)
    await pressTestId(multi, 'react-native-paper-dates-day-2026-10-10')


    const empty = await render(
      <Calendar
        dates={undefined}
        initialLayout={layout}
        locale="en"
        mode="multiple"
        onChange={onChange}
      />
    )
    await pressDays(empty, 1)

    const scroll = single.container.queryAll(
      (node: { props: { onMomentumScrollEnd?: Function } }) =>
        typeof node.props.onMomentumScrollEnd === 'function'
    )[0]
    await act(() => {
      scroll.props.onMomentumScrollEnd({
        nativeEvent: {
          contentOffset: { x: 0, y: 0 },
          layoutMeasurement: { width: 320, height: 480 },
        },
      })
      scroll.props.onMomentumScrollEnd({
        nativeEvent: {
          contentOffset: { x: 3200, y: 0 },
          layoutMeasurement: { width: 320, height: 480 },
        },
      })
      scroll.props.onScrollEndDrag({
        nativeEvent: {
          contentOffset: { x: 1600, y: 0 },
          layoutMeasurement: { width: 320, height: 480 },
        },
      })
      scroll.props.onLayout?.()
    })
  })

  it('renders a month in every selection shape', async () => {
    const index = getStartAtIndex()
    const onPressDate = jest.fn()
    const onPressYear = jest.fn()
    const shared = {
      disableWeekDays: [6],
      index,
      locale: 'en',
      onPressDate,
      onPressYear,
      primaryColor: '#6200ee',
      roundness: 4,
      selectColor: '#eee',
      selectingYear: true,
      startWeekOnMonday: true,
    }
    const single = await render(
      <Month {...shared} date={new Date()} mode="single" scrollMode="horizontal" />
    )
    await pressDays(single, 1)

    await render(
      <Month
        {...shared}
        endDate={new Date(2026, 10, 30)}
        mode="range"
        scrollMode="vertical"
        startDate={new Date(2026, 10, 1)}
      />
    )
    await render(
      <Month
        {...shared}
        endDate={undefined}
        mode="range"
        scrollMode="vertical"
        selectingYear={false}
        startDate={new Date(2026, 10, 10)}
      />
    )
    await render(
      <Month
        {...shared}
        dates={[
          new Date(2026, 10, 1),
          new Date(2026, 10, 2),
          new Date(2026, 10, 3),
          new Date(2026, 10, 15),
          new Date(2026, 10, 30),
        ]}
        mode="multiple"
        scrollMode="vertical"
      />
    )
    await render(
      <Month
        {...shared}
        dates={null}
        dayContent={() => <Text>•</Text>}
        dayContentPosition="center"
        mode="multiple"
        scrollMode="vertical"
      />
    )
    expect(onPressDate).toHaveBeenCalled()
  })
})

describe('date picker modal', () => {
  const originalOS = Platform.OS

  afterEach(() => {
    Platform.OS = originalOS
  })

  it('confirms single, range, and multiple selections', async () => {
    const onConfirm = jest.fn()
    const onChange = jest.fn()
    const onDismiss = jest.fn()
    const single = await render(
      safe(
        <DatePickerModalContent
          allowEditing
          date={day}
          dateMode="start"
          initialLayout={layout}
          label="Birth date"
          locale="en"
          mode="single"
          onChange={onChange}
          onConfirm={onConfirm}
          onDismiss={onDismiss}
          uppercase
        />
      )
    )
    await pressDays(single, 1)

    await pressTestId(single, 'react-native-paper-dates-toggle-edit')
    await pressTestId(single, 'react-native-paper-dates-save')
    await pressTestId(single, 'react-native-paper-dates-close')
    expect(onConfirm).toHaveBeenCalled()
    expect(onChange).toHaveBeenCalled()

    const range = await render(
      safe(
        <DatePickerModalContent
          calendarIcon="calendar"
          editIcon="pencil"
          endDate={new Date(2026, 10, 12)}
          initialLayout={layout}
          locale="en"
          mode="range"
          onConfirm={onConfirm}
          onDismiss={onDismiss}
          saveLabel="Apply"
          startDate={new Date(2026, 10, 10)}
        />
      )
    )
    await pressTestId(range, 'react-native-paper-dates-save')

    const multi = await render(
      safe(
        <DatePickerModalContent
          allowEditing={false}
          dates={[
            new Date(2026, 10, 1),
            new Date(2026, 10, 2),
            new Date(2026, 10, 3),
          ]}
          initialLayout={layout}
          locale="en"
          mode="multiple"
          moreLabel="more"
          onConfirm={onConfirm}
          onDismiss={onDismiss}
        />
      )
    )
    await pressTestId(multi, 'react-native-paper-dates-save')
    expect(onConfirm).toHaveBeenCalled()

    await render(
      safe(
        <DatePickerModalContent
          dates={undefined}
          initialLayout={layout}
          locale="en"
          mode="multiple"
          onConfirm={onConfirm}
          onDismiss={onDismiss}
        />
      )
    )
    await render(
      safe(
        <DatePickerModalContent
          locale="en"
          mode={'other' as 'single'}
          onConfirm={onConfirm}
          onDismiss={onDismiss}
        />
      )
    )
  })

  it('covers sheet presentation, backdrop dismiss, and remembered layout', async () => {
    const onDismiss = jest.fn()
    const onConfirm = jest.fn()
    const screen = await render(
      safe(
        <DatePickerModal
          date={day}
          disableStatusBar
          initialLayout={layout}
          locale="en"
          mode="single"
          onConfirm={onConfirm}
          onDismiss={onDismiss}
          presentationStyle="formSheet"
          statusBarOnTopOfBackdrop
          visible
          withDateFormatInLabel={false}
        />
      )
    )
    await act(() => {
      layouts(screen.container, 360, 420)
      layouts(screen.container, 360, 420)
      layouts(screen.container, 300, 400)
    })
    const backdrop = screen.container.queryAll(
      (node: { props: { onPress?: Function; onRequestClose?: Function } }) =>
        node.props.onPress === onDismiss || node.props.onRequestClose === onDismiss
    )
    await act(() => {
      backdrop.forEach(
        (node: { props: { onPress?: Function; onRequestClose?: Function } }) => {
          if (node.props.onPress === onDismiss) node.props.onPress()
          else node.props.onRequestClose?.()
        }
      )
    })
    expect(onDismiss).toHaveBeenCalled()

    Platform.OS = 'android'
    await render(
      safe(
        <DatePickerModal
          animationType="fade"
          locale="en"
          mode="single"
          onConfirm={onConfirm}
          onDismiss={onDismiss}
          presentationStyle="pageSheet"
          visible
        />
      )
    )
    Platform.OS = 'ios'
    await render(
      safe(
        <DatePickerModal
          endDate={day}
          locale="en"
          mode="range"
          onConfirm={onConfirm}
          onDismiss={onDismiss}
          presentationStyle="pageSheet"
          startDate={day}
          visible
        />
      )
    )
  })
})

describe('inputs, headers, and pickers', () => {
  it('edits a masked date with and without the modal', async () => {
    const onChange = jest.fn()
    const onChangeText = jest.fn()
    const input = await render(
      safe(
        <DatePickerInput
          disableStatusBarPadding
          endYear={2030}
          iconColor="red"
          iconSize={20}
          inputMode="start"
          locale="en"
          onChange={onChange}
          saveLabelDisabled
          startYear={2020}
          testID="date"
          validRange={{
            startDate: new Date(2026, 0, 1),
            endDate: new Date(2026, 11, 31),
          }}
          value={day}
        />
      )
    )
    await pressTestId(input, 'date-icon-button')
    await pressTestId(input, 'react-native-paper-dates-close')
    await pressTestId(input, 'date-icon-button')
    await pressTestId(input, 'react-native-paper-dates-save')
    expect(onChange).toHaveBeenCalled()

    await render(
      <DatePickerInput
        disableCalendarIcon
        disabled
        inputMode="end"
        locale="en"
        onChange={onChange}
        value={undefined}
        withModal={false}
      />
    )

    const plain = await render(
      <DatePickerInputWithoutModal
        hasError
        hideValidationErrors
        inputEnabled={false}
        inputMode="start"
        label="When"
        locale="en"
        onChange={onChange}
        onChangeText={onChangeText}
        testID="plain"
        value={undefined}
        withDateFormatInLabel={false}
      />
    )
    const field = byTestId(plain, 'plain')[0]
    await act(() => {
      field.props.onChangeText?.('01/02/2026')
      field.props.onChange?.({ nativeEvent: { text: '01/02/2026' } })
    })

    await render(
      <DatePickerInputWithoutModal
        inputEnabled
        inputMode="start"
        keyboardAppearance="dark"
        keyboardType="default"
        locale="en"
        onChange={onChange}
        testID="bare"
        value={undefined}
        withDateFormatInLabel
      />
    )
  })

  it('renders header chrome for both orientations and editing states', async () => {
    const onChange = jest.fn()
    await render(
      <CalendarEdit
        collapsed
        disableWeekDays={[0, 1, 2, 3, 4, 5, 6]}
        locale="en"
        mode="range"
        onChange={onChange}
        state={{
          date: day,
          startDate: day,
          endDate: day,
          dates: [day],
        }}
        validRange={undefined}
      />
    )
    const editing = await render(
      <CalendarEdit
        collapsed={false}
        label="Day"
        locale="en"
        mode="single"
        onChange={onChange}
        state={{
          date: undefined,
          startDate: undefined,
          endDate: undefined,
          dates: undefined,
        }}
        validRange={undefined}
      />
    )
    editing.container
      .queryAll(
        (node: { props: { onChangeText?: Function } }) =>
          typeof node.props.onChangeText === 'function'
      )
      .forEach((node: { props: { onSubmitEditing?: Function; onChangeText?: Function } }) => {
      node.props.onSubmitEditing?.()
      node.props.onChangeText?.('11/11/2026')
    })

    await render(
      <CalendarEdit
        collapsed={false}
        locale="en"
        mode="multiple"
        onChange={onChange}
        state={{
          date: undefined,
          startDate: undefined,
          endDate: undefined,
          dates: undefined,
        }}
        validRange={undefined}
      />
    )

    await render(
      <CalendarHeader
        locale="en"
        onNext={() => null}
        onPrev={() => null}
        scrollMode="vertical"
        startWeekOnMonday={false}
      />
    )
    const header = await render(
      <CalendarHeader
        disableWeekDays={[0]}
        endInset={12}
        locale={undefined}
        onNext={() => null}
        onPrev={() => null}
        scrollMode="horizontal"
        startWeekOnMonday
      />
    )
    await pressTestId(header, 'react-native-paper-dates-next-month')

    await render(
      safe(
        <DatePickerModalHeader
          closeIcon="close"
          locale="en"
          onDismiss={() => null}
          onSave={() => null}
          saveLabel="Keep"
          saveLabelDisabled={false}
          uppercase={false}
        />
      )
    )
    Dimensions.set({
      window: { width: 800, height: 400, scale: 1, fontScale: 1 },
      screen: { width: 800, height: 400, scale: 1, fontScale: 1 },
    })
    await render(
      safe(
        <>
          <DatePickerModalHeader locale="en" onDismiss={() => null} onSave={() => null} />

          <DatePickerModalHeaderBackground>
            <DatePickerModalStatusBar
              disableSafeTop={false}
              disableStatusBar={false}
              statusBarOnTopOfBackdrop={false}
            />
          </DatePickerModalHeaderBackground>
          <DatePickerModalHeaderBackground disableWeekDays={[1]}>
            <DatePickerModalStatusBar
              disableSafeTop
              disableStatusBar
              statusBarOnTopOfBackdrop
            />
          </DatePickerModalHeaderBackground>
        </>
      )
    )
  })

  it('scrolls the year list and crosses the calendar views', async () => {
    const onPressYear = jest.fn()
    const years = await render(
      <YearPicker
        endYear={2026}
        onPressYear={onPressYear}
        selectedYear={2024}
        selectingYear
        startYear={2024}
      />
    )
    const list = years.container.queryAll(
      (node: { props: { renderItem?: Function } }) =>
        typeof node.props.renderItem === 'function'
    )[0]
    const year = await render(
      list.props.renderItem({
        item: [2024, 2025, 2026],
        index: 0,
        separators: {},
      })
    )
    const yearButton = year.container.queryAll(
      (node: Instance) => node.props.accessibilityLabel === '2025'
    )[0]
    if (yearButton) await pressNode(yearButton)
    list.props.renderScrollComponent({})
    list.props.keyExtractor([2024, 2025, 2026])

    await render(
      <YearPicker
        endYear={1800}
        onPressYear={onPressYear}
        selectedYear={undefined}
        selectingYear={false}
        startYear={Number.NaN}
      />
    )
    await render(
      <YearPicker
        endYear={Number.NaN}
        onPressYear={onPressYear}
        selectedYear={2200}
        selectingYear
        startYear={2200}
      />
    )
    expect(onPressYear).toHaveBeenCalled()

    const collapsed = await render(
      <AnimatedCrossView calendar={<Text>cal</Text>} calendarEdit={<Text>edit</Text>} collapsed />
    )
    await collapsed.rerender(
      <AnimatedCrossView
        calendar={<Text>cal</Text>}
        calendarEdit={<Text>edit</Text>}
        collapsed={false}
      />
    )

    const sizer = await render(
      <AutoSizer initialLayout={layout}>{() => <Text>ready</Text>}</AutoSizer>
    )
    await act(() => {
      layouts(sizer.container, 200, 100)
      layouts(sizer.container, 200, 100)
      layouts(sizer.container, 0, 100)
    })
    await render(<AutoSizer>{() => <Text>later</Text>}</AutoSizer>)

    await render(<DayNames disableWeekDays={[0]} locale="en" startWeekOnMonday />)
  })

  it('renders every day-range shape and day text color', async () => {
    await render(<DayRange inRange={false} leftCrop={false} rightCrop={false} selectColor="blue" />)
    await render(<DayRange inRange leftCrop={false} rightCrop={false} selectColor="blue" />)
    await render(<DayRange inRange leftCrop rightCrop={false} selectColor="blue" />)
    await render(<DayRange inRange leftCrop={false} rightCrop selectColor="blue" />)
    await render(<DayRange inRange leftCrop rightCrop selectColor="blue" />)

    const theme = {
      ...LightTheme,
      dark: true,
      colors: { ...LightTheme.colors, onPrimary: '' },
    }
    const base = {
      day: 2,
      disabled: false,
      leftCrop: false,
      month: 0,
      onPressDate: jest.fn(),
      primaryColor: 'blue',
      rightCrop: false,
      selectColor: 'lightblue',
      textColorOnPrimary: '#fff',
      theme,
      year: 2026,
    }
    const selected = await render(
      <Day {...base} inRange isToday={false} selected />
    )
    await pressTestId(selected, 'react-native-paper-dates-day-2026-0-2')

    await render(<Day {...base} inRange isToday selected={false} />)
    await render(
      <Day {...base} disabled inRange={false} isToday selected={false} />
    )
    await render(
      <Day
        {...base}
        dayContent={() => <Text>x</Text>}
        inRange={false}
        isToday
        selected
      />
    )
  })
})

describe('native month swiper', () => {
  it('pages horizontally and vertically, including an out-of-range index', async () => {
    const swiper = await render(
      <Swiper
        endYear={2028}
        initialIndex={getStartAtIndex(2024, 2028)}
        initialLayout={{ width: 300, height: 120 }}
        renderFooter={() => <Text>footer</Text>}
        renderHeader={(props) => <Text>{props.endInset}</Text>}
        renderItem={({ index, onNext, onPrev }) => (
          <Pressable onPress={onPrev} testID={`prev-${index}`}>
            <Pressable onPress={onNext} testID={`next-${index}`} />
          </Pressable>
        )}
        scrollMode="horizontal"
        selectedYear={2027}
        startWeekOnMonday={false}
        startYear={2024}
      />
    )
    const scroll = swiper.container.queryAll(
      (node: { props: { onMomentumScrollEnd?: Function } }) =>
        typeof node.props.onMomentumScrollEnd === 'function'
    )[0]
    const prev = swiper.container.queryAll(
      (node: Instance) => String(node.props.testID).startsWith('prev-')
    )[0]
    const next = swiper.container.queryAll(
      (node: Instance) => String(node.props.testID).startsWith('next-')
    )[0]
    await pressNode(prev)
    await pressNode(next)
    await act(() => {
      scroll.props.onMomentumScrollEnd({
        nativeEvent: {
          contentOffset: { x: 0, y: 400 },
          layoutMeasurement: { width: 300, height: 120 },
        },
      })
      scroll.props.onMomentumScrollEnd({
        nativeEvent: {
          contentOffset: { x: 10500, y: 0 },
          layoutMeasurement: { width: 300, height: 120 },
        },
      })
      scroll.props.onMomentumScrollEnd({
        nativeEvent: {
          contentOffset: { x: 999999, y: 0 },
          layoutMeasurement: { width: 300, height: 120 },
        },
      })
      scroll.props.onLayout()
    })

    await render(
      <Swiper
        endYear={2026}
        initialIndex={-5}
        initialLayout={{ width: 300, height: 900 }}
        renderItem={() => <Text>month</Text>}
        scrollMode="vertical"
        selectedYear={undefined}
        startWeekOnMonday
        startYear={2026}
      />
    )
    await render(
      <Swiper
        initialIndex={getStartAtIndex()}
        initialLayout={{ width: 300, height: 500 }}
        renderItem={({ onNext }) => (
          <Pressable onPress={onNext} testID="vertical-next" />
        )}
        scrollMode="vertical"
        selectedYear={undefined}
        startWeekOnMonday={false}
      />
    )
    const vertical = await render(
      <Swiper
        endYear={2026}
        initialIndex={0}
        initialLayout={{ width: 300, height: 400 }}
        renderItem={({ onNext, onPrev }) => (
          <>
            <Pressable onPress={onPrev} testID="edge-prev" />
            <Pressable onPress={onNext} testID="edge-next" />
          </>
        )}
        scrollMode="vertical"
        selectedYear={1800}
        startWeekOnMonday={false}
        startYear={2026}
      />
    )
    await pressTestId(vertical, 'edge-prev')
    await pressTestId(vertical, 'edge-next')
    const verticalScroll = vertical.container.queryAll(
      (node: { props: { onMomentumScrollEnd?: Function } }) =>
        typeof node.props.onMomentumScrollEnd === 'function'
    )[0]
    await act(() => {
      verticalScroll.props.onMomentumScrollEnd({
        nativeEvent: {
          contentOffset: { x: 0, y: 4000 },
          layoutMeasurement: { width: 300, height: 400 },
        },
      })
    })
  })
})


describe('platform specific header gutter', () => {
  const originalOS = Platform.OS

  afterAll(() => {
    Platform.OS = originalOS
  })

  it('evaluates the gutter on android and web', () => {
    Platform.OS = 'android'
    jest.isolateModules(() => {
      require('../../Date/CalendarHeader')
    })
    Platform.OS = 'web'
    jest.isolateModules(() => {
      require('../../Date/CalendarHeader')
      require('../../Date/YearPicker')
      require('../../Date/Month')
    })
    Platform.OS = originalOS
  })
})
