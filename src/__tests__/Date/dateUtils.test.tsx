import {
  addMonths,
  areDatesOnSameDay,
  dateToUnix,
  differenceInMonths,
  getDaysInMonth,
  getGridCountForDate,
  isDateBetween,
  isLeapYear,
  showWeekDay,
} from '../../Date/dateUtils'

describe('timeUtils', () => {
  it('should return true for weekday', () => {
    expect(showWeekDay(6)).toBeTruthy()
  })

  it('should return false for weekday', () => {
    expect(showWeekDay(6, [6])).toBeFalsy()
  })

  it('should return correct unix time stamp for date', () => {
    expect(dateToUnix(new Date(2022, 1, 1))).toBe(1643673600)
  })

  it('should add specified months to date', () => {
    const expectedResult = '2022-03-10T00:00:00.000Z'
    expect(new Date(2022, 2, 10).toISOString()).toBe(expectedResult)
    expect(addMonths(new Date(2022, 2, 10), 0).toISOString()).toBe(
      expectedResult
    )
  })

  it('should return correct days for month', () => {
    expect(getDaysInMonth({ year: 2022, month: 11 })).toBe(31)
  })

  it('should indicate days are the same', () => {
    expect(
      areDatesOnSameDay(new Date(2022, 1, 1), new Date(2022, 1, 1))
    ).toBeTruthy()
  })

  it('should indicate days are the not same', () => {
    expect(areDatesOnSameDay(new Date(2022, 1, 1))).toBeFalsy()
  })

  it('should indicate day is between a date range', () => {
    expect(
      isDateBetween(new Date(2022, 5, 1), {
        startDate: new Date(2022, 1, 1),
        endDate: new Date(2022, 11, 1),
      })
    ).toBeTruthy()
  })

  it('should indicate day is not between a date range', () => {
    expect(
      isDateBetween(new Date(2023, 5, 1), {
        startDate: new Date(2022, 1, 1),
        endDate: new Date(2022, 11, 1),
      })
    ).toBeFalsy()
  })

  it('should indicate year is a leap year', () => {
    expect(isLeapYear({ year: 2024 })).toBeTruthy()
  })

  it('should indicate year is not a leap year', () => {
    expect(isLeapYear({ year: 2022 })).toBeFalsy()
  })

  it('should return correct gridCount for October 2021', () => {
    expect(
      getGridCountForDate(addMonths(new Date(2018, 10 - 1, 1), 12 * 3))
    ).toBe(6)
  })

  it('should get correct difference in month between dates', () => {
    expect(differenceInMonths(new Date(2022, 1, 1), new Date(2022, 2, 1))).toBe(
      1
    )
  })
})
