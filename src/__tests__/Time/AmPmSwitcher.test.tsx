import { render } from '@testing-library/react-native'
import { inputTypes } from '../../Time/timeUtils'
import AmPmSwitcher from '../../Time/AmPmSwitcher'

it('renders AmPmSwitcher', () => {
  const { toJSON } = render(
    <AmPmSwitcher
      hours={12}
      onChange={() => null}
      inputType={inputTypes.keyboard}
    />
  )

  expect(toJSON()).toMatchSnapshot()
})
