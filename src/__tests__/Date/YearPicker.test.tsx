import { render } from '@testing-library/react-native'
import YearPicker from '../../Date/YearPicker'
import { defaultEndYear, defaultStartYear } from '../../Date/dateUtils'

it('renders', () => {
  render(
    <YearPicker
      selectedYear={undefined}
      selectingYear={false}
      onPressYear={() => null}
      startYear={defaultStartYear}
      endYear={defaultEndYear}
    />
  )
})
