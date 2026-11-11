import { act, render } from '@testing-library/react-native'
import TextInputWithMask from '../TextInputMask'

const noop = () => null

describe('TextInputMask', () => {
  it('should set maxLength based on mask length for standard format', async () => {
    const { getByTestId } = await render(
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

  it('should set maxLength based on mask length for Czech locale format', async () => {
    const { getByTestId } = await render(
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

  it('should set maxLength based on mask length for Hungarian locale format', async () => {
    const { getByTestId } = await render(
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

  it('should set maxLength based on mask length for German locale format', async () => {
    const { getByTestId } = await render(
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

  it('formats typed text, backspaces, and forwards change events', async () => {
    const onChangeText = jest.fn()
    const onChange = jest.fn()
    const screen = await render(
      <TextInputWithMask
        testID="date-input"
        value="01/02/2020"
        mask="MM/DD/YYYY"
        inputButton={null}
        onChangeText={onChangeText}
        onChange={onChange}
      />
    )
    const input = screen.getByTestId('date-input')
    await screen.rerender(
      <TextInputWithMask
        testID="date-input"
        value=""
        mask="MM/DD/YYYY"
        inputButton={null}
        onChangeText={onChangeText}
        onChange={onChange}
      />
    )
    input.props.onChangeText('1')
    input.props.onChangeText('1/')
    input.props.onChangeText('01/02/2020')
    input.props.onChangeText('01/02/202')
    input.props.onChange({ nativeEvent: { text: '01/02/2020' } })
    expect(onChangeText).toHaveBeenCalledWith('01/02/2020')
    expect(onChange).toHaveBeenCalled()

    const dotted = await render(
      <TextInputWithMask
        testID="dotted"
        value=""
        mask="DD.MM.YYYY"
        inputButton={null}
      />
    )
    dotted.getByTestId('dotted').props.onChangeText('01012020')
    dotted.getByTestId('dotted').props.onChange({ nativeEvent: { text: '' } })

    const plain = await render(
      <TextInputWithMask
        testID="plain"
        value=""
        mask="MMDDYYYY"
        inputButton={null}
        onChangeText={onChangeText}
      />
    )
    await act(() => {
      plain.getByTestId('plain').props.onChangeText('01012020')
    })
    await act(() => {
      plain.getByTestId('plain').props.onChangeText('0101')
    })

    for (const mask of ['DD-MM-YYYY', 'YYYY年MM年DD', 'DD MM YYYY']) {
      const masked = await render(
        <TextInputWithMask
          testID={mask}
          value=""
          mask={mask}
          inputButton={null}
          onChangeText={onChangeText}
        />
      )
      masked.getByTestId(mask).props.onChangeText('1')
      masked.getByTestId(mask).props.onChangeText('01012020extra')
    }
  })
})
