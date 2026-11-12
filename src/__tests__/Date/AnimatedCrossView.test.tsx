import { render } from '@testing-library/react-native'
import AnimatedCrossView from '../../Date/AnimatedCrossView'

it('renders AnimatedCrossView', async () => {
  const { toJSON } = await render(
    <AnimatedCrossView
      calendar={<></>}
      calendarEdit={<></>}
      collapsed={false}
    />
  )
  expect(toJSON()).toMatchSnapshot()
})
