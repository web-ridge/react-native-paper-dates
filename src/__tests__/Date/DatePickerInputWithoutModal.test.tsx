import { render } from '@testing-library/react-native'

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
