import { render } from '@testing-library/react-native'
import DayRange from '../../Date/DayRange'

it('renders DayRange', () => {
  const { toJSON } = render(
    <DayRange inRange leftCrop rightCrop selectColor="blue" />
  )
  expect(toJSON()).toMatchSnapshot()
})
