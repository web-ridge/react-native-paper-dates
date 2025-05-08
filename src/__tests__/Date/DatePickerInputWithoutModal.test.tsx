import { render } from '@testing-library/react-native'
import DatePickerInputWithoutModal from '../../Date/DatePickerInputWithoutModal'

it('renders DatePickerInputWithoutModal', () => {
  const { toJSON } = render(
    <DatePickerInputWithoutModal
      locale="en"
      value={new Date()}
      onChange={() => null}
      inputMode="start"
    />
  )
  expect(toJSON()).toMatchSnapshot()
})
