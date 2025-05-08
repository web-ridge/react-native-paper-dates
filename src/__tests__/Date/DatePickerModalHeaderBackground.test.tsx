import { render } from '@testing-library/react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import DatePickerModalHeaderBackground from '../../Date/DatePickerModalHeaderBackground'

it('renders DatePickerModalHeaderBackground', () => {
  const { toJSON } = render(
    <SafeAreaProvider>
      <DatePickerModalHeaderBackground>
        <></>
      </DatePickerModalHeaderBackground>
    </SafeAreaProvider>
  )
  expect(toJSON()).toMatchSnapshot()
})
