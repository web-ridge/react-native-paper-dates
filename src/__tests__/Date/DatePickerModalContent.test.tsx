import { act, fireEvent, render } from '@testing-library/react-native'
import { Dimensions, StyleSheet } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import DatePickerInputForm from '../../Date/DatePickerInputForm'
import DatePickerModalContent from '../../Date/DatePickerModalContent'
import { pressTestId } from '../../testUtils'

it('sizes the calendar header to 120dp, or 128dp for a range', async () => {
  const metrics = {
    frame: { height: 1366, width: 1024, x: 0, y: 0 },
    insets: { bottom: 0, left: 0, right: 0, top: 0 },
  }
  const single = await render(
    <SafeAreaProvider initialMetrics={metrics}>
      <DatePickerModalContent
        date={new Date(2026, 10, 16)}
        locale="en"
        mode="single"
        onConfirm={() => null}
        onDismiss={() => null}
      />
    </SafeAreaProvider>
  )
  expect(single.getByText('Select date').parent?.parent).toHaveStyle({
    minHeight: 120,
  })

  const range = await render(
    <SafeAreaProvider initialMetrics={metrics}>
      <DatePickerModalContent
        endDate={undefined}
        locale="en"
        mode="range"
        onConfirm={() => null}
        onDismiss={() => null}
        startDate={new Date(2026, 10, 16)}
      />
    </SafeAreaProvider>
  )
  expect(range.getByText('Select period').parent?.parent).toHaveStyle({
    minHeight: 128,
  })
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
    expect(single.getByLabelText('Date, mm/dd/yyyy')).toBeTruthy()
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
    expect(range.getByText('Start date – End date')).toBeTruthy()
    expect(range.getByLabelText('Start date, mm/dd/yyyy')).toBeTruthy()
    expect(range.getByLabelText('End date, mm/dd/yyyy')).toBeTruthy()
    expect(range.getByTestId('react-native-paper-dates-save')).toBeTruthy()
  } finally {
    await act(async () => {
      Dimensions.set({ screen: saved, window: saved })
    })
  }
})

it('lets the year selector fill the phone sheet', async () => {
  const saved = Dimensions.get('window')
  const metrics = {
    frame: { height: 844, width: 390, x: 0, y: 0 },
    insets: { bottom: 34, left: 0, right: 0, top: 47 },
  }
  const renderAt = (width: number, height: number) =>
    render(
      <SafeAreaProvider
        initialMetrics={{
          ...metrics,
          frame: { height, width, x: 0, y: 0 },
        }}
      >
        <DatePickerModalContent
          date={new Date(2026, 10, 16)}
          initialLayout={{ height: 360, width }}
          locale="en"
          mode="single"
          onConfirm={() => null}
          onDismiss={() => null}
        />
      </SafeAreaProvider>
    )

  try {
    await act(async () => {
      Dimensions.set({
        screen: { fontScale: 1, height: 844, scale: 2, width: 390 },
        window: { fontScale: 1, height: 844, scale: 2, width: 390 },
      })
    })
    const phone = await renderAt(390, 844)
    await fireEvent.press(phone.getByLabelText('November 2026'))
    const picker = phone.getByTestId('react-native-paper-dates-year-picker')
    const pickerStyle = StyleSheet.flatten(picker.props.style)
    expect(pickerStyle?.position).toBe('absolute')
    expect(pickerStyle?.bottom).toBe(0)
    expect(StyleSheet.flatten(picker.parent?.props.style)?.flex).toBe(1)

    await act(async () => {
      Dimensions.set({
        screen: { fontScale: 1, height: 1366, scale: 2, width: 1024 },
        window: { fontScale: 1, height: 1366, scale: 2, width: 1024 },
      })
    })
    const tablet = await renderAt(1024, 1366)
    await fireEvent.press(tablet.getByLabelText('November 2026'))
    const tabletPicker = tablet.getByTestId(
      'react-native-paper-dates-year-picker'
    )
    expect(StyleSheet.flatten(tabletPicker.parent?.props.style)?.flexGrow).toBe(
      0
    )
  } finally {
    await act(async () => {
      Dimensions.set({ screen: saved, window: saved })
    })
  }
})

it('warns when cancel and confirm labels fall back for an unregistered locale', async () => {
  const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined)
  try {
    const screen = await render(
      <DatePickerInputForm
        locale="xx"
        mode="single"
        onChange={() => null}
        onConfirm={() => null}
        onDismiss={() => null}
        onRequestCalendar={() => null}
      />
    )
    expect(screen.getByText('Cancel')).toBeTruthy()
    expect(screen.getByText('OK')).toBeTruthy()
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining(
        'The locale xx is not registered, see https://web-ridge.github.io/react-native-paper-dates/guide/localization, key: cancel'
      )
    )
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining(
        'The locale xx is not registered, see https://web-ridge.github.io/react-native-paper-dates/guide/localization, key: confirm'
      )
    )
  } finally {
    warn.mockRestore()
  }
})
