import { act } from '@testing-library/react-native'
import type { ReactNode } from 'react'
import { Dimensions } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import DatePickerModalInput from '../../Date/DatePickerModalInput'
import { byTestId, pressTestId, render } from '../../testUtils'
import en from '../../translations/en'
import { registerTranslation } from '../../translations/utils'

registerTranslation('en', en)

const metrics = {
  frame: { height: 800, width: 390, x: 0, y: 0 },
  insets: { bottom: 0, left: 0, right: 0, top: 0 },
}

function host(children: ReactNode) {
  return (
    <SafeAreaProvider initialMetrics={metrics}>{children}</SafeAreaProvider>
  )
}

function field(screen: { container: { queryAll: Function } }, id: string) {
  const node = byTestId(screen, id).find(
    (item) => typeof item.props.onChangeText === 'function'
  )
  if (!node) throw new Error(`missing ${id}`)
  return node.props as {
    onBlur?: (event?: unknown) => void
    onChangeText?: (text: string) => void
  }
}

function disabled(node: { props: Record<string, unknown> }) {
  const state = node.props.accessibilityState as
    | { disabled?: boolean }
    | undefined
  return node.props.disabled === true || state?.disabled === true
}

it('confirms a typed date and dismisses on cancel', async () => {
  const onConfirm = jest.fn()
  const onDismiss = jest.fn()
  const screen = await render(
    host(
      <DatePickerModalInput
        locale="en"
        mode="single"
        onConfirm={onConfirm}
        onDismiss={onDismiss}
        visible
      />
    )
  )

  expect(screen.getByText('Enter date')).toBeTruthy()
  expect(screen.getByText('Select date')).toBeTruthy()
  const input = field(screen, 'react-native-paper-dates-modal-input')
  await act(() => {
    input.onChangeText?.('01/15/2026')
  })
  await act(() => {
    field(screen, 'react-native-paper-dates-modal-input').onBlur?.({})
  })
  await pressTestId(screen, 'react-native-paper-dates-modal-input-confirm')
  expect(onConfirm).toHaveBeenCalledWith({ date: new Date(2026, 0, 15) })

  await pressTestId(screen, 'react-native-paper-dates-modal-input-cancel')
  expect(onDismiss).toHaveBeenCalled()
})

it('keeps OK disabled while the typed date is invalid', async () => {
  const onConfirm = jest.fn()
  const screen = await render(
    host(
      <DatePickerModalInput
        locale="en"
        mode="single"
        onConfirm={onConfirm}
        onDismiss={() => null}
        visible
      />
    )
  )
  const input = field(screen, 'react-native-paper-dates-modal-input')
  await act(() => {
    input.onChangeText?.('99/99/9999')
  })
  await act(() => {
    field(screen, 'react-native-paper-dates-modal-input').onBlur?.({})
  })
  const confirm = byTestId(
    screen,
    'react-native-paper-dates-modal-input-confirm'
  )[0]
  expect(disabled(confirm)).toBe(true)
  expect(screen.getByText('Date format must be MM/DD/YYYY')).toBeTruthy()
  expect(onConfirm).not.toHaveBeenCalled()
})

it('renders start and end fields for a range', async () => {
  const onConfirm = jest.fn()
  const screen = await render(
    host(
      <DatePickerModalInput
        locale="en"
        mode="range"
        onConfirm={onConfirm}
        onDismiss={() => null}
        visible
      />
    )
  )

  expect(screen.getByText('Select date')).toBeTruthy()
  expect(screen.getByText('Enter dates')).toBeTruthy()
  expect(screen.getByLabelText(/End date/)).toBeTruthy()
  await act(() => {
    field(screen, 'react-native-paper-dates-modal-input').onChangeText?.(
      '01/02/2026'
    )
  })
  await act(() => {
    field(screen, 'react-native-paper-dates-modal-input').onBlur?.({})
  })
  await act(() => {
    field(screen, 'react-native-paper-dates-modal-input-end').onChangeText?.(
      '01/05/2026'
    )
  })
  await act(() => {
    field(screen, 'react-native-paper-dates-modal-input-end').onBlur?.({})
  })
  const rangeHeadline = new Intl.DateTimeFormat('en', {
    day: 'numeric',
    month: 'short',
  })
  expect(
    screen.getByText(
      `${rangeHeadline.format(new Date(2026, 0, 2))} – ${rangeHeadline.format(new Date(2026, 0, 5))}`
    )
  ).toBeTruthy()
  await pressTestId(screen, 'react-native-paper-dates-modal-input-confirm')
  expect(onConfirm).toHaveBeenCalledWith({
    endDate: new Date(2026, 0, 5, 23, 59, 59),
    startDate: new Date(2026, 0, 2),
  })
})

it('swaps to the calendar card and back', async () => {
  const saved = Dimensions.get('window')
  await act(async () => {
    Dimensions.set({
      screen: { fontScale: 1, height: 800, scale: 2, width: 390 },
      window: { fontScale: 1, height: 800, scale: 2, width: 390 },
    })
  })

  try {
    const screen = await render(
      host(
        <DatePickerModalInput
          locale="en"
          mode="single"
          onConfirm={() => null}
          onDismiss={() => null}
          visible
        />
      )
    )
    await pressTestId(screen, 'react-native-paper-dates-modal-input-calendar')
    expect(
      screen.getByTestId('react-native-paper-dates-toggle-edit')
    ).toBeTruthy()
    expect(byTestId(screen, 'react-native-paper-dates-close')).toHaveLength(0)
    expect(screen.getByTestId('react-native-paper-dates-cancel')).toBeTruthy()
    await pressTestId(screen, 'react-native-paper-dates-toggle-edit')
    expect(screen.getByText('Enter date')).toBeTruthy()
    expect(
      screen.queryByTestId('react-native-paper-dates-toggle-edit')
    ).toBeNull()
  } finally {
    await act(async () => {
      Dimensions.set({
        screen: {
          fontScale: saved.fontScale,
          height: saved.height,
          scale: saved.scale,
          width: saved.width,
        },
        window: {
          fontScale: saved.fontScale,
          height: saved.height,
          scale: saved.scale,
          width: saved.width,
        },
      })
    })
  }
})
