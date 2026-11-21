import { Platform } from 'react-native'

import { focusRingLayout } from '../../Time/FocusRing'
import { focusRingOffset, focusRingThickness } from '../../Time/timeUtils'

const originalOS = Platform.OS

afterEach(() => {
  Platform.OS = originalOS
})

it('keeps the focus ring concentric with the field on native and web', () => {
  const radius = 16
  const color = '#625b71'

  Platform.OS = 'ios'
  const native = focusRingLayout(radius, color)
  expect(native.borderRadius).toBe(
    radius + focusRingOffset + focusRingThickness
  )
  expect(native.borderWidth).toBe(focusRingThickness)
  expect(native.top).toBe(-(focusRingOffset + focusRingThickness))
  expect(native.borderColor).toBe(color)

  Platform.OS = 'android'
  const android = focusRingLayout(radius, color)
  expect(android.borderRadius).toBe(native.borderRadius)
  expect(android.borderWidth).toBe(focusRingThickness)

  Platform.OS = 'web'
  const web = focusRingLayout(radius, color)
  // Inner edge of the ring is one gap outside the field; the 3dp stroke is
  // the box-shadow spread, so the outer radius is still field + gap + stroke.
  expect(web.borderRadius).toBe(radius + focusRingOffset)
  expect(web.borderWidth).toBe(0)
  expect(web.top).toBe(-focusRingOffset)
  expect(web.boxShadow).toBe(`0 0 0 ${focusRingThickness}px ${color}`)
  expect((web.borderRadius as number) + focusRingThickness).toBe(
    radius + focusRingOffset + focusRingThickness
  )
})
