import { render } from '@testing-library/react-native'
import YearPicker from '../../Date/YearPicker'
import { defaultEndYear, defaultStartYear } from '../../Date/dateUtils'

it('renders', async () => {
  await render(
    <YearPicker
      endYear={defaultEndYear}
      onPressYear={() => null}
      selectedYear={undefined}
      selectingYear={false}
      startYear={defaultStartYear}
    />
  )
})
