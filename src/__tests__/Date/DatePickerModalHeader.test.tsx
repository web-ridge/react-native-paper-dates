import { render } from '@testing-library/react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import DatePickerModalHeader from '../../Date/DatePickerModalHeader'

it('renders DatePickerModalHeader', () => {
  const { toJSON } = render(
    <SafeAreaProvider>
      <DatePickerModalHeader
        locale="en"
        onSave={() => null}
        onDismiss={() => null}
        saveLabel="Save"
      />
    </SafeAreaProvider>
  )
  expect(toJSON()).toMatchSnapshot()
})
