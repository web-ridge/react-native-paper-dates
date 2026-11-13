import { render } from '@testing-library/react-native'
import DatePickerInput from '../../Date/DatePickerInput'

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
