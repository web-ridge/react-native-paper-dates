import * as React from 'react'

import renderer from 'react-test-renderer'
import YearPicker from '../../Date/YearPicker'

it('renders YearPicker', () => {
  const tree = renderer
    .create(
      <YearPicker
        selectedYear={2022}
        selectingYear
        onPressYear={() => null}
        startYear={1800}
        endYear={2200}
      />
    )
    .toJSON()

  expect(tree).toMatchSnapshot()
})
