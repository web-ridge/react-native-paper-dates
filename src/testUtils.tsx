import {
  act,
  render as rtlRender,
  RenderOptions,
  RenderResult,
} from '@testing-library/react-native'
import { ReactElement } from 'react'
import { Platform } from 'react-native'
import { PaperProvider } from 'react-native-paper'
export * from '@testing-library/react-native'

type Fiber = {
  child: Fiber | null
  memoizedProps?: Record<string, unknown>
  pendingProps?: Record<string, unknown>
  return: Fiber | null
  sibling: Fiber | null
}

export type PressableInstance = {
  props: Record<string, unknown>
  unstable_fiber?: Fiber | null
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

export function dayFocused(
  screen: {
    getAllByTestId: (testId: string) => Array<{
      children?: Array<object | string>
      props?: { pointerEvents?: string }
    }>
  },
  testId: string
) {
  const focused = (node: {
    children?: Array<object | string>
    props?: { pointerEvents?: string }
  }): boolean => {
    if (node.props?.pointerEvents === 'none') return true
    return (node.children ?? []).some(
      (child) => typeof child !== 'string' && focused(child)
    )
  }
  return screen.getAllByTestId(testId).some((day) => focused(day))
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

export function iconName(node: PressableInstance) {
  let fiber = node.unstable_fiber ?? null
  for (let depth = 0; fiber && depth < 16; depth += 1, fiber = fiber.return) {
    const props = fiber.memoizedProps ?? fiber.pendingProps
    if (typeof props?.icon === 'string') return props.icon
    if (typeof props?.source === 'string') return props.source
  }
  return undefined
}

export function installDateKeyListener() {
  const previousPlatform = Platform.OS
  Platform.OS = 'web'
  const listeners = new Map<string, (event: KeyboardEvent) => void>()
  const host = globalThis as { window?: Window & typeof globalThis }
  const previousWindow = host.window
  host.window = {
    addEventListener(type: string, listener: EventListener) {
      listeners.set(type, listener as (event: KeyboardEvent) => void)
    },
    removeEventListener(type: string) {
      listeners.delete(type)
    },
  } as unknown as Window & typeof globalThis

  return {
    async press(key: string, shiftKey = false) {
      const handler = listeners.get('keydown')
      if (!handler) {
        throw new Error('missing keydown listener')
      }
      await act(() => {
        handler({
          key,
          preventDefault() {},
          shiftKey,
          target: null,
        } as unknown as KeyboardEvent)
      })
    },
    restore() {
      Platform.OS = previousPlatform
      host.window = previousWindow
    },
  }
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

export async function pressLabel(
  screen: { container: { queryAll: Function } },
  label: string
) {
  const node = screen.container.queryAll(
    (item: { props: { accessibilityLabel?: string } }) =>
      item.props.accessibilityLabel === label
  )[0]
  if (!node) {
    throw new Error(`missing ${label}`)
  }
  await pressNode(node)
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

export async function render(
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
