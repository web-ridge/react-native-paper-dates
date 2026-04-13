import { render } from '@testing-library/react-native'
import CalendarHeader from '../../Date/CalendarHeader'

it('renders CalendarHeader', () => {
  const { toJSON } = render(
    <CalendarHeader
      locale="en"
      onPrev={() => null}
      onNext={() => null}
      scrollMode="vertical"
      hideDays={false}
      startWeekOnMonday={false}
    />
  )
  expect(toJSON()).toMatchSnapshot()
})
