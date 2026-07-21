import { render } from '@testing-library/react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import DatePickerModalHeaderBackground from '../../Date/DatePickerModalHeaderBackground'

it('renders DatePickerModalHeaderBackground', async () => {
  const { toJSON } = await render(
    <SafeAreaProvider>
      <DatePickerModalHeaderBackground>
        <></>
      </DatePickerModalHeaderBackground>
    </SafeAreaProvider>
  )
  expect(toJSON()).toMatchSnapshot()
})
