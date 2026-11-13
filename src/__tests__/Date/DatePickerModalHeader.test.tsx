import { render } from '@testing-library/react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import DatePickerModalHeader from '../../Date/DatePickerModalHeader'

it('renders DatePickerModalHeader', async () => {
  const { toJSON } = await render(
    <SafeAreaProvider>
      <DatePickerModalHeader
        locale="en"
        onDismiss={() => null}
        onSave={() => null}
        saveLabel="Save"
      />
    </SafeAreaProvider>
  )
  expect(toJSON()).toMatchSnapshot()
})
