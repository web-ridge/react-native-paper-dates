import { render } from '@testing-library/react-native'
import Calendar from '../../Date/Calendar'
import { getHorizontalMonthOffset } from '../../Date/Month'
import { getInitialIndex } from '../../Date/dateUtils'

it('renders Calendar', async () => {
  const fixedDate = new Date('2025-01-15')
  const { toJSON } = await render(
    <Calendar
      date={fixedDate}
      locale="en"
      mode="single"
      onChange={() => null}
    />
  )
  expect(toJSON()).toMatchSnapshot()
})

it('draws the month on the first render when initialLayout is given', async () => {
  const fixedDate = new Date('2025-01-15')
  const { queryByText, rerender } = await render(
    <Calendar
      date={fixedDate}
      locale="en"
      mode="single"
      onChange={() => null}
    />
  )
  // Without a size it waits for its own layout.
  expect(queryByText('January 2025')).toBeNull()

  await rerender(
    <Calendar
      date={fixedDate}
      initialLayout={{ width: 320, height: 400 }}
      locale="en"
      mode="single"
      onChange={() => null}
    />
  )
  expect(queryByText('January 2025')).toBeTruthy()
})

it('starts the month pager on the current month instead of at 0', async () => {
  const fixedDate = new Date('2025-01-15')
  const { root } = await render(
    <Calendar
      date={fixedDate}
      initialLayout={{ width: 320, height: 400 }}
      locale="en"
      mode="single"
      onChange={() => null}
    />
  )
  const pager = root!.queryAll((node) => node.type === 'RCTScrollView')[0]
  expect(pager.props.contentOffset).toEqual({
    x: getHorizontalMonthOffset(getInitialIndex(fixedDate), 320),
    y: 0,
  })
})
