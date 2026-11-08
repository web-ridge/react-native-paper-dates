import { act } from 'react'
import { StyleSheet, Text } from 'react-native'
import { render } from '@testing-library/react-native'
import AutoSizer from '../../Date/AutoSizer'

it('renders AutoSizer', async () => {
  const { toJSON } = await render(<AutoSizer>{() => <></>}</AutoSizer>)
  expect(toJSON()).toMatchSnapshot()
})

it('follows a later layout instead of keeping the first measured size', async () => {
  const { getByText, root } = await render(
    <AutoSizer>
      {({ width, height }) => (
        <Text>
          {width}x{height}
        </Text>
      )}
    </AutoSizer>
  )

  const view = root!.queryAll((node) => node.type === 'View', {
    includeSelf: true,
  })[0]
  const layout = (width: number, height: number) => {
    view.props.onLayout({
      nativeEvent: { layout: { x: 0, y: 0, width, height } },
    })
  }

  await act(() => {
    layout(320, 640)
  })

  expect(getByText('320x640')).toBeTruthy()
  const style = StyleSheet.flatten(view.props.style)
  expect(style.width).toBeUndefined()
  expect(style.height).toBeUndefined()

  await act(() => {
    layout(640, 320)
  })

  expect(getByText('640x320')).toBeTruthy()
})

it('renders with initialLayout before the first layout, then follows the measured size', async () => {
  const { getByText, root } = await render(
    <AutoSizer initialLayout={{ width: 300, height: 400 }}>
      {({ width, height }) => (
        <Text>
          {width}x{height}
        </Text>
      )}
    </AutoSizer>
  )

  expect(getByText('300x400')).toBeTruthy()

  const view = root!.queryAll((node) => node.type === 'View', {
    includeSelf: true,
  })[0]
  await act(() => {
    view.props.onLayout({
      nativeEvent: { layout: { x: 0, y: 0, width: 320, height: 640 } },
    })
  })

  expect(getByText('320x640')).toBeTruthy()
})
