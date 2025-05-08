import { render } from '@testing-library/react-native'
import YearPicker from '../../Date/YearPicker'

it('renders YearPicker', () => {
  const { toJSON } = render(
    <YearPicker
      selectedYear={2024}
      selectingYear={true}
      onPressYear={() => null}
      startYear={1800}
      endYear={2200}
    />
  )
  expect(toJSON()).toMatchSnapshot()
})
