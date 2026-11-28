import { jest } from '@jest/globals'
import React from 'react'

require('react-native-reanimated').setUpTests()

jest.useFakeTimers()

// Test renderer host refs are plain objects. Scroll views call these on mount.
for (const name of ['scrollTo', 'scrollToOffset', 'scrollToIndex']) {
  if (typeof Object.prototype[name] !== 'function') {
    Object.defineProperty(Object.prototype, name, {
      configurable: true,
      value() {},
      writable: true,
    })
  }
}

const { registerTranslation } = require('./src/translations/utils')
registerTranslation('en', require('./src/translations/en').default)

// Text requires a locale context. A provider adds no host node, so snapshots
// stay the component tree.
const { LocaleProvider } = require('react-native-paper')
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
