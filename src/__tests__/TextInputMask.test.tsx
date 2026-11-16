import { act, render } from '@testing-library/react-native'

import TextInputWithMask from '../TextInputMask'

const noop = () => null

describe('TextInputMask', () => {
  it('sets maxLength from the mask', async () => {
    for (const [mask, length] of [
      ['MM/DD/YYYY', 10],
      ['DD. MM. YYYY', 12],
      ['YYYY. MM. DD.', 13],
      ['DD.MM.YYYY', 10],
    ] as const) {
      const { getByTestId } = await render(
        <TextInputWithMask
          inputButton={null}
          mask={mask}
          onChangeText={noop}
          testID="date-input"
          value=""
        />
      )
      expect(getByTestId('date-input').props.maxLength).toBe(length)
    }
  })

  it('formats typed text, backspaces, and forwards change events', async () => {
    const onChange = jest.fn()
    const onChangeText = jest.fn()
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
    })
    expect(onChangeText).not.toHaveBeenCalled()
    await act(() => {
      input.props.onBlur()
    })
    expect(onChangeText).toHaveBeenCalledWith('01/02/2020')
    await act(() => {
      input.props.onChangeText('01/02/202')
      input.props.onChange({ nativeEvent: { text: '01/02/2020' } })
    })
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

    const spaced = [
      ['DD. MM. YYYY', '15062024', '15. 06. 2024'],
      ['YYYY. MM. DD.', '20240615', '2024. 06. 15.'],
      ['DD\u200f/MM\u200f/YYYY', '15062024', '15\u200f/06\u200f/2024'],
    ] as const
    for (const [mask, typed, formatted] of spaced) {
      const onMaskedChange = jest.fn()
      const masked = await render(
        <TextInputWithMask
          inputButton={null}
          mask={mask}
          onChangeText={onMaskedChange}
          testID={mask}
          value=""
        />
      )
      await act(() => {
        masked.getByTestId(mask).props.onChangeText(typed)
      })
      expect(onMaskedChange).not.toHaveBeenCalled()
      await act(() => {
        masked.getByTestId(mask).props.onSubmitEditing()
      })
      expect(onMaskedChange).toHaveBeenCalledWith(formatted)
    }

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
