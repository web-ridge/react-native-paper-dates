import { renderHook } from '@testing-library/react-native'

import {
  addMonths,
  areDatesOnSameDay,
  dateToUnix,
  differenceInMonths,
  getBeginOffset,
  getDaysInMonth,
  getEndOfDay,
  getFirstDayOfMonth,
  getGridCount,
  getGridCountForDate,
  gregorianWeekday,
  getInitialIndex,
  getRealIndex,
  resolveCalendarDay,
  getStartAtIndex,
  getStartOfDay,
  getTotalMonths,
  isDateWithinOptionalRange,
  isLeapYear,
  parseLooseDate,
  showWeekDay,
} from '../../Date/dateUtils'
import {
  useInputFormat,
  useInputFormatter,
  useRangeChecker,
} from '../../Date/inputFormat'

describe('dateUtils', () => {
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
    expect(getDaysInMonth({ month: 11, year: 2022 })).toBe(31)
  })

  it('should indicate days are the same', () => {
    expect(
      areDatesOnSameDay(new Date(2022, 1, 1), new Date(2022, 1, 1))
    ).toBeTruthy()
  })

  it('should indicate days are the not same', () => {
    expect(areDatesOnSameDay(new Date(2022, 1, 1))).toBeFalsy()
  })

  it('should indicate year is a leap year', () => {
    expect(isLeapYear({ year: 2024 })).toBeTruthy()
  })

  it('should indicate year is not a leap year', () => {
    expect(isLeapYear({ year: 2022 })).toBeFalsy()
  })

  it('parses loose dates in locale field order', () => {
    expect(parseLooseDate('1/2/2026', 'MM/DD/YYYY')).toEqual({
      day: 2,
      month: 1,
      year: 2026,
    })
    expect(parseLooseDate('1-2-2026', 'DD-MM-YYYY')).toEqual({
      day: 1,
      month: 2,
      year: 2026,
    })
    expect(parseLooseDate('2026.01.02', 'YYYY.MM.DD')).toEqual({
      day: 2,
      month: 1,
      year: 2026,
    })
    expect(parseLooseDate('01022026', 'MM/DD/YYYY')).toEqual({
      day: 2,
      month: 1,
      year: 2026,
    })
    expect(parseLooseDate('1 2', 'MM/DD/YYYY')).toBeNull()
    expect(parseLooseDate('٠٥/٠١/٢٠٢٤', 'DD/MM/YYYY')).toEqual({
      day: 5,
      month: 1,
      year: 2024,
    })
    expect(parseLooseDate('۰۵/۰۱/۲۰۲۴', 'DD/MM/YYYY')).toEqual({
      day: 5,
      month: 1,
      year: 2024,
    })
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

  it('knows century leap years and the length of February', () => {
    expect(isLeapYear({ year: 1900 })).toBeFalsy()
    expect(isLeapYear({ year: 2000 })).toBeTruthy()
    expect(getDaysInMonth({ month: 1, year: 2024 })).toBe(29)
    expect(getDaysInMonth({ month: 1, year: 2022 })).toBe(28)
  })

  it('resolves days outside a month the same way Date does', () => {
    for (const year of [2024, 2026]) {
      for (let month = 0; month < 12; month += 1) {
        for (let day = -6; day <= 40; day += 1) {
          const date = new Date(year, month, day)
          expect(resolveCalendarDay(year, month, day)).toEqual({
            day: date.getDate(),
            month: date.getMonth(),
            year: date.getFullYear(),
          })
        }
      }
    }
  })

  it('clamps the day when the target month is shorter', () => {
    expect(addMonths(new Date(2022, 0, 31), 1).getDate()).toBe(28)
    expect(addMonths(new Date(2022, 11, 15), 1).getMonth()).toBe(0)
  })

  it('matches Date.getDay across the supported year range', () => {
    for (let year = 1800; year <= 2200; year += 1) {
      for (let month = 0; month < 12; month += 1) {
        expect(gregorianWeekday(year, month, 1)).toBe(
          new Date(year, month, 1).getDay()
        )
      }
    }
    expect(gregorianWeekday(2024, 1, 1)).toBe(new Date(2024, 1, 1).getDay())
    expect(gregorianWeekday(1900, 1, 1)).toBe(new Date(1900, 1, 1).getDay())
    expect(gregorianWeekday(2000, 1, 1)).toBe(new Date(2000, 1, 1).getDay())
  })

  it('keeps index grid counts aligned with calendar dates', () => {
    const start = getStartAtIndex(2020, 2030)
    for (let index = start - 24; index <= start + 24; index += 1) {
      const date = addMonths(new Date(), index - start)
      expect(getGridCount(index, false, 2020, 2030)).toBe(
        getGridCountForDate(date, false)
      )
      expect(getGridCount(index, true, 2020, 2030)).toBe(
        getGridCountForDate(date, true)
      )
    }
  })

  it('shifts the first weekday when weeks start on Monday', () => {
    expect(
      getFirstDayOfMonth({ month: 9, startWeekOnMonday: false, year: 2021 })
    ).toBeGreaterThanOrEqual(0)
    expect(
      getFirstDayOfMonth({ month: 9, startWeekOnMonday: true, year: 2021 })
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
    expect(getGridCount(getStartAtIndex(), false)).toBeGreaterThan(0)
    expect(getGridCount(getStartAtIndex(), false)).toBeGreaterThan(0)
    expect(getInitialIndex(undefined)).toBe(getStartAtIndex())
    expect(getInitialIndex(new Date(2024, 0, 1))).toEqual(expect.any(Number))
  })

  it('checks optional unix bounds', () => {
    const day = new Date(2022, 5, 15, 12)
    const end = dateToUnix(getEndOfDay(new Date(2022, 5, 20)))
    const start = dateToUnix(getStartOfDay(new Date(2022, 5, 10)))
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
    const epoch = new Date(0)
    expect(dateToUnix(epoch)).toBe(0)
    expect(
      isDateWithinOptionalRange(new Date(-1000), { startUnix: 0 })
    ).toBeFalsy()
    expect(isDateWithinOptionalRange(epoch, { startUnix: 0 })).toBeTruthy()
    expect(
      isDateWithinOptionalRange(new Date(1000), { endUnix: 0 })
    ).toBeFalsy()
    expect(isDateWithinOptionalRange(epoch, { endUnix: 0 })).toBeTruthy()
  })

  it('checks disabled dates and valid bounds from the range hook', async () => {
    const disabled = new Date(2022, 5, 15)
    const { result } = await renderHook(() =>
      useRangeChecker({
        disabledDates: [disabled, new Date(2022, 5, 16)],
        endDate: new Date(2022, 5, 20),
        startDate: new Date(2022, 5, 10),
      })
    )
    expect(result.current.isDisabled(disabled)).toBeTruthy()
    expect(result.current.isDisabled(new Date(2022, 5, 14))).toBeFalsy()
    expect(result.current.isWithinValidRange(new Date(2022, 5, 1))).toBeFalsy()
    expect(result.current.isWithinValidRange(new Date(2022, 5, 28))).toBeFalsy()
    expect(
      result.current.isWithinValidRange(new Date(2022, 5, 12))
    ).toBeTruthy()

    const open = await renderHook(() => useRangeChecker(undefined))
    expect(open.result.current.isDisabled(disabled)).toBeFalsy()
    expect(open.result.current.isWithinValidRange(disabled)).toBeTruthy()
    expect(open.result.current.validStart).toBeUndefined()
  })

  it('builds input masks for western, portuguese, and arabic digits', async () => {
    const parts = (
      values: Array<['day' | 'literal' | 'month' | 'year', string]>
    ): Intl.DateTimeFormat =>
      ({
        formatToParts: () => values.map(([type, value]) => ({ type, value })),
      }) as Intl.DateTimeFormat

    const western = await renderHook(() =>
      useInputFormat({
        formatter: parts([
          ['month', '10'],
          ['literal', '/'],
          ['day', '01'],
          ['literal', '/'],
          ['year', '2020'],
        ]),
        locale: 'en',
      })
    )
    expect(western.result.current).toBe('MM/DD/YYYY')

    const portuguese = await renderHook(() =>
      useInputFormat({
        formatter: parts([
          ['month', '10'],
          ['literal', '/'],
          ['day', '01'],
          ['literal', '/'],
          ['year', '2020'],
        ]),
        locale: 'pt',
      })
    )
    expect(portuguese.result.current).toBe('MM/DD/AAAA')

    const arabic = await renderHook(() =>
      useInputFormat({
        formatter: parts([
          ['day', '٠١'],
          ['literal', '/'],
          ['month', '١٠'],
          ['literal', '/'],
          ['year', '٢٠٢٠'],
        ]),
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

    const thaiFormatter = await renderHook(() =>
      useInputFormatter({ locale: 'th' })
    )
    expect(thaiFormatter.result.current.resolvedOptions().calendar).toBe(
      'gregory'
    )
    const thai = await renderHook(() =>
      useInputFormat({
        formatter: thaiFormatter.result.current,
        locale: 'th',
      })
    )
    expect(thai.result.current).toBe('DD/MM/YYYY')
  })
})
