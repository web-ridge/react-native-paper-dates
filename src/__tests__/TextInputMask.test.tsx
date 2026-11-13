import { act, render } from '@testing-library/react-native'
import TextInputWithMask from '../TextInputMask'

const noop = () => null

describe('TextInputMask', () => {
  it('should set maxLength based on mask length for standard format', async () => {
    const { getByTestId } = await render(
      <TextInputWithMask
        inputButton={null}
        mask="MM/DD/YYYY"
        onChangeText={noop}
        testID="date-input"
        value=""
      />
    )
    const input = getByTestId('date-input')
    expect(input.props.maxLength).toBe(10)
  })

  it('should set maxLength based on mask length for Czech locale format', async () => {
    const { getByTestId } = await render(
      <TextInputWithMask
        inputButton={null}
        mask="DD. MM. YYYY"
        onChangeText={noop}
        testID="date-input"
        value=""
      />
    )
    const input = getByTestId('date-input')
    expect(input.props.maxLength).toBe(12)
  })

  it('should set maxLength based on mask length for Hungarian locale format', async () => {
    const { getByTestId } = await render(
      <TextInputWithMask
        inputButton={null}
        mask="YYYY. MM. DD."
        onChangeText={noop}
        testID="date-input"
        value=""
      />
    )
    const input = getByTestId('date-input')
    expect(input.props.maxLength).toBe(13)
  })

  it('should set maxLength based on mask length for German locale format', async () => {
    const { getByTestId } = await render(
      <TextInputWithMask
        inputButton={null}
        mask="DD.MM.YYYY"
        onChangeText={noop}
        testID="date-input"
        value=""
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
        inputButton={null}
        mask="MM/DD/YYYY"
        onChange={onChange}
        onChangeText={onChangeText}
        testID="date-input"
        value="01/02/2020"
      />
    )
    const input = screen.getByTestId('date-input')
    await screen.rerender(
      <TextInputWithMask
        inputButton={null}
        mask="MM/DD/YYYY"
        onChange={onChange}
        onChangeText={onChangeText}
        testID="date-input"
        value=""
      />
    )
    await act(() => {
      input.props.onChangeText('1')
      input.props.onChangeText('1/')
      input.props.onChangeText('01/02/2020')
      input.props.onChangeText('01/02/202')
      input.props.onChange({ nativeEvent: { text: '01/02/2020' } })
    })
    expect(onChangeText).toHaveBeenCalledWith('01/02/2020')
    expect(onChange).toHaveBeenCalled()

    const dotted = await render(
      <TextInputWithMask
        inputButton={null}
        mask="DD.MM.YYYY"
        testID="dotted"
        value=""
      />
    )
    await act(() => {
      dotted.getByTestId('dotted').props.onChangeText('01012020')
      dotted.getByTestId('dotted').props.onChange({ nativeEvent: { text: '' } })
    })

    const plain = await render(
      <TextInputWithMask
        inputButton={null}
        mask="MMDDYYYY"
        onChangeText={onChangeText}
        testID="plain"
        value=""
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
          inputButton={null}
          mask={mask}
          onChangeText={onChangeText}
          testID={mask}
          value=""
        />
      )
      await act(() => {
        masked.getByTestId(mask).props.onChangeText('1')
        masked.getByTestId(mask).props.onChangeText('01012020extra')
      })
    }
  })
})
