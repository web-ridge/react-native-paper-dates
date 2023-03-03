import * as React from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import renderer from 'react-test-renderer'
import DatePickerModalContentHeader from '../../Date/DatePickerModalContentHeader'
import DatePickerModalHeader from '../../Date/DatePickerModalHeader'
import DatePickerModalHeaderBackground from '../../Date/DatePickerModalHeaderBackground'

it('renders DatePickerModalHeaderBackground', () => {
  const tree = renderer
    .create(
      <SafeAreaProvider>
        <DatePickerModalHeaderBackground>
          <DatePickerModalHeader
            locale="en"
            onSave={() => null}
            onDismiss={() => null}
          />
          <DatePickerModalContentHeader
            state={{
              startDate: new Date('01/01/2022'),
              endDate: new Date('01/01/2022'),
              date: new Date('01/01/2022'),
              dates: [new Date('01/01/2022')],
            }}
            mode={'range'}
            collapsed
            onToggle={() => null}
            locale={'en'}
          />
        </DatePickerModalHeaderBackground>
      </SafeAreaProvider>
    )
    .toJSON()

  expect(tree).toMatchSnapshot()
})
