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
    expect(getMonthHeight('horizontal', start, false, 2020, 2030)).toBeGreaterThan(
      0
    )
    expect(getMonthHeight('vertical', start, true, 2020, 2030)).toBeGreaterThan(0)
  })
})

describe('calendar interactions', () => {
  it('selects, extends, and toggles dates', async () => {
    const onChange = jest.fn()
    const single = await render(
      <Calendar
        locale="en"
        mode="single"
        date={day}
        dateMode="end"
        onChange={onChange}
        initialLayout={layout}
        startWeekOnMonday
        disableWeekDays={[0]}
        dayContent={() => <Text>dot</Text>}
        dayContentPosition="top"
      />
    )
    await pressDays(single, 1)
    await fireEvent.press(single.getByLabelText('November 2026'))
    await pressTestId(single, 'react-native-paper-dates-next-month')
    await pressTestId(single, 'react-native-paper-dates-prev-month')
    expect(onChange).toHaveBeenCalled()

    const startOnly = await render(
      <Calendar
        locale="en"
        mode="range"
        startDate={new Date(2026, 10, 10)}
        endDate={undefined}
        onChange={onChange}
        initialLayout={{ width: 320, height: 800 }}
      />
    )
    await pressDays(startOnly, 3)
    await pressTestId(startOnly, 'react-native-paper-dates-day-2026-10-20')

    const both = await render(
      <Calendar
        locale="en"
        mode="range"
        startDate={new Date(2026, 10, 1)}
        endDate={new Date(2026, 10, 30)}
        onChange={onChange}
        initialLayout={{ width: 320, height: 200 }}
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
        locale="en"
        mode="multiple"
        dates={[new Date(2026, 10, 10), new Date(2026, 10, 11)]}
        onChange={onChange}
        initialLayout={layout}
      />
    )
    await pressDays(multi, 2)
    await pressTestId(multi, 'react-native-paper-dates-day-2026-10-10')


    const empty = await render(
      <Calendar
        locale="en"
        mode="multiple"
        dates={undefined}
        onChange={onChange}
        initialLayout={layout}
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
      locale: 'en',
      index,
      onPressDate,
      onPressYear,
      selectingYear: true,
      primaryColor: '#6200ee',
      selectColor: '#eee',
      roundness: 4,
      startWeekOnMonday: true,
      disableWeekDays: [6],
    }
    const single = await render(
      <Month {...shared} mode="single" date={new Date()} scrollMode="horizontal" />
    )
    await pressDays(single, 1)

    await render(
      <Month
        {...shared}
        mode="range"
        scrollMode="vertical"
        startDate={new Date(2026, 10, 1)}
        endDate={new Date(2026, 10, 30)}
      />
    )
    await render(
      <Month
        {...shared}
        mode="range"
        scrollMode="vertical"
        startDate={new Date(2026, 10, 10)}
        endDate={undefined}
        selectingYear={false}
      />
    )
    await render(
      <Month
        {...shared}
        mode="multiple"
        scrollMode="vertical"
        dates={[
          new Date(2026, 10, 1),
          new Date(2026, 10, 2),
          new Date(2026, 10, 3),
          new Date(2026, 10, 15),
          new Date(2026, 10, 30),
        ]}
      />
    )
    await render(
      <Month
        {...shared}
        mode="multiple"
        scrollMode="vertical"
        dates={null}
        dayContent={() => <Text>•</Text>}
        dayContentPosition="center"
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
          locale="en"
          mode="single"
          date={day}
          dateMode="start"
          onDismiss={onDismiss}
          onConfirm={onConfirm}
          onChange={onChange}
          initialLayout={layout}
          label="Birth date"
          uppercase
          allowEditing
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
          locale="en"
          mode="range"
          startDate={new Date(2026, 10, 10)}
          endDate={new Date(2026, 10, 12)}
          onDismiss={onDismiss}
          onConfirm={onConfirm}
          initialLayout={layout}
          saveLabel="Apply"
          editIcon="pencil"
          calendarIcon="calendar"
        />
      )
    )
    await pressTestId(range, 'react-native-paper-dates-save')

    const multi = await render(
      safe(
        <DatePickerModalContent
          locale="en"
          mode="multiple"
          dates={[
            new Date(2026, 10, 1),
            new Date(2026, 10, 2),
            new Date(2026, 10, 3),
          ]}
          onDismiss={onDismiss}
          onConfirm={onConfirm}
          initialLayout={layout}
          allowEditing={false}
          moreLabel="more"
        />
      )
    )
    await pressTestId(multi, 'react-native-paper-dates-save')
    expect(onConfirm).toHaveBeenCalled()

    await render(
      safe(
        <DatePickerModalContent
          locale="en"
          mode="multiple"
          dates={undefined}
          onDismiss={onDismiss}
          onConfirm={onConfirm}
          initialLayout={layout}
        />
      )
    )
    await render(
      safe(
        <DatePickerModalContent
          locale="en"
          mode={'other' as 'single'}
          onDismiss={onDismiss}
          onConfirm={onConfirm}
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
          locale="en"
          mode="single"
          visible
          date={day}
          presentationStyle="formSheet"
          disableStatusBar
          statusBarOnTopOfBackdrop
          withDateFormatInLabel={false}
          onDismiss={onDismiss}
          onConfirm={onConfirm}
          initialLayout={layout}
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
          locale="en"
          mode="single"
          visible
          presentationStyle="pageSheet"
          animationType="fade"
          onDismiss={onDismiss}
          onConfirm={onConfirm}
        />
      )
    )
    Platform.OS = 'ios'
    await render(
      safe(
        <DatePickerModal
          locale="en"
          mode="range"
          visible
          startDate={day}
          endDate={day}
          presentationStyle="pageSheet"
          onDismiss={onDismiss}
          onConfirm={onConfirm}
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
          locale="en"
          inputMode="start"
          value={day}
          onChange={onChange}
          testID="date"
          iconColor="red"
          iconSize={20}
          saveLabelDisabled
          startYear={2020}
          endYear={2030}
          disableStatusBarPadding
          validRange={{
            startDate: new Date(2026, 0, 1),
            endDate: new Date(2026, 11, 31),
          }}
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
        locale="en"
        inputMode="end"
        value={undefined}
        onChange={onChange}
        withModal={false}
        disableCalendarIcon
        disabled
      />
    )

    const plain = await render(
      <DatePickerInputWithoutModal
        locale="en"
        inputMode="start"
        label="When"
        value={undefined}
        onChange={onChange}
        onChangeText={onChangeText}
        withDateFormatInLabel={false}
        inputEnabled={false}
        hasError
        hideValidationErrors
        testID="plain"
      />
    )
    const field = byTestId(plain, 'plain')[0]
    await act(() => {
      field.props.onChangeText?.('01/02/2026')
      field.props.onChange?.({ nativeEvent: { text: '01/02/2026' } })
    })

    await render(
      <DatePickerInputWithoutModal
        locale="en"
        inputMode="start"
        value={undefined}
        onChange={onChange}
        withDateFormatInLabel
        inputEnabled
        keyboardType="default"
        keyboardAppearance="dark"
        testID="bare"
      />
    )
  })

  it('renders header chrome for both orientations and editing states', async () => {
    const onChange = jest.fn()
    await render(
      <CalendarEdit
        mode="range"
        collapsed
        locale="en"
        validRange={undefined}
        onChange={onChange}
        state={{
          date: day,
          startDate: day,
          endDate: day,
          dates: [day],
        }}
        disableWeekDays={[0, 1, 2, 3, 4, 5, 6]}
      />
    )
    const editing = await render(
      <CalendarEdit
        mode="single"
        collapsed={false}
        locale="en"
        validRange={undefined}
        onChange={onChange}
        label="Day"
        state={{
          date: undefined,
          startDate: undefined,
          endDate: undefined,
          dates: undefined,
        }}
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
        mode="multiple"
        collapsed={false}
        locale="en"
        validRange={undefined}
        onChange={onChange}
        state={{
          date: undefined,
          startDate: undefined,
          endDate: undefined,
          dates: undefined,
        }}
      />
    )

    await render(
      <CalendarHeader
        locale="en"
        scrollMode="vertical"
        onPrev={() => null}
        onNext={() => null}
        startWeekOnMonday={false}
      />
    )
    const header = await render(
      <CalendarHeader
        locale={undefined}
        scrollMode="horizontal"
        onPrev={() => null}
        onNext={() => null}
        startWeekOnMonday
        endInset={12}
        disableWeekDays={[0]}
      />
    )
    await pressTestId(header, 'react-native-paper-dates-next-month')

    await render(
      safe(
        <DatePickerModalHeader
          locale="en"
          onSave={() => null}
          onDismiss={() => null}
          saveLabel="Keep"
          saveLabelDisabled={false}
          uppercase={false}
          closeIcon="close"
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
          <DatePickerModalHeader locale="en" onSave={() => null} onDismiss={() => null} />

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
        selectingYear
        selectedYear={2024}
        startYear={2024}
        endYear={2026}
        onPressYear={onPressYear}
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
        selectingYear={false}
        selectedYear={undefined}
        startYear={Number.NaN}
        endYear={1800}
        onPressYear={onPressYear}
      />
    )
    await render(
      <YearPicker
        selectingYear
        selectedYear={2200}
        startYear={2200}
        endYear={Number.NaN}
        onPressYear={onPressYear}
      />
    )
    expect(onPressYear).toHaveBeenCalled()

    const collapsed = await render(
      <AnimatedCrossView collapsed calendar={<Text>cal</Text>} calendarEdit={<Text>edit</Text>} />
    )
    await collapsed.rerender(
      <AnimatedCrossView
        collapsed={false}
        calendar={<Text>cal</Text>}
        calendarEdit={<Text>edit</Text>}
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

    await render(<DayNames locale="en" startWeekOnMonday disableWeekDays={[0]} />)
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
      theme,
      textColorOnPrimary: '#fff',
      day: 2,
      month: 0,
      year: 2026,
      leftCrop: false,
      rightCrop: false,
      primaryColor: 'blue',
      selectColor: 'lightblue',
      disabled: false,
      onPressDate: jest.fn(),
    }
    const selected = await render(
      <Day {...base} selected inRange isToday={false} />
    )
    await pressTestId(selected, 'react-native-paper-dates-day-2026-0-2')

    await render(<Day {...base} selected={false} inRange isToday />)
    await render(
      <Day {...base} selected={false} inRange={false} isToday disabled />
    )
    await render(
      <Day
        {...base}
        selected
        inRange={false}
        isToday
        dayContent={() => <Text>x</Text>}
      />
    )
  })
})

describe('native month swiper', () => {
  it('pages horizontally and vertically, including an out-of-range index', async () => {
    const swiper = await render(
      <Swiper
        initialIndex={getStartAtIndex(2024, 2028)}
        scrollMode="horizontal"
        startWeekOnMonday={false}
        startYear={2024}
        endYear={2028}
        selectedYear={2027}
        initialLayout={{ width: 300, height: 120 }}
        renderItem={({ onPrev, onNext, index }) => (
          <Pressable testID={`prev-${index}`} onPress={onPrev}>
            <Pressable testID={`next-${index}`} onPress={onNext} />
          </Pressable>
        )}
        renderHeader={(props) => <Text>{props.endInset}</Text>}
        renderFooter={() => <Text>footer</Text>}
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
        initialIndex={-5}
        scrollMode="vertical"
        startWeekOnMonday
        startYear={2026}
        endYear={2026}
        selectedYear={undefined}
        initialLayout={{ width: 300, height: 900 }}
        renderItem={() => <Text>month</Text>}
      />
    )
    await render(
      <Swiper
        initialIndex={getStartAtIndex()}
        scrollMode="vertical"
        startWeekOnMonday={false}
        selectedYear={undefined}
        initialLayout={{ width: 300, height: 500 }}
        renderItem={({ onNext }) => (
          <Pressable testID="vertical-next" onPress={onNext} />
        )}
      />
    )
    const vertical = await render(
      <Swiper
        initialIndex={0}
        scrollMode="vertical"
        startWeekOnMonday={false}
        startYear={2026}
        endYear={2026}
        selectedYear={1800}
        initialLayout={{ width: 300, height: 400 }}
        renderItem={({ onPrev, onNext }) => (
          <>
            <Pressable testID="edge-prev" onPress={onPrev} />
            <Pressable testID="edge-next" onPress={onNext} />
          </>
        )}
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
