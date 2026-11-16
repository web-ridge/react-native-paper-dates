import { fireEvent, render } from '@testing-library/react-native'

import { defaultEndYear, defaultStartYear } from '../../Date/dateUtils'
import YearPicker from '../../Date/YearPicker'

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
