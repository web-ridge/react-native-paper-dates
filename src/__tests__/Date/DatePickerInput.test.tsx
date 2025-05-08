import { render } from '@testing-library/react-native'
import DatePickerInput from '../../Date/DatePickerInput'

it('renders DatePickerInput', () => {
  const { toJSON } = render(
    <DatePickerInput
      locale="en"
      value={new Date()}
      onChange={() => null}
      inputMode="start"
    />
  )
  expect(toJSON()).toMatchSnapshot()
})
