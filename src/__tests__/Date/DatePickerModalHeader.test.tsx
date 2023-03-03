import * as React from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import renderer from 'react-test-renderer'
import DatePickerModalHeader from '../../Date/DatePickerModalHeader'

it('renders DatePickerModalHeader', () => {
  const tree = renderer
    .create(
      <SafeAreaProvider>
        <DatePickerModalHeader
          locale={'en'}
          onSave={() => null}
          onDismiss={() => null}
        />
      </SafeAreaProvider>
    )
    .toJSON()

  expect(tree).toMatchSnapshot()
})
