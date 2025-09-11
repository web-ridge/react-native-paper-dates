import { render } from '@testing-library/react-native'
import DatePickerInputWithoutModal from '../../Date/DatePickerInputWithoutModal'

// 7th of August, 2025
const fixedDate = new Date(2025, 7, 7)

it('renders DatePickerInputWithoutModal', () => {
  const { toJSON } = render(
    <DatePickerInputWithoutModal
      locale="en"
      value={fixedDate}
      onChange={() => null}
      inputMode="start"
    />
  )
  expect(toJSON()).toMatchSnapshot()
})
