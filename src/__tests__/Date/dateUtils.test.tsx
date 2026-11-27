import { renderHook } from '@testing-library/react-native'

import {
  addCalendarDays,
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
  getInitialIndex,
  getRealIndex,
  getStartAtIndex,
  getStartOfDay,
  getTotalMonths,
  gregorianWeekday,
  isDateWithinOptionalRange,
  isLeapYear,
  moveEnabledCalendarDay,
  parseLooseDate,
  resolveCalendarDay,
  showWeekDay,
} from '../../Date/dateUtils'
import {
  useInputFormat,
  useInputFormatter,
  useRangeChecker,
} from '../../Date/inputFormat'

describe('dateUtils', () => {
  it('hides a weekday only when that day is disabled', () => {
    expect(showWeekDay(6)).toBeTruthy()
    expect(showWeekDay(6, [6])).toBeFalsy()
    expect(showWeekDay(1, [0, 6])).toBeTruthy()
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

  it('compares each part of a calendar day', () => {
    const day = new Date(2022, 1, 1)
    expect(areDatesOnSameDay(day, new Date(2022, 1, 1))).toBeTruthy()
    expect(areDatesOnSameDay(day)).toBeFalsy()
    expect(areDatesOnSameDay(day, new Date(2023, 1, 1))).toBeFalsy()
    expect(areDatesOnSameDay(day, new Date(2022, 2, 1))).toBeFalsy()
    expect(areDatesOnSameDay(day, new Date(2022, 1, 2))).toBeFalsy()
  })

  it('knows century leap years and the length of a month', () => {
    expect(isLeapYear({ year: 1900 })).toBeFalsy()
    expect(isLeapYear({ year: 2000 })).toBeTruthy()
    expect(isLeapYear({ year: 2024 })).toBeTruthy()
    expect(isLeapYear({ year: 2022 })).toBeFalsy()
    expect(getDaysInMonth({ month: 1, year: 2024 })).toBe(29)
    expect(getDaysInMonth({ month: 1, year: 2022 })).toBe(28)
    expect(getDaysInMonth({ month: 11, year: 2022 })).toBe(31)
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

  it('adds months and clamps the day when the target month is shorter', () => {
    const same = new Date(2022, 2, 10)
    expect(addMonths(same, 0).toISOString()).toBe(same.toISOString())
    expect(addMonths(new Date(2022, 0, 31), 1).getDate()).toBe(28)
    expect(addMonths(new Date(2022, 11, 15), 1).getMonth()).toBe(0)
    expect(differenceInMonths(new Date(2022, 1, 1), new Date(2022, 2, 1))).toBe(
      1
    )
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
    const october2021 = addMonths(new Date(2018, 10 - 1, 1), 12 * 3)
    expect(getGridCountForDate(october2021, false)).toBe(6)
    expect(getGridCountForDate(october2021, true)).toBe(5)
    expect(
      getFirstDayOfMonth({ month: 9, startWeekOnMonday: false, year: 2021 })
    ).toBeGreaterThanOrEqual(0)
    expect(
      getFirstDayOfMonth({ month: 9, startWeekOnMonday: true, year: 2021 })
    ).toBeGreaterThanOrEqual(0)

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

  it('maps indexes onto the configured year span', () => {
    expect(getStartAtIndex(3000)).toBe(0)
    expect(getStartAtIndex()).toBeGreaterThan(0)
    expect(getTotalMonths()).toBe((2200 - 1800 + 1) * 12)
    expect(getTotalMonths(2020, 2021)).toBe(24)
    expect(getBeginOffset(2020, 2030)).toBeGreaterThan(0)
    expect(getRealIndex(getStartAtIndex(2020, 2030), 2020, 2030)).toBe(0)
    expect(getGridCount(getStartAtIndex(), false)).toBeGreaterThan(0)
    expect(getInitialIndex(undefined)).toBe(getStartAtIndex())
    expect(getInitialIndex(new Date(2024, 0, 1))).toEqual(expect.any(Number))
  })

  it('checks optional unix bounds', () => {
    const day = new Date(2022, 5, 15, 12)
    const end = dateToUnix(getEndOfDay(new Date(2022, 5, 20)))
    const start = dateToUnix(getStartOfDay(new Date(2022, 5, 10)))
    expect(dateToUnix(new Date(2022, 1, 1))).toBe(1643673600)
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

it('moves to the next enabled day and stays inside the bounds', () => {
  expect(addCalendarDays(new Date(2026, 0, 15), 1)).toEqual(
    new Date(2026, 0, 16)
  )
  expect(
    moveEnabledCalendarDay(new Date(2026, 0, 15), 1, {
      disabledDates: [new Date(2026, 0, 16)],
    })
  ).toEqual(new Date(2026, 0, 17))
  expect(
    moveEnabledCalendarDay(new Date(2026, 11, 31), 1, { endYear: 2026 })
  ).toBeUndefined()
  expect(
    moveEnabledCalendarDay(new Date(2026, 0, 15), 7, {
      endDate: new Date(2026, 0, 20),
    })
  ).toBeUndefined()
})
