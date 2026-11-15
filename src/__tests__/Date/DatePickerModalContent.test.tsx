import { act, render } from '@testing-library/react-native'
import { Dimensions } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import DatePickerInputForm from '../../Date/DatePickerInputForm'
import DatePickerModalContent from '../../Date/DatePickerModalContent'
import { pressTestId } from '../../testUtils'

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

it('does not confirm a range that starts and ends on the same day', async () => {
  const saved = Dimensions.get('window')
  await act(async () => {
    Dimensions.set({
      screen: { fontScale: 1, height: 844, scale: 2, width: 390 },
      window: { fontScale: 1, height: 844, scale: 2, width: 390 },
    })
  })
  const metrics = {
    frame: { height: 844, width: 390, x: 0, y: 0 },
    insets: { bottom: 0, left: 0, right: 0, top: 0 },
  }
  try {
    const onConfirm = jest.fn()
    const screen = await render(
      <SafeAreaProvider initialMetrics={metrics}>
        <DatePickerModalContent
          endDate={new Date(2026, 10, 10, 23, 59, 59)}
          locale="en"
          mode="range"
          onConfirm={onConfirm}
          onDismiss={() => null}
          startDate={new Date(2026, 10, 10)}
        />
      </SafeAreaProvider>
    )
    const save = screen.getByTestId('react-native-paper-dates-save')
    expect(save).toBeDisabled()
    await pressTestId(screen, 'react-native-paper-dates-save')
    expect(onConfirm).not.toHaveBeenCalled()
  } finally {
    await act(async () => {
      Dimensions.set({ screen: saved, window: saved })
    })
  }
})

it('disables save when a typed range starts and ends on the same day', async () => {
  const onConfirm = jest.fn()
  const screen = await render(
    <DatePickerInputForm
      endDate={new Date(2026, 10, 10, 23, 59, 59)}
      locale="en"
      mode="range"
      onChange={() => null}
      onConfirm={onConfirm}
      onDismiss={() => null}
      onRequestCalendar={() => null}
      startDate={new Date(2026, 10, 10)}
    />
  )
  expect(
    screen.getByTestId('react-native-paper-dates-modal-input-confirm')
  ).toBeDisabled()
  await pressTestId(screen, 'react-native-paper-dates-modal-input-confirm')
  expect(onConfirm).not.toHaveBeenCalled()
})

it('shows the shared date input form for a single date and a range', async () => {
  const saved = Dimensions.get('window')
  await act(async () => {
    Dimensions.set({
      screen: { fontScale: 1, height: 844, scale: 2, width: 390 },
      window: { fontScale: 1, height: 844, scale: 2, width: 390 },
    })
  })
  const metrics = {
    frame: { height: 844, width: 390, x: 0, y: 0 },
    insets: { bottom: 0, left: 0, right: 0, top: 0 },
  }
  try {
    const single = await render(
      <SafeAreaProvider initialMetrics={metrics}>
        <DatePickerModalContent
          displayMode="input"
          locale="en"
          mode="single"
          onConfirm={() => null}
          onDismiss={() => null}
        />
      </SafeAreaProvider>
    )
    expect(single.getByText('Enter date')).toBeTruthy()
    expect(single.getByText('Date')).toBeTruthy()
    expect(single.getByTestId('react-native-paper-dates-close')).toBeTruthy()
    expect(single.getByTestId('react-native-paper-dates-save')).toBeTruthy()
    await pressTestId(single, 'react-native-paper-dates-modal-input-calendar')
    expect(
      single.getByTestId('react-native-paper-dates-toggle-edit')
    ).toBeTruthy()

    const range = await render(
      <SafeAreaProvider initialMetrics={metrics}>
        <DatePickerModalContent
          displayMode="input"
          endDate={undefined}
          locale="en"
          mode="range"
          onConfirm={() => null}
          onDismiss={() => null}
          startDate={undefined}
        />
      </SafeAreaProvider>
    )
    expect(range.getByText('Enter dates')).toBeTruthy()
    expect(range.getByText('End date')).toBeTruthy()
    expect(range.getByTestId('react-native-paper-dates-save')).toBeTruthy()
  } finally {
    await act(async () => {
      Dimensions.set({ screen: saved, window: saved })
    })
  }
})
