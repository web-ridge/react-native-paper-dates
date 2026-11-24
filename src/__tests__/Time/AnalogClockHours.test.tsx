import { render } from '@testing-library/react-native'

import AnalogClockHours from '../../Time/AnalogClockHours'
import en from '../../translations/en'
import { registerTranslation } from '../../translations/utils'

registerTranslation('en', en)

it('renders AnalogClockHours', async () => {
  const { toJSON } = await render(<AnalogClockHours hours={12} is24Hour />)

  expect(toJSON()).toMatchSnapshot()
})

it('says Hour 23 without a total on the 24-hour dial', async () => {
  const screen = await render(<AnalogClockHours hours={23} is24Hour />)
  expect(screen.getByLabelText('Hour 23')).toBeTruthy()
  expect(screen.queryByLabelText('Hour 23 of 24')).toBeNull()
  expect(screen.getByLabelText('Hour 0')).toBeTruthy()
})

it('keeps Hour of 12 wording on the 12-hour dial', async () => {
  const screen = await render(<AnalogClockHours hours={11} is24Hour={false} />)
  expect(screen.getByLabelText('Hour 11 of 12')).toBeTruthy()
})
