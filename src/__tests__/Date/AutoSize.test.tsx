import { render } from '@testing-library/react-native'
import AutoSizer from '../../Date/AutoSizer'

it('renders AutoSizer', () => {
  const { toJSON } = render(<AutoSizer>{() => <></>}</AutoSizer>)
  expect(toJSON()).toMatchSnapshot()
})
