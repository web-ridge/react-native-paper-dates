import { render } from '@testing-library/react-native'
import TextInputWithMask from '../TextInputMask'

const noop = () => null

describe('TextInputMask', () => {
  it('should set maxLength based on mask length for standard format', () => {
    const { getByTestId } = render(
      <TextInputWithMask
        testID="date-input"
        value=""
        mask="MM/DD/YYYY"
        inputButton={null}
        onChangeText={noop}
      />
    )
    const input = getByTestId('date-input')
    expect(input.props.maxLength).toBe(10)
  })

  it('should set maxLength based on mask length for Czech locale format', () => {
    const { getByTestId } = render(
      <TextInputWithMask
        testID="date-input"
        value=""
        mask="DD. MM. YYYY"
        inputButton={null}
        onChangeText={noop}
      />
    )
    const input = getByTestId('date-input')
    expect(input.props.maxLength).toBe(12)
  })

  it('should set maxLength based on mask length for Hungarian locale format', () => {
    const { getByTestId } = render(
      <TextInputWithMask
        testID="date-input"
        value=""
        mask="YYYY. MM. DD."
        inputButton={null}
        onChangeText={noop}
      />
    )
    const input = getByTestId('date-input')
    expect(input.props.maxLength).toBe(13)
  })

  it('should set maxLength based on mask length for German locale format', () => {
    const { getByTestId } = render(
      <TextInputWithMask
        testID="date-input"
        value=""
        mask="DD.MM.YYYY"
        inputButton={null}
        onChangeText={noop}
      />
    )
    const input = getByTestId('date-input')
    expect(input.props.maxLength).toBe(10)
  })
})
