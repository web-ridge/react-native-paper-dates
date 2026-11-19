import { fireEvent, render } from '@testing-library/react-native'
import { StyleSheet } from 'react-native'
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
