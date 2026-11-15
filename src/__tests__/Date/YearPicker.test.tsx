import { render } from '@testing-library/react-native'

import { defaultEndYear, defaultStartYear } from '../../Date/dateUtils'
import YearPicker from '../../Date/YearPicker'

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
