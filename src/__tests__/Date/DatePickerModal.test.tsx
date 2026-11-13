import { act, render } from '@testing-library/react-native'
import { Dimensions } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import DatePickerModal from '../../Date/DatePickerModal'

function viewsWithHeight(root: { queryAll: Function } | null, height: number) {
  if (!root) return []
  return root.queryAll((node: { props?: { style?: unknown } }) => {
    const style = node.props?.style
    const styles = Array.isArray(style) ? style.flat(2) : [style]
    return styles.some(
      (item) =>
        !!item &&
        typeof item === 'object' &&
        'height' in item &&
        (item as { height?: number }).height === height
    )
  })
}

it('renders DatePickerModal', async () => {
  const { toJSON } = await render(
    <SafeAreaProvider>
      <DatePickerModal
        locale="en"
        mode="single"
        onConfirm={() => null}
        onDismiss={() => null}
        visible={true}
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
        date={new Date('2025-01-15')}
        initialLayout={{ width: 320, height: 400 }}
        locale="en"
        mode="single"
        onConfirm={() => null}
        onDismiss={() => null}
        visible={true}
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
        date={new Date('2025-01-15')}
        locale="en"
        mode="single"
        onConfirm={() => null}
        onDismiss={() => null}
        visible={visible}
      />
    </SafeAreaProvider>
  )

  const { queryByText, root, rerender } = await render(renderModal(true))
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

it('keeps close and save at the top of the centered tablet dialog', async () => {
  const saved = Dimensions.get('window')
  const topInset = 47

  const renderAt = async (width: number, height: number) => {
    await act(async () => {
      Dimensions.set({
        window: { width, height, scale: 2, fontScale: 1 },
        screen: { width, height, scale: 2, fontScale: 1 },
      })
    })
    return render(
      <SafeAreaProvider
        initialMetrics={{
          frame: { x: 0, y: 0, width, height },
          insets: { top: topInset, left: 0, right: 0, bottom: 20 },
        }}
      >
        <DatePickerModal
          locale="en"
          mode="single"
          onConfirm={() => null}
          onDismiss={() => null}
          visible
        />
      </SafeAreaProvider>
    )
  }

  try {
    const phone = await renderAt(390, 844)
    expect(viewsWithHeight(phone.root, topInset).length).toBeGreaterThan(0)

    const tablet = await renderAt(1024, 1366)
    expect(viewsWithHeight(tablet.root, topInset)).toHaveLength(0)
    expect(tablet.getByTestId('react-native-paper-dates-close')).toBeTruthy()
    expect(tablet.getByTestId('react-native-paper-dates-save')).toBeTruthy()
  } finally {
    await act(async () => {
      Dimensions.set({ window: saved, screen: saved })
    })
  }
})
