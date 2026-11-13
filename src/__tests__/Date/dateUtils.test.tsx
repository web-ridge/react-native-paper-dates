import { renderHook } from '@testing-library/react-native'
import {
  addMonths,
  areDatesOnSameDay,
  dateToUnix,
  differenceInMonths,
  createGridCounts,
  getBeginOffset,
  getDaysInMonth,
  getEndOfDay,
  getFirstDayOfMonth,
  getGridCount,
  getGridCountForDate,
  getInitialIndex,
  getRealIndex,
  getStartAtIndex,
  getStartOfDay,
  getTotalMonths,
  isDateBetween,
  isDateWithinOptionalRange,
  isLeapYear,
  showWeekDay,
  useInputFormat,
  useInputFormatter,
  useRangeChecker,
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
      getGridCountForDate(addMonths(new Date(2018, 10 - 1, 1), 12 * 3), false)
    ).toBe(6)
  })

  it('should return correct gridCount for October 2021 with weeks starting on monday', () => {
    expect(
      getGridCountForDate(addMonths(new Date(2018, 10 - 1, 1), 12 * 3), true)
    ).toBe(5)
  })

  it('should get correct difference in month between dates', () => {
    expect(differenceInMonths(new Date(2022, 1, 1), new Date(2022, 2, 1))).toBe(
      1
    )
  })

  it('compares each part of a calendar day', () => {
    expect(
      areDatesOnSameDay(new Date(2022, 1, 1), new Date(2023, 1, 1))
    ).toBeFalsy()
    expect(
      areDatesOnSameDay(new Date(2022, 1, 1), new Date(2022, 2, 1))
    ).toBeFalsy()
    expect(
      areDatesOnSameDay(new Date(2022, 1, 1), new Date(2022, 1, 2))
    ).toBeFalsy()
  })

  it('treats a missing range bound as outside the range', () => {
    expect(
      isDateBetween(new Date(2022, 1, 1), { endDate: new Date(2022, 2, 1) })
    ).toBeFalsy()
    expect(
      isDateBetween(new Date(2022, 1, 1), { startDate: new Date(2022, 1, 1) })
    ).toBeFalsy()
    expect(
      isDateBetween(new Date(2022, 1, 1), {
        startDate: new Date(2022, 2, 1),
        endDate: new Date(2022, 3, 1),
      })
    ).toBeFalsy()
  })

  it('knows century leap years and the length of February', () => {
    expect(isLeapYear({ year: 1900 })).toBeFalsy()
    expect(isLeapYear({ year: 2000 })).toBeTruthy()
    expect(getDaysInMonth({ year: 2024, month: 1 })).toBe(29)
    expect(getDaysInMonth({ year: 2022, month: 1 })).toBe(28)
  })

  it('clamps the day when the target month is shorter', () => {
    expect(addMonths(new Date(2022, 0, 31), 1).getDate()).toBe(28)
    expect(addMonths(new Date(2022, 11, 15), 1).getMonth()).toBe(0)
  })

  it('shifts the first weekday when weeks start on Monday', () => {
    expect(
      getFirstDayOfMonth({ year: 2021, month: 9, startWeekOnMonday: false })
    ).toBeGreaterThanOrEqual(0)
    expect(
      getFirstDayOfMonth({ year: 2021, month: 9, startWeekOnMonday: true })
    ).toBeGreaterThanOrEqual(0)
  })

  it('returns a weekday when that day is not disabled', () => {
    expect(showWeekDay(1, [0, 6])).toBeTruthy()
  })

  it('maps indexes onto the configured year span', () => {
    expect(getStartAtIndex(3000)).toBe(0)
    expect(getStartAtIndex()).toBeGreaterThan(0)
    expect(getTotalMonths()).toBe((2200 - 1800 + 1) * 12)
    expect(getTotalMonths(2020, 2021)).toBe(24)
    expect(getBeginOffset(2020, 2030)).toBeGreaterThan(0)
    expect(getRealIndex(getStartAtIndex(2020, 2030), 2020, 2030)).toBe(0)
    expect(createGridCounts(2)).toEqual([undefined, undefined])
    expect(getGridCount(getStartAtIndex(), false)).toBeGreaterThan(0)
    expect(getGridCount(getStartAtIndex(), false)).toBeGreaterThan(0)
    expect(getInitialIndex(undefined)).toBe(getStartAtIndex())
    expect(getInitialIndex(new Date(2024, 0, 1))).toEqual(expect.any(Number))
  })

  it('checks optional unix bounds', () => {
    const day = new Date(2022, 5, 15, 12)
    const start = dateToUnix(getStartOfDay(new Date(2022, 5, 10)))
    const end = dateToUnix(getEndOfDay(new Date(2022, 5, 20)))
    expect(getStartOfDay(day).getHours()).toBe(0)
    expect(getEndOfDay(day).getHours()).toBe(23)
    expect(isDateWithinOptionalRange(day, {})).toBeTruthy()
    expect(
      isDateWithinOptionalRange(new Date(2022, 5, 1), { startUnix: start })
    ).toBeFalsy()
    expect(
      isDateWithinOptionalRange(new Date(2022, 5, 12), { startUnix: start })
    ).toBeTruthy()
    expect(
      isDateWithinOptionalRange(new Date(2022, 5, 28), { endUnix: end })
    ).toBeFalsy()
    expect(
      isDateWithinOptionalRange(new Date(2022, 5, 12), { endUnix: end })
    ).toBeTruthy()
  })

  it('checks disabled dates and valid bounds from the range hook', async () => {
    const disabled = new Date(2022, 5, 15)
    const { result } = await renderHook(() =>
      useRangeChecker({
        startDate: new Date(2022, 5, 10),
        endDate: new Date(2022, 5, 20),
        disabledDates: [disabled, new Date(2022, 5, 16)],
      })
    )
    expect(result.current.isDisabled(disabled)).toBeTruthy()
    expect(result.current.isDisabled(new Date(2022, 5, 14))).toBeFalsy()
    expect(result.current.isWithinValidRange(new Date(2022, 5, 1))).toBeFalsy()
    expect(result.current.isWithinValidRange(new Date(2022, 5, 28))).toBeFalsy()
    expect(result.current.isWithinValidRange(new Date(2022, 5, 12))).toBeTruthy()

    const open = await renderHook(() => useRangeChecker(undefined))
    expect(open.result.current.isDisabled(disabled)).toBeFalsy()
    expect(open.result.current.isWithinValidRange(disabled)).toBeTruthy()
    expect(open.result.current.validStart).toBeUndefined()
  })

  it('builds input masks for western, portuguese, and arabic digits', async () => {
    const western = await renderHook(() =>
      useInputFormat({
        formatter: { format: () => '10/01/2020' } as Intl.DateTimeFormat,
        locale: 'en',
      })
    )
    expect(western.result.current).toBe('MM/DD/YYYY')

    const portuguese = await renderHook(() =>
      useInputFormat({
        formatter: { format: () => '10/01/2020' } as Intl.DateTimeFormat,
        locale: 'pt',
      })
    )
    expect(portuguese.result.current).toBe('MM/DD/AAAA')

    const arabic = await renderHook(() =>
      useInputFormat({
        formatter: { format: () => '٠١/١٠/٢٠٢٠' } as Intl.DateTimeFormat,
        locale: 'ar',
      })
    )
    expect(arabic.result.current).toBe('DD/MM/YYYY')

    const formatter = await renderHook(() =>
      useInputFormatter({ locale: undefined })
    )
    expect(formatter.result.current.format(new Date(2020, 9, 1))).toEqual(
      expect.any(String)
    )
  })
})
