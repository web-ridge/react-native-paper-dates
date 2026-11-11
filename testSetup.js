import { jest } from '@jest/globals'
import React from 'react'

require('react-native-reanimated').setUpTests()

jest.useFakeTimers()

// Test renderer host refs are plain objects. Scroll views call these on mount.
for (const name of ['scrollTo', 'scrollToOffset', 'scrollToIndex']) {
  if (typeof Object.prototype[name] !== 'function') {
    Object.defineProperty(Object.prototype, name, {
      configurable: true,
      writable: true,
      value() {},
    })
  }
}

// Paper 6 themes use `shapes` and no longer include `roundness`. Keep a
// numeric fallback so any leftover read does not become NaN in styles.
const { DarkTheme, LightTheme, LocaleProvider } = require('react-native-paper')
LightTheme.roundness = 4
DarkTheme.roundness = 4

// Text requires a locale context. A provider adds no host node, so snapshots
// stay the component tree.
const renderModule = require('@testing-library/react-native/dist/render')
const originalRender = renderModule.render
renderModule.render = (ui, options) => {
  const { wrapper: Wrapper, ...rest } = options || {}
  return originalRender(ui, {
    ...rest,
    wrapper: ({ children }) => (
      <LocaleProvider direction="ltr">
        {Wrapper ? <Wrapper>{children}</Wrapper> : children}
      </LocaleProvider>
    ),
  })
}
