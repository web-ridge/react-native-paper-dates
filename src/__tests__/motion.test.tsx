import { render } from '@testing-library/react-native'
import { Text } from 'react-native'
import { LightTheme, ThemeProvider } from 'react-native-paper'

import { useModalAnimation } from '../shared/motion'

function Probe({
  animationType,
  fallback,
}: {
  animationType?: 'slide' | 'fade' | 'none'
  fallback: 'slide' | 'none'
}) {
  return <Text>{useModalAnimation(animationType, fallback)}</Text>
}

async function animationFor(
  scale: number,
  fallback: 'slide' | 'none',
  animationType?: 'slide' | 'fade' | 'none'
) {
  const theme = { ...LightTheme, animation: { ...LightTheme.animation, scale } }
  const screen = await render(
    <ThemeProvider theme={theme}>
      <Probe animationType={animationType} fallback={fallback} />
    </ThemeProvider>
  )
  return screen.root?.props.children as string
}

it('fades the modals instead of sliding under Reduce Motion', async () => {
  expect(await animationFor(1, 'slide')).toBe('slide')
  expect(await animationFor(0, 'slide')).toBe('fade')
  expect(await animationFor(0, 'none')).toBe('none')
  // An explicit animationType wins.
  expect(await animationFor(0, 'slide', 'slide')).toBe('slide')
})
