import { render } from '@testing-library/react-native'
import DatePickerInputWithoutModal from '../../Date/DatePickerInputWithoutModal'

it('renders DatePickerInputWithoutModal', () => {
  const fixedDate = new Date('2025-01-15')
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
