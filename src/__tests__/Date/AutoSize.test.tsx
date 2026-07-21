import { render } from '@testing-library/react-native'
import AutoSizer from '../../Date/AutoSizer'

it('renders AutoSizer', async () => {
  const { toJSON } = await render(<AutoSizer>{() => <></>}</AutoSizer>)
  expect(toJSON()).toMatchSnapshot()
})
