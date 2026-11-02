import { render } from '@testing-library/react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import DatePickerModal from '../../Date/DatePickerModal'

it('renders DatePickerModal', async () => {
  const { toJSON } = await render(
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

it('passes initialLayout to the calendar so the month draws on open', async () => {
  const { queryByText } = await render(
    <SafeAreaProvider
      initialMetrics={{
        frame: { x: 0, y: 0, width: 360, height: 640 },
        insets: { top: 0, left: 0, right: 0, bottom: 0 },
      }}
    >
      <DatePickerModal
        locale="en"
        mode="single"
        visible={true}
        date={new Date('2025-01-15')}
        onDismiss={() => null}
        onConfirm={() => null}
        initialLayout={{ width: 320, height: 400 }}
      />
    </SafeAreaProvider>
  )
  expect(queryByText('January 2025')).toBeTruthy()
})
