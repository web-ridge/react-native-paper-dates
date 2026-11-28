import { render } from '@testing-library/react-native'
import { Text } from 'react-native'
import { PaperProvider } from 'react-native-paper'

import { useModalAnimation } from '../shared/motion'

function Probe({
  animationType,
  fallback,
}: {
  animationType?: 'slide' | 'fade' | 'none'
  fallback: 'slide' | 'none'
}) {
  return (
    <Text testID="animation">{useModalAnimation(animationType, fallback)}</Text>
  )
}

async function animationFor(
  reduceMotion: 'off' | 'on',
  fallback: 'slide' | 'none',
  animationType?: 'slide' | 'fade' | 'none'
) {
  const screen = await render(
    <PaperProvider reduceMotion={reduceMotion}>
      <Probe animationType={animationType} fallback={fallback} />
    </PaperProvider>
  )
  return screen.getByTestId('animation').props.children as string
}

it('fades the modals instead of sliding under Reduce Motion', async () => {
  expect(await animationFor('off', 'slide')).toBe('slide')
  expect(await animationFor('on', 'slide')).toBe('fade')
  expect(await animationFor('on', 'none')).toBe('none')
  expect(await animationFor('on', 'slide', 'slide')).toBe('slide')
})
