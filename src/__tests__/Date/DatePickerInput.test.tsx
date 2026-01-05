import { render } from '@testing-library/react-native'
import DatePickerInput from '../../Date/DatePickerInput'

it('renders DatePickerInput', () => {
  const fixedDate = new Date('2025-01-15')
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
