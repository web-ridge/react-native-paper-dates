import { render } from '@testing-library/react-native'
import YearPicker from '../../Date/YearPicker'
import { DEFAULT_START_YEAR, DEFAULT_END_YEAR } from '../../Date/constants'

it('renders', () => {
  render(
    <YearPicker
      selectedYear={undefined}
      selectingYear={false}
      onPressYear={() => null}
      startYear={DEFAULT_START_YEAR}
      endYear={DEFAULT_END_YEAR}
    />
  )
})
