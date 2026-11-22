import { render } from '@testing-library/react-native'

import DatePickerInput from '../../Date/DatePickerInput'
import { pressLabel } from '../../testUtils'

it('renders DatePickerInput', async () => {
  const fixedDate = new Date('2025-01-15')
  const { toJSON } = await render(
    <DatePickerInput
      inputMode="start"
      locale="en"
      onChange={() => null}
      value={fixedDate}
    />
  )
  expect(toJSON()).toMatchSnapshot()
})

it('opens the picker from the labelled calendar icon', async () => {
  const screen = await render(
    <DatePickerInput
      inputMode="start"
      locale="en"
      onChange={() => null}
      presentation="docked"
      value={new Date(2026, 0, 15)}
    />
  )

  expect(
    screen.getByRole('button', { name: 'Pick date from calendar' })
  ).toBeTruthy()
  await pressLabel(screen, 'Pick date from calendar')
  expect(
    screen.getByTestId('react-native-paper-dates-docked-month')
  ).toBeTruthy()
})
