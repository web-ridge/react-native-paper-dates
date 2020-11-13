import { addMonths, getGridCountForDate } from './dateUtils'

test('gridCounts contains the right data for October 2021', () => {
  const gridCount = getGridCountForDate(
    addMonths(new Date(2018, 10 - 1, 1), 12 * 3)
  )

  expect(gridCount).toBe(6)
})
