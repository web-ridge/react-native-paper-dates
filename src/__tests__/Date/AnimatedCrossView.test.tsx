import { render } from '@testing-library/react-native'
import AnimatedCrossView from '../../Date/AnimatedCrossView'

it('renders AnimatedCrossView', () => {
  const { toJSON } = render(
    <AnimatedCrossView
      collapsed={false}
      calendar={<></>}
      calendarEdit={<></>}
    />
  )
  expect(toJSON()).toMatchSnapshot()
})
