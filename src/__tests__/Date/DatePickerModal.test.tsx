import { render } from '@testing-library/react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import DatePickerModal from '../../Date/DatePickerModal'

it('renders DatePickerModal', () => {
  const { toJSON } = render(
    <SafeAreaProvider>
      <DatePickerModal
        locale="en"
        mode="single"
        visible={true}
        onDismiss={() => null}
        onConfirm={() => null}
      />
    </SafeAreaProvider>
  )
  expect(toJSON()).toMatchSnapshot()
})
