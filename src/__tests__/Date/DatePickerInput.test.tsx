import { render } from '@testing-library/react-native'
import DatePickerInput from '../../Date/DatePickerInput'

// 7th of August, 2025
const fixedDate = new Date(2025, 7, 7)

it('renders DatePickerInput', () => {
  const { toJSON } = render(
    <DatePickerInput
      locale="en"
      value={fixedDate}
      onChange={() => null}
      inputMode="start"
    />
  )
  expect(toJSON()).toMatchSnapshot()
})
