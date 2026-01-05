import { render } from '@testing-library/react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import DatePickerModalContent from '../../Date/DatePickerModalContent'

it('renders DatePickerModalContent', () => {
  const fixedDate = new Date('2025-01-15')
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
