import { ReactElement } from 'react'
import {
  act,
  render as rtlRender,
  RenderOptions,
  RenderResult,
} from '@testing-library/react-native'
import { PaperProvider } from 'react-native-paper'

async function render(
  ui: ReactElement,
  options?: RenderOptions
): Promise<RenderResult> {
  const { wrapper: Wrapper, ...rest } = options || {}

  return rtlRender(ui, {
    ...rest,
    wrapper: ({ children }) => (
      <PaperProvider>
        {Wrapper ? <Wrapper>{children}</Wrapper> : children}
      </PaperProvider>
    ),
  })
}

type Fiber = {
  child: Fiber | null
  sibling: Fiber | null
  return: Fiber | null
  memoizedProps?: { onPress?: unknown }
  pendingProps?: { onPress?: unknown }
}

export type PressableInstance = {
  props: Record<string, unknown>
  unstable_fiber?: Fiber | null
}

export function findPress(node: PressableInstance): (() => void) | undefined {
  let fiber = node.unstable_fiber ?? null
  for (let depth = 0; fiber && depth < 12; depth += 1, fiber = fiber.return) {
    const props = fiber.memoizedProps ?? fiber.pendingProps
    if (typeof props?.onPress === 'function') {
      return props.onPress as () => void
    }
  }
  return undefined
}

export async function pressNode(node: PressableInstance) {
  const onPress = findPress(node)
  if (!onPress) {
    throw new Error(
      `no onPress for ${String(node.props.testID ?? node.props.accessibilityLabel)}`
    )
  }
  await act(async () => {
    onPress()
  })
}

export function byTestId(
  screen: { container: { queryAll: Function } },
  id: string | RegExp
) {
  return screen.container.queryAll((node: PressableInstance) => {
    const testID = node.props.testID
    if (typeof testID !== 'string') return false
    return typeof id === 'string' ? testID === id : id.test(testID)
  }) as PressableInstance[]
}

export async function pressTestId(
  screen: { container: { queryAll: Function } },
  id: string
) {
  const node = byTestId(screen, id)[0]
  if (!node) {
    throw new Error(`missing ${id}`)
  }
  await pressNode(node)
}

export async function pressDays(
  screen: { container: { queryAll: Function } },
  count = 2
) {
  let pressed = 0
  for (const day of byTestId(screen, /react-native-paper-dates-day-/)) {
    if (pressed >= count) break
    if (!findPress(day)) continue
    await pressNode(day)
    pressed += 1
  }
  if (pressed === 0) {
    throw new Error('no pressable day')
  }
}

export function walkFibers(
  fiber: Fiber | null | undefined,
  visit: (fiber: Fiber) => void
) {
  let current = fiber
  while (current) {
    visit(current)
    walkFibers(current.child, visit)
    current = current.sibling
  }
}

export * from '@testing-library/react-native'
export { render }
