import { act, render } from '@testing-library/react-native'
import {
  Dimensions,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import DatePickerModal from '../../Date/DatePickerModal'
import { pressTestId } from '../../testUtils'

function viewsWithPadding(
  root: { queryAll: Function } | null,
  paddingLeft: number
) {
  if (!root) return []
  return root.queryAll((node: { props?: { style?: unknown } }) => {
    const flat = StyleSheet.flatten(node.props?.style as StyleProp<ViewStyle>)
    return flat?.paddingLeft === paddingLeft
  })
}

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

it('mounts no picker content while hidden', async () => {
  const metrics = {
    frame: { height: 640, width: 360, x: 0, y: 0 },
    insets: { bottom: 0, left: 0, right: 0, top: 0 },
  }
  const props = {
    locale: 'en',
    mode: 'single' as const,
    onConfirm: () => null,
    onDismiss: () => null,
  }
  const modal = await render(
    <SafeAreaProvider initialMetrics={metrics}>
      <DatePickerModal {...props} visible={false} />
    </SafeAreaProvider>
  )
  // React Native's Modal renders nothing while hidden.
  expect(
    modal.queryByText('Select date', { includeHiddenElements: true })
  ).toBeNull()

  await modal.rerender(
    <SafeAreaProvider initialMetrics={metrics}>
      <DatePickerModal {...props} visible />
    </SafeAreaProvider>
  )
  expect(
    modal.getByText('Select date', { includeHiddenElements: true })
  ).toBeTruthy()
})

it('passes initialLayout to the calendar so the month draws on open', async () => {
  const { queryByText } = await render(
    <SafeAreaProvider
      initialMetrics={{
        frame: { height: 640, width: 360, x: 0, y: 0 },
        insets: { bottom: 0, left: 0, right: 0, top: 0 },
      }}
    >
      <DatePickerModal
        date={new Date('2025-01-15')}
        initialLayout={{ height: 400, width: 320 }}
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

it('draws the month on the first open and again after it closes', async () => {
  const metrics = {
    frame: { height: 640, width: 360, x: 0, y: 0 },
    insets: { bottom: 0, left: 0, right: 0, top: 0 },
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

  const { queryByText, rerender, root } = await render(renderModal(true))
  expect(queryByText('January 2025')).toBeTruthy()

  const calendarContainer = root!.queryAll(
    (node) => node.type === 'View' && !!node.props.onLayout
  )[0]
  await act(() => {
    calendarContainer.props.onLayout({
      nativeEvent: { layout: { height: 420, width: 360, x: 0, y: 0 } },
    })
  })

  await rerender(renderModal(false))
  await rerender(renderModal(true))
  expect(queryByText('January 2025')).toBeTruthy()
})

it('uses cancel and ok at the bottom of the centered tablet dialog', async () => {
  const saved = Dimensions.get('window')

  const topInset = 47

  const renderAt = async (width: number, height: number) => {
    await act(async () => {
      Dimensions.set({
        screen: { fontScale: 1, height, scale: 2, width },
        window: { fontScale: 1, height, scale: 2, width },
      })
    })
    return render(
      <SafeAreaProvider
        initialMetrics={{
          frame: { height, width, x: 0, y: 0 },
          insets: { bottom: 20, left: 0, right: 0, top: topInset },
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
    await pressTestId(phone, 'react-native-paper-dates-toggle-edit')
    expect(phone.getByText('Enter date')).toBeTruthy()
    expect(phone.getByLabelText('Date, mm/dd/yyyy')).toBeTruthy()
    expect(phone.getByTestId('react-native-paper-dates-close')).toBeTruthy()
    expect(phone.getByTestId('react-native-paper-dates-save')).toBeTruthy()
    expect(viewsWithHeight(phone.root, topInset).length).toBeGreaterThan(0)
    const inputCard = phone.root!.queryAll(
      (node: { props?: { style?: unknown } }) => {
        const flat = StyleSheet.flatten(
          node.props?.style as StyleProp<ViewStyle>
        )
        return flat?.width === 360 && flat?.borderRadius === 28
      }
    )
    expect(inputCard).toHaveLength(0)

    const tablet = await renderAt(1024, 1366)
    expect(viewsWithHeight(tablet.root, topInset)).toHaveLength(0)
    expect(tablet.queryByTestId('react-native-paper-dates-close')).toBeNull()
    expect(tablet.getByTestId('react-native-paper-dates-cancel')).toBeTruthy()
    expect(tablet.getByTestId('react-native-paper-dates-confirm')).toBeTruthy()
  } finally {
    await act(async () => {
      Dimensions.set({ screen: saved, window: saved })
    })
  }
})

it('pads the phone sheet with side insets and leaves the centered card alone', async () => {
  const saved = Dimensions.get('window')
  const side = 34

  const renderAt = async (width: number, height: number) => {
    await act(async () => {
      Dimensions.set({
        screen: { fontScale: 1, height, scale: 2, width },
        window: { fontScale: 1, height, scale: 2, width },
      })
    })
    return render(
      <SafeAreaProvider
        initialMetrics={{
          frame: { height, width, x: 0, y: 0 },
          insets: { bottom: 0, left: side, right: side, top: 0 },
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
    expect(viewsWithPadding(phone.root, side).length).toBeGreaterThan(0)

    const tablet = await renderAt(1024, 1366)
    expect(viewsWithPadding(tablet.root, side)).toHaveLength(0)
  } finally {
    await act(async () => {
      Dimensions.set({ screen: saved, window: saved })
    })
  }
})
