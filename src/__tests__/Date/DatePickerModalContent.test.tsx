import { render } from '@testing-library/react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import DatePickerModalContent from '../../Date/DatePickerModalContent'

// 7th of August, 2025
const fixedDate = new Date(2025, 7, 7)

it('renders DatePickerModalContent', () => {
  const { toJSON } = render(
    <SafeAreaProvider>
      <DatePickerModalContent
        locale="en"
        mode="single"
        date={fixedDate}
        onDismiss={() => null}
        onConfirm={() => null}
      />
    </SafeAreaProvider>
  )
  expect(toJSON()).toMatchSnapshot()
})
