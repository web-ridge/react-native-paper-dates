import { act } from '@testing-library/react-native'
import type { ReactNode } from 'react'
import { Dimensions, Platform, StyleSheet } from 'react-native'
import { PaperProvider } from 'react-native-paper'
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
  expect(
    screen.getByText('Date format must be MM/DD/YYYY', {
      includeHiddenElements: true,
    })
  ).toBeTruthy()
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

  expect(screen.getByText('Enter dates')).toBeTruthy()
  expect(screen.getByText('Start date – End date')).toBeTruthy()
  expect(screen.getByLabelText(/Start date/)).toBeTruthy()
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
      rangeHeadline.formatRange(new Date(2026, 0, 2), new Date(2026, 0, 5))
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

it('floats the card on a level 3 surface', async () => {
  const screen = await render(
    host(
      <DatePickerModalInput
        locale="en"
        mode="single"
        onConfirm={jest.fn()}
        onDismiss={jest.fn()}
        visible
      />
    )
  )

  const [card] = byTestId(
    screen,
    'react-native-paper-dates-modal-input-surface'
  )
  const style = StyleSheet.flatten(card?.props.style as object) as {
    borderRadius?: number
    shadowOpacity?: number
  }
  expect(style.borderRadius).toBe(28)
  expect(style.shadowOpacity).toBeGreaterThan(0)
})

it('fades in on native, disables animation on web, and honors animationType', async () => {
  const originalOS = Platform.OS
  const animationTypeOf = (screen: { container: { queryAll: Function } }) =>
    screen.container.queryAll(
      (node: { props?: { animationType?: string } }) =>
        typeof node.props?.animationType === 'string'
    )[0]?.props.animationType
  const renderWith = (
    animationType?: 'slide' | 'fade' | 'none',
    reduceMotion: 'off' | 'on' = 'off'
  ) => {
    return render(
      <PaperProvider reduceMotion={reduceMotion}>
        {host(
          <DatePickerModalInput
            animationType={animationType}
            locale="en"
            mode="single"
            onConfirm={() => null}
            onDismiss={() => null}
            visible
          />
        )}
      </PaperProvider>
    )
  }

  try {
    Platform.OS = 'ios'
    const nativeScreen = await renderWith()
    expect(animationTypeOf(nativeScreen)).toBe('fade')

    const explicitScreen = await renderWith('slide', 'on')
    expect(animationTypeOf(explicitScreen)).toBe('slide')

    Platform.OS = 'web'
    const webScreen = await renderWith()
    expect(animationTypeOf(webScreen)).toBe('none')
  } finally {
    Platform.OS = originalOS
  }
})

it('shows a collapsed title-large range headline that can wrap', async () => {
  const startDate = new Date(1993, 4, 18)
  const endDate = new Date(1993, 4, 20)
  const screen = await render(
    host(
      <DatePickerModalInput
        endDate={endDate}
        locale="en"
        mode="range"
        onConfirm={() => null}
        onDismiss={() => null}
        startDate={startDate}
        visible
      />
    )
  )
  const headline = screen.getByText(
    new Intl.DateTimeFormat('en', {
      day: 'numeric',
      month: 'short',
    }).formatRange(startDate, endDate)
  )
  const style = StyleSheet.flatten(headline.props.style)
  expect(screen.getByText('Enter dates')).toBeTruthy()
  expect(screen.queryByText('Select date')).toBeNull()
  expect(headline).toHaveProp('numberOfLines', 2)
  expect(style.lineHeight).toBe(28)
})
