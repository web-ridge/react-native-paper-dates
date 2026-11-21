import { Profiler, type ProfilerOnRenderCallback } from 'react'
import { Platform } from 'react-native'
import { PaperProvider } from 'react-native-paper'
import { act, fireEvent, render } from '@testing-library/react-native'

import TimePicker from '../../Time/TimePicker'

const enabled =
  (globalThis as { process?: { env?: { BENCH?: string } } }).process?.env
    ?.BENCH === '1'

let reactMs = 0
const collectRender: ProfilerOnRenderCallback = (
  _id,
  _phase,
  actualDuration
) => {
  reactMs += actualDuration
}

function countTreeNodes(node: unknown): {
  animatedNodes: number
  text: number
  view: number
} {
  if (!node || typeof node !== 'object') {
    return { animatedNodes: 0, text: 0, view: 0 }
  }
  if (Array.isArray(node)) {
    return node.reduce(
      (acc, child) => {
        const next = countTreeNodes(child)
        return {
          animatedNodes: acc.animatedNodes + next.animatedNodes,
          text: acc.text + next.text,
          view: acc.view + next.view,
        }
      },
      { animatedNodes: 0, text: 0, view: 0 }
    )
  }
  const host = node as {
    children?: unknown[]
    props?: { jestAnimatedStyle?: unknown }
    type?: unknown
  }
  const ownAnimated = host.props?.jestAnimatedStyle ? 1 : 0
  const ownText = host.type === 'Text' ? 1 : 0
  const ownView = host.type === 'View' ? 1 : 0
  const children = countTreeNodes(host.children)
  return {
    animatedNodes: ownAnimated + children.animatedNodes,
    text: ownText + children.text,
    view: ownView + children.view,
  }
}

it('records scroll time picker toggle and mount cost', async () => {
  'use no memo'
  if (!enabled) return
  const originalOS = Platform.OS
  const results: Record<string, unknown> = {}

  for (const os of ['ios', 'android'] as const) {
    Platform.OS = os
    reactMs = 0

    const view = await render(
      <PaperProvider>
        <Profiler id={`scroll-${os}`} onRender={collectRender}>
          <TimePicker
            focused="hours"
            hours={9}
            inputType="scroll"
            locale="en"
            minutes={45}
            onChange={() => null}
            onFocusInput={() => null}
            use24HourClock={false}
          />
        </Profiler>
      </PaperProvider>
    )
    const firstPaintNodes = countTreeNodes(view.toJSON())
    const firstPaintMs = Number(reactMs.toFixed(3))

    await act(async () => {
      jest.advanceTimersByTime(32)
    })

    const mountNodes = countTreeNodes(view.toJSON())
    const mountMs = Number(reactMs.toFixed(3))

    reactMs = 0
    await fireEvent.press(view.getByLabelText('Toggle input picker'))
    const toKeyboardNodes = countTreeNodes(view.toJSON())
    const toKeyboardMs = Number(reactMs.toFixed(3))

    reactMs = 0
    await fireEvent.press(view.getByLabelText('Toggle scroll picker'))
    await act(async () => {
      jest.advanceTimersByTime(32)
    })
    const toScrollNodes = countTreeNodes(view.toJSON())
    const toScrollMs = Number(reactMs.toFixed(3))

    results[os] = {
      firstPaintAnimatedNodes: firstPaintNodes.animatedNodes,
      firstPaintMs,
      mountAnimatedNodes: mountNodes.animatedNodes,
      mountMs,
      mountTextNodes: mountNodes.text,
      mountViewNodes: mountNodes.view,
      toKeyboardAnimatedNodes: toKeyboardNodes.animatedNodes,
      toKeyboardMs,
      toScrollAnimatedNodes: toScrollNodes.animatedNodes,
      toScrollMs,
    }
    await view.unmount()
  }

  Platform.OS = originalOS
  console.log(`SCROLL_BENCH ${JSON.stringify(results)}`)
  expect(results.ios).toBeTruthy()
})
