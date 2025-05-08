import { render } from '@testing-library/react-native'
import CalendarHeader from '../../Date/CalendarHeader'

it('renders CalendarHeader', () => {
  const { toJSON } = render(
    <CalendarHeader
      locale="en"
      onPrev={() => null}
      onNext={() => null}
      scrollMode="vertical"
      startWeekOnMonday={false}
    />
  )
  expect(toJSON()).toMatchSnapshot()
})
