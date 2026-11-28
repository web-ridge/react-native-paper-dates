import { fireEvent, render } from '@testing-library/react-native'
import type { ComponentProps } from 'react'
import { Dimensions, StyleSheet } from 'react-native'

import TimeInputs from '../../Time/TimeInputs'
import {
  timeInputFieldHeight,
  timeSelectorHeight,
  timeSelectorWidth,
} from '../../Time/timeUtils'
import en from '../../translations/en'
import { registerTranslation } from '../../translations/utils'

registerTranslation('en', en)

type InputsProps = ComponentProps<typeof TimeInputs>

function fieldSize(node: {
  parent?: unknown
  props: { style?: Parameters<typeof StyleSheet.flatten>[0] }
}) {
  let current: typeof node | undefined = node
  while (current) {
    const style = StyleSheet.flatten(current.props.style)
    if (typeof style?.height === 'number' && typeof style?.width === 'number') {
      return { height: style.height, width: style.width }
    }
    current = (current.parent as typeof node | undefined) ?? undefined
  }
  throw new Error('expected a field size')
}

function renderInputs(props: Partial<InputsProps> = {}) {
  return render(
    <TimeInputs
      focused="hours"
      hours={12}
      inputType="keyboard"
      is24Hour
      locale="en"
      minutes={45}
      onChange={() => null}
      onFocusInput={() => null}
      {...props}
    />
  )
}

it.each(['keyboard', 'picker'] as const)(
  'has no Hour or Minute captions in %s mode',
  async (inputType) => {
    const screen = await renderInputs({ inputType })
    expect(
      screen.queryByText('Hour', { includeHiddenElements: true })
    ).toBeNull()
    expect(
      screen.queryByText('Minute', { includeHiddenElements: true })
    ).toBeNull()
    expect(screen.getByLabelText('Hour')).toBeTruthy()
    expect(screen.getByLabelText('Minute')).toBeTruthy()
  }
)

it('surfaces typed and consumer time errors', async () => {
  const typed = await renderInputs()
  const hour = typed.getByLabelText('Hour')
  await fireEvent(hour, 'focus')
  await fireEvent.changeText(hour, '99')
  expect(typed.getByText('Invalid time')).toBeTruthy()

  const fallback = await renderInputs({
    error: true,
    hours: 8,
    is24Hour: false,
    minutes: 0,
  })
  expect(fallback.getByText('Invalid time')).toBeTruthy()

  const consumer = await renderInputs({
    error: true,
    errorText: 'Outside hours',
    hours: 8,
    is24Hour: false,
    minutes: 0,
  })
  expect(consumer.getByText('Outside hours')).toBeTruthy()
  expect(consumer.getByLabelText('Hour')).toHaveProp('aria-invalid', true)
  expect(consumer.getByLabelText('Minute')).toHaveProp('aria-invalid', true)
  expect(consumer.getByRole('radio', { name: 'AM' })).toHaveProp(
    'aria-invalid',
    true
  )

  const both = await renderInputs({
    error: true,
    errorText: 'Outside hours',
  })
  const bothHour = both.getByLabelText('Hour')
  await fireEvent(bothHour, 'focus')
  await fireEvent.changeText(bothHour, '99')
  expect(both.getByText('Outside hours')).toBeTruthy()
  expect(both.queryByText('Invalid time')).toBeNull()
  expect(bothHour).toHaveProp('aria-invalid', true)
})

it('does not move the focused field when AM or PM is pressed', async () => {
  const onChange = jest.fn()
  const screen = await renderInputs({
    focused: 'minutes',
    hours: 9,
    is24Hour: false,
    onChange,
  })

  await fireEvent.press(screen.getByLabelText('PM'))

  expect(onChange).toHaveBeenCalledWith({ hours: 21, minutes: 45 })
  expect(onChange.mock.calls[0][0].focused).toBeUndefined()
})

it('lines up landscape AM and PM with the hour and minute fields', async () => {
  const saved = Dimensions.get('window')
  Dimensions.set({
    screen: { fontScale: 1, height: 400, scale: 1, width: 900 },
    window: { fontScale: 1, height: 400, scale: 1, width: 900 },
  })
  const screen = await render(
    <TimeInputs
      focused="hours"
      hours={6}
      inputType="picker"
      is24Hour={false}
      locale="en"
      minutes={40}
      onChange={() => null}
      onFocusInput={() => null}
    />
  )
  try {
    type FlatStyle = { gap?: number; width?: number }
    type StyledNode = {
      parent?: StyledNode | null
      props: {
        accessibilityRole?: string
        style?: Parameters<typeof StyleSheet.flatten>[0]
      }
    }
    const flatten = (node: StyledNode) =>
      StyleSheet.flatten(node.props.style) as FlatStyle
    const widthOf = (node: StyledNode) => {
      let current: StyledNode | undefined = node
      while (current) {
        const width = flatten(current).width
        if (typeof width === 'number') {
          return width
        }
        current = current.parent ?? undefined
      }
      throw new Error('expected a numeric width')
    }

    const colonWidth = flatten(screen.getByTestId('time-separator')).width
    const am = screen.getByRole('radio', { name: 'AM' })
    let groupNode: StyledNode | undefined = am
    while (groupNode && groupNode.props.accessibilityRole !== 'radiogroup') {
      groupNode = groupNode.parent ?? undefined
    }
    if (!groupNode) {
      throw new Error('expected a radiogroup')
    }
    const group = flatten(groupNode)
    const hourWidth = widthOf(screen.getByLabelText('Hour'))
    const minuteWidth = widthOf(screen.getByLabelText('Minute'))

    expect(flatten(am).width).toBe(hourWidth)
    expect(flatten(screen.getByRole('radio', { name: 'PM' })).width).toBe(
      minuteWidth
    )
    expect(group.gap).toBe(colonWidth)
    expect(group.width).toBe(hourWidth + (colonWidth ?? 0) + minuteWidth)
  } finally {
    screen.unmount()
    Dimensions.set({ screen: saved, window: saved })
  }
})

it('auto-focuses the hour field', async () => {
  const screen = await renderInputs({ autoFocus: true })
  expect(screen.getByLabelText('Hour')).toHaveProp('autoFocus', true)
  expect(screen.getByLabelText('Minute')).not.toHaveProp('autoFocus', true)
})

it('keeps keyboard and dial fields at the 100 by 120 token size', async () => {
  const keyboard = await renderInputs({
    hours: 6,
    is24Hour: true,
    minutes: 40,
  })
  expect(fieldSize(keyboard.getByLabelText('Hour'))).toEqual({
    height: timeInputFieldHeight,
    width: timeSelectorWidth,
  })
  expect(fieldSize(keyboard.getByLabelText('Minute'))).toEqual({
    height: timeInputFieldHeight,
    width: timeSelectorWidth,
  })

  const dial = await renderInputs({
    hours: 6,
    inputType: 'picker',
    is24Hour: false,
    minutes: 40,
  })
  expect(fieldSize(dial.getByLabelText('Hour'))).toEqual({
    height: timeSelectorHeight,
    width: timeSelectorWidth,
  })
})
