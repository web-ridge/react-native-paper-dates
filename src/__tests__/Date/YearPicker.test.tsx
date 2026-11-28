import { act, fireEvent, render } from '@testing-library/react-native'
import { FlatList, StyleSheet } from 'react-native'
import { LightTheme } from 'react-native-paper'

import { defaultEndYear, defaultStartYear } from '../../Date/dateUtils'
import YearPicker from '../../Date/YearPicker'
import { withAlpha } from '../../shared/utils'

it('tracks focus and hover and selects a year from the menu', async () => {
  const onPressYear = jest.fn()
  const grid = await render(
    <YearPicker
      endYear={2026}
      onPressYear={onPressYear}
      selectedYear={2025}
      selectingYear
      startYear={2024}
    />
  )
  const year = grid.getByLabelText('2025')
  await fireEvent(year, 'focus')
  await fireEvent(year, 'hoverIn')
  await fireEvent(year, 'pressIn')
  await fireEvent.press(year)
  await fireEvent(year, 'pressOut')
  await fireEvent(year, 'hoverOut')
  await fireEvent(year, 'blur')

  const menu = await render(
    <YearPicker
      endYear={2026}
      onPressYear={onPressYear}
      selectedYear={2025}
      selectingYear
      startYear={2024}
      variant="menu"
    />
  )
  await fireEvent.press(menu.getByLabelText('2026'))
  expect(onPressYear).toHaveBeenCalledWith(2025)
  expect(onPressYear).toHaveBeenCalledWith(2026)
})

it('keeps the year chip 72 by 36 and expands the press target to 48dp', async () => {
  const view = await render(
    <YearPicker
      endYear={2026}
      onPressYear={() => null}
      selectedYear={2025}
      selectingYear
      startYear={2024}
    />
  )
  const year = view.getByLabelText('2025')
  expect(year.props.hitSlop).toEqual({ bottom: 6, top: 6 })
  expect(StyleSheet.flatten(year.props.style)).toEqual({
    height: 36,
    width: 72,
  })
})

it('treats the current year like today and rings keyboard focus', async () => {
  const year = new Date().getFullYear()
  const view = await render(
    <YearPicker
      endYear={year + 1}
      onPressYear={() => null}
      selectedYear={year + 1}
      selectingYear
      startYear={year - 1}
    />
  )
  const current = view.getByLabelText(String(year))
  const colors = (node: {
    children?: Array<object | string>
    props?: { style?: unknown }
  }): { background: string[]; border: string[] } => {
    const style = StyleSheet.flatten(
      node.props?.style as Parameters<typeof StyleSheet.flatten>[0]
    )
    const background =
      typeof style?.backgroundColor === 'string' ? [style.backgroundColor] : []
    const border =
      typeof style?.borderColor === 'string' ? [style.borderColor] : []
    for (const child of node.children ?? []) {
      if (typeof child === 'string') continue
      const nested = colors(child as typeof node)
      background.push(...nested.background)
      border.push(...nested.border)
    }
    return { background, border }
  }
  expect(colors(current).border).toContain(LightTheme.colors.primary)
  await fireEvent(current, 'hoverIn')
  expect(colors(current).background).toContain(
    withAlpha(LightTheme.colors.primary, 0.08)
  )
  await fireEvent(current, 'focus')
  expect(colors(current).border).toContain(LightTheme.colors.secondary)

  const selected = view.getByLabelText(String(year + 1))
  await fireEvent(selected, 'hoverIn')
  expect(colors(selected).background).toContain(
    withAlpha(LightTheme.colors.onPrimary, 0.08)
  )
})

it('opens the menu on the selected year after the list is measured', async () => {
  const scrollToIndex = jest
    .spyOn(FlatList.prototype, 'scrollToIndex')
    .mockImplementation(() => {})
  const layout = {
    height: 360,
    width: 360,
    x: 0,
    y: 0,
  }
  try {
    const menu = await render(
      <YearPicker
        endYear={2030}
        onPressYear={() => null}
        selectedYear={2026}
        selectingYear
        startYear={2020}
        variant="menu"
      />
    )
    const index = 2026 - 2020
    const list = menu.container.queryAll(
      (node: { props: { initialScrollIndex?: number } }) =>
        node.props.initialScrollIndex === index
    )[0]
    expect(list.props.getItemLayout(null, index)).toEqual({
      index,
      length: 48,
      offset: index * 48,
    })
    expect(list.props.contentOffset).toEqual({ x: 0, y: index * 48 })
    await act(() => {
      list.props.onLayout({ nativeEvent: { layout: { ...layout, height: 0 } } })
      list.props.onContentSizeChange(360, 0)
    })
    expect(scrollToIndex).not.toHaveBeenCalled()
    await act(() => {
      list.props.onLayout({ nativeEvent: { layout } })
      list.props.onContentSizeChange(360, index * 48)
    })
    expect(scrollToIndex).toHaveBeenCalledWith({ animated: false, index })
    await act(() => {
      jest.advanceTimersByTime(16)
    })
    expect(scrollToIndex).toHaveBeenCalledTimes(2)

    scrollToIndex.mockClear()
    const start = await render(
      <YearPicker
        endYear={2026}
        onPressYear={() => null}
        selectedYear={2026}
        selectingYear
        startYear={2026}
        variant="menu"
      />
    )
    const first = start.container.queryAll(
      (node: { props: { initialScrollIndex?: number } }) =>
        node.props.initialScrollIndex === 0
    )[0]
    await act(() => {
      first.props.onLayout({ nativeEvent: { layout } })
      first.props.onContentSizeChange(360, 48)
    })
    expect(scrollToIndex).not.toHaveBeenCalled()

    const grid = await render(
      <YearPicker
        endYear={2026}
        onPressYear={() => null}
        selectedYear={2026}
        selectingYear
        startYear={2024}
      />
    )
    const rows = grid.container.queryAll(
      (node: {
        props: {
          getItemLayout?: (data: null, index: number) => { length: number }
        }
      }) => node.props.getItemLayout?.(null, 1)?.length === 52
    )[0]
    expect(rows.props.getItemLayout(null, 1)).toEqual({
      index: 1,
      length: 52,
      offset: 52,
    })
  } finally {
    scrollToIndex.mockRestore()
  }
})

it('renders', async () => {
  await render(
    <YearPicker
      endYear={defaultEndYear}
      onPressYear={() => null}
      selectedYear={undefined}
      selectingYear={false}
      startYear={defaultStartYear}
    />
  )
})
