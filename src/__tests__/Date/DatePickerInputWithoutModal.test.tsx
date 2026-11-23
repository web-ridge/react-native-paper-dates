import { fireEvent, render } from '@testing-library/react-native'

import DatePickerInputWithoutModal from '../../Date/DatePickerInputWithoutModal'

it('renders DatePickerInputWithoutModal', async () => {
  const fixedDate = new Date('2025-01-15')
  const { toJSON } = await render(
    <DatePickerInputWithoutModal
      inputMode="start"
      locale="en"
      onChange={() => null}
      value={fixedDate}
    />
  )
  expect(toJSON()).toMatchSnapshot()
})

it('leaves the label empty when no format suffix is requested', async () => {
  const screen = await render(
    <DatePickerInputWithoutModal
      inputMode="start"
      label="When"
      locale="en"
      onChange={() => null}
      value={undefined}
      withDateFormatInLabel={false}
    />
  )
  const field = screen.container.queryAll(
    (node: { props: { keyboardType?: string } }) =>
      node.props.keyboardType === 'default'
  )[0]
  const accessibleName = String(field?.props['aria-label'] ?? '')
  expect(accessibleName).toContain('When')
  expect(accessibleName).not.toContain('(MM/DD/YYYY)')
})

function inputDate(date: Date) {
  return new Intl.DateTimeFormat('en', {
    calendar: 'gregory',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

async function commitText(
  screen: Awaited<ReturnType<typeof render>>,
  text: string
) {
  await fireEvent(screen.getByTestId('date'), 'focus')
  await fireEvent.changeText(screen.getByTestId('date'), text)
  await fireEvent(screen.getByTestId('date'), 'blur')
}

it('rejects a typed day that is disabled', async () => {
  const onChange = jest.fn()
  const screen = await render(
    <DatePickerInputWithoutModal
      inputMode="start"
      locale="en"
      onChange={onChange}
      testID="date"
      validRange={{ disabledDates: [new Date(2026, 0, 15)] }}
      value={undefined}
    />
  )

  await commitText(screen, '1/15/2026')

  expect(
    screen.getByText('Day is not allowed', { includeHiddenElements: true })
  ).toBeTruthy()
  expect(onChange).not.toHaveBeenCalled()
})

it('keeps a mistyped date until it is corrected', async () => {
  const onChange = jest.fn()
  const screen = await render(
    <DatePickerInputWithoutModal
      inputMode="start"
      locale="en"
      onChange={onChange}
      testID="date"
      value={new Date(2026, 0, 15)}
    />
  )

  await commitText(screen, 'nope')
  expect(
    screen.getByText(/^Date format must be /, { includeHiddenElements: true })
  ).toBeTruthy()
  expect(screen.getByTestId('date').props.value).toBe('nope')
  expect(onChange).not.toHaveBeenCalled()

  await fireEvent(screen.getByTestId('date'), 'focus')
  expect(screen.getByTestId('date').props.value).toBe('nope')

  await fireEvent.changeText(screen.getByTestId('date'), '6/2/2026')
  await fireEvent(screen.getByTestId('date'), 'blur')
  expect(onChange).toHaveBeenCalledWith(new Date(2026, 5, 2))
  expect(screen.queryByText(/^Date format must be /)).toBeNull()
})

it('rejects a typed date outside the allowed range', async () => {
  const start = new Date(2026, 0, 10)
  const end = new Date(2026, 0, 20)
  const onChange = jest.fn()
  const both = await render(
    <DatePickerInputWithoutModal
      inputMode="start"
      locale="en"
      onChange={onChange}
      testID="date"
      validRange={{ endDate: end, startDate: start }}
      value={undefined}
    />
  )
  await commitText(both, '2/1/2026')
  expect(
    both.getByText(`Must be between ${inputDate(start)} - ${inputDate(end)}`, {
      includeHiddenElements: true,
    })
  ).toBeTruthy()

  const later = await render(
    <DatePickerInputWithoutModal
      inputMode="start"
      locale="en"
      onChange={onChange}
      testID="date"
      validRange={{ startDate: start }}
      value={undefined}
    />
  )
  await commitText(later, '1/2/2026')
  expect(
    later.getByText(`Must be later than ${inputDate(start)}`, {
      includeHiddenElements: true,
    })
  ).toBeTruthy()

  const earlier = await render(
    <DatePickerInputWithoutModal
      inputMode="start"
      locale="en"
      onChange={onChange}
      testID="date"
      validRange={{ endDate: end }}
      value={undefined}
    />
  )
  await commitText(earlier, '2/1/2026')
  expect(
    earlier.getByText(`Must be earlier than ${inputDate(end)}`, {
      includeHiddenElements: true,
    })
  ).toBeTruthy()
  expect(onChange).not.toHaveBeenCalled()
})

it('parses a Gregorian date typed for the Thai locale', async () => {
  const onChange = jest.fn()
  const screen = await render(
    <DatePickerInputWithoutModal
      inputMode="start"
      locale="th"
      onChange={onChange}
      testID="date"
      value={undefined}
    />
  )

  expect(screen.getByTestId('date').props.placeholder).toBe('DD/MM/YYYY')
  await commitText(screen, '05/01/2024')
  expect(onChange).toHaveBeenCalledWith(new Date(2024, 0, 5))
})

it('parses Arabic-Indic digits in a typed date', async () => {
  const onChange = jest.fn()
  const screen = await render(
    <DatePickerInputWithoutModal
      inputMode="start"
      locale="en"
      onChange={onChange}
      testID="date"
      value={undefined}
    />
  )

  await commitText(screen, '٠١/١٥/٢٠٢٤')
  expect(onChange).toHaveBeenCalledWith(new Date(2024, 0, 15))
})

it('clears a typed-date error when the saved date changes', async () => {
  const onValidationError = jest.fn()
  const screen = await render(
    <DatePickerInputWithoutModal
      inputMode="start"
      locale="en"
      onChange={() => null}
      onValidationError={onValidationError}
      testID="date"
      value={undefined}
    />
  )

  await commitText(screen, 'nope')
  expect(
    screen.getByText(/^Date format must be /, { includeHiddenElements: true })
  ).toBeTruthy()

  await screen.rerender(
    <DatePickerInputWithoutModal
      inputMode="start"
      locale="en"
      onChange={() => null}
      onValidationError={onValidationError}
      testID="date"
      value={new Date(2026, 5, 2)}
    />
  )

  expect(screen.queryByText(/^Date format must be /)).toBeNull()
  expect(onValidationError).toHaveBeenLastCalledWith(null)
})
