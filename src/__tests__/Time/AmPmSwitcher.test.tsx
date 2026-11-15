import { render } from '@testing-library/react-native'

import AmPmSwitcher from '../../Time/AmPmSwitcher'
import { inputTypes } from '../../Time/timeUtils'
import en from '../../translations/en'
import { registerTranslation } from '../../translations/utils'

registerTranslation('en', en)

it('renders AmPmSwitcher', async () => {
  const { toJSON } = await render(
    <AmPmSwitcher
      hours={12}
      inputType={inputTypes.keyboard}
      onChange={() => null}
    />
  )

  expect(toJSON()).toMatchSnapshot()
})
