import { render } from '@testing-library/react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import DatePickerModalContent from '../../Date/DatePickerModalContent'

it('renders DatePickerModalContent', async () => {
  const fixedDate = new Date('2025-01-15')
  const { toJSON } = await render(
    <SafeAreaProvider>
      <DatePickerModalContent
        date={fixedDate}
        locale="en"
        mode="single"
        onConfirm={() => null}
        onDismiss={() => null}
      />
    </SafeAreaProvider>
  )
  expect(toJSON()).toMatchSnapshot()
})
