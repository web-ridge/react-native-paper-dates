import { act, render } from '@testing-library/react-native'
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

it('reuses the calendar size from the last open, so a reopen draws the month at once', async () => {
  const metrics = {
    frame: { x: 0, y: 0, width: 360, height: 640 },
    insets: { top: 0, left: 0, right: 0, bottom: 0 },
  }
  const renderModal = (visible: boolean) => (
    <SafeAreaProvider initialMetrics={metrics}>
      <DatePickerModal
        locale="en"
        mode="single"
        visible={visible}
        date={new Date('2025-01-15')}
        onDismiss={() => null}
        onConfirm={() => null}
      />
    </SafeAreaProvider>
  )

  const { queryByText, root, rerender } = await render(renderModal(true))
  // First open: no size known yet, so the calendar waits for its layout.
  expect(queryByText('January 2025')).toBeNull()

  const calendarContainer = root!.queryAll(
    (node) => node.type === 'View' && !!node.props.onLayout
  )[0]
  await act(() => {
    calendarContainer.props.onLayout({
      nativeEvent: { layout: { x: 0, y: 0, width: 360, height: 420 } },
    })
  })

  await rerender(renderModal(false))
  await rerender(renderModal(true))
  expect(queryByText('January 2025')).toBeTruthy()
})
