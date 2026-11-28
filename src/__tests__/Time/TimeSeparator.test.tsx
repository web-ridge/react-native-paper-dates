import { render } from '@testing-library/react-native'
import { StyleSheet } from 'react-native'

import TimeSeparator from '../../Time/TimeSeparator'
import { timeSeparatorDotSize, timeSeparatorWidth } from '../../Time/timeUtils'

it('renders two circular dots in the colon slot', async () => {
  const screen = await render(<TimeSeparator color="#1D1B20" height={80} />)
  const slot = screen.getByTestId('time-separator')
  const style = StyleSheet.flatten(slot.props.style)

  expect(slot).toHaveProp('accessible', false)
  expect(slot).toHaveProp('importantForAccessibility', 'no')
  expect(style.gap).toBe(timeSeparatorDotSize)
  expect(style.width).toBe(timeSeparatorWidth)

  const dots = slot.children.filter((child) => typeof child !== 'string')
  expect(dots).toHaveLength(2)
  for (const dot of dots) {
    const dotStyle = StyleSheet.flatten(dot.props.style)
    expect(dotStyle.backgroundColor).toBe('#1D1B20')
    expect(dotStyle.borderRadius).toBe(timeSeparatorDotSize / 2)
    expect(dotStyle.height).toBe(timeSeparatorDotSize)
    expect(dotStyle.width).toBe(timeSeparatorDotSize)
  }
})
