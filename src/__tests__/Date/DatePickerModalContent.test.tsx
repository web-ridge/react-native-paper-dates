import { render } from '@testing-library/react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import DatePickerModalContent from '../../Date/DatePickerModalContent'

it('renders DatePickerModalContent', () => {
  const { toJSON } = render(
    <SafeAreaProvider>
      <DatePickerModalContent
        locale="en"
        mode="single"
        date={new Date()}
        onDismiss={() => null}
        onConfirm={() => null}
      />
    </SafeAreaProvider>
  )
  expect(toJSON()).toMatchSnapshot()
})
