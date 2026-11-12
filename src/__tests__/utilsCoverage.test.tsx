import { useContext, type ReactNode } from 'react'
import { act, renderHook } from '@testing-library/react-native'
import { I18nManager } from 'react-native'
import { DarkTheme, LightTheme, ThemeProvider } from 'react-native-paper'
import useDateInput from '../Date/inputUtils'
import {
  getMaxIndex,
  getMinIndex,
  isIndexWithinRange,
  useYearChange,
} from '../Date/SwiperUtils'
import {
  alignIconToFirstWeekday,
  alignTextToFirstWeekday,
  alignTextToLastWeekday,
  centerIconOnLastWeekday,
  weekdaySpan,
} from '../Date/weekdayColumns'
import { DisplayModeContext } from '../contexts/DisplayModeContext'
import Color from 'color'
import {
  darkenBy,
  lightenBy,
  themeColor,
  range,
  useHeaderBackgroundColor,
  useHeaderTextColor,
  useIsLargeScreen,
  useLatest,
  useTextColorOnPrimary,
} from '../shared/utils'
import en from '../translations/en'
import { registerTranslation } from '../translations/utils'
import { Dimensions } from 'react-native'

registerTranslation('en', en)

function withTheme(theme: object) {
  return function ThemeWrap({ children }: { children: ReactNode }) {
    return <ThemeProvider theme={theme as never}>{children}</ThemeProvider>
  }
}

function fill(format: string, year: string, month: string, day: string) {
  return format
    .replace('YYYY', year)
    .replace('AAAA', year)
    .replace('MM', month)
    .replace('DD', day)
}

describe('useDateInput', () => {
  async function input(props: Partial<Parameters<typeof useDateInput>[0]> = {}) {
    const onChange = jest.fn()
    const onValidationError = props.onValidationError
    const hook = await renderHook(() =>
      useDateInput({
        inputMode: 'start',
        locale: 'en',
        onChange,
        validRange: undefined,
        value: undefined,
        ...props,
      })
    )
    return { ...hook, onChange }
  }

  it('formats an empty value and rejects each broken field', async () => {
    const { result } = await input()
    expect(result.current.formattedValue).toBe('')
    const format = result.current.inputFormat

    await act(() => {
      result.current.onChangeText(fill(format, 'abcd', '01', '01'))
    })
    expect(result.current.error).toEqual(expect.any(String))

    await act(() => {
      result.current.onChangeText(fill(format, '2022', 'aa', '01'))
    })
    expect(result.current.error).toEqual(expect.any(String))

    await act(() => {
      result.current.onChangeText(fill(format, '2022', '01', 'aa'))
    })
    expect(result.current.error).toEqual(expect.any(String))
  })

  it('reports disabled dates and each side of a valid range', async () => {
    const onValidationError = jest.fn()
    const disabled = new Date(2022, 5, 15)
    const { result, onChange } = await input({
      onValidationError,
      validRange: {
        startDate: new Date(2022, 5, 10),
        endDate: new Date(2022, 5, 20),
        disabledDates: [disabled],
      },
    })
    const format = result.current.inputFormat

    await act(() => {
      result.current.onChangeText(fill(format, '2022', '06', '15'))
    })
    expect(onValidationError).toHaveBeenCalledWith(expect.any(String))
    expect(onChange).not.toHaveBeenCalled()

    await act(() => {
      result.current.onChangeText(fill(format, '2022', '06', '01'))
    })
    await act(() => {
      result.current.onChangeText(fill(format, '2022', '06', '28'))
    })

    await act(() => {
      result.current.onChangeText(fill(format, '2022', '06', '12'))
    })
    expect(onChange).toHaveBeenCalled()
    expect(onValidationError).toHaveBeenCalledWith(null)
    expect(result.current.error).toBeNull()
  })

  it('accepts an end-of-day value and a one-sided range', async () => {
    const startOnly = await input({
      inputMode: 'end',
      value: new Date(2022, 5, 12),
      validRange: { startDate: new Date(2022, 5, 10) },
    })
    expect(startOnly.result.current.formattedValue).not.toBe('')
    await act(() => {
      startOnly.result.current.onChangeText(
        fill(startOnly.result.current.inputFormat, '2022', '06', '01')
      )
    })
    await act(() => {
      startOnly.result.current.onChangeText(
        fill(startOnly.result.current.inputFormat, '2022', '06', '18')
      )
    })
    const confirmed = startOnly.onChange.mock.calls.at(-1)?.[0] as Date
    expect(confirmed.getHours()).toBe(23)

    const endOnly = await input({
      validRange: { endDate: new Date(2022, 5, 20) },
    })
    await act(() => {
      endOnly.result.current.onChangeText(
        fill(endOnly.result.current.inputFormat, '2022', '06', '28')
      )
    })
    await act(() => {
      endOnly.result.current.onChangeText(
        fill(endOnly.result.current.inputFormat, '2022', '06', '02')
      )
    })
    expect(endOnly.onChange).toHaveBeenCalled()
  })

  it('reads a portuguese year token', async () => {
    const { result, onChange } = await input({ locale: 'pt' })
    await act(() => {
      result.current.onChangeText(
        fill(result.current.inputFormat, '2022', '06', '12')
      )
    })
    expect(onChange).toHaveBeenCalled()
  })

  it('uses the supplied fallback when a locale has no copy', async () => {
    const onValidationError = jest.fn()
    const broken = await input({ locale: 'zz', onValidationError })
    await act(() => {
      broken.result.current.onChangeText('not-a-date')
    })
    expect(broken.result.current.error).toEqual(expect.any(String))
    expect(onValidationError).toHaveBeenCalled()

    const bounded = await input({
      locale: 'zz',
      validRange: {
        startDate: new Date(2022, 0, 1),
        endDate: new Date(2022, 0, 10),
      },
    })
    await act(() => {
      bounded.result.current.onChangeText(
        fill(bounded.result.current.inputFormat, '2022', '06', '12')
      )
    })
    expect(bounded.result.current.error).toEqual(expect.any(String))

    const startOnly = await input({
      locale: 'zz',
      validRange: { startDate: new Date(2022, 5, 20) },
    })
    await act(() => {
      startOnly.result.current.onChangeText(
        fill(startOnly.result.current.inputFormat, '2022', '01', '02')
      )
    })
    const endOnly = await input({
      locale: 'zz',
      validRange: { endDate: new Date(2022, 0, 10) },
    })
    await act(() => {
      endOnly.result.current.onChangeText(
        fill(endOnly.result.current.inputFormat, '2022', '06', '12')
      )
    })
    expect(endOnly.result.current.error).toEqual(expect.any(String))
  })
})

describe('swiper index bounds', () => {
  it('clamps the minimum and maximum month indexes', () => {
    expect(getMinIndex()).toBe(0)
    expect(getMinIndex(2020, 2030)).toBeGreaterThanOrEqual(0)
    expect(getMaxIndex()).toBeGreaterThan(0)
    expect(getMaxIndex(2020, 2030)).toBeGreaterThan(0)
    expect(isIndexWithinRange(getMinIndex(2020, 2030), 2020, 2030)).toBeTruthy()
    expect(isIndexWithinRange(-50, 2020, 2030)).toBeFalsy()
  })

  it('scrolls when the selected year changes and ignores the same index', async () => {
    const onChange = jest.fn()
    const currentIndexRef = { current: 0 }
    await renderHook(() =>
      useYearChange(onChange, {
        currentIndexRef,
        endYear: 2030,
        selectedYear: undefined,
        startYear: 2020,
      })
    )
    expect(onChange).not.toHaveBeenCalled()

    await renderHook(() =>
      useYearChange(onChange, {
        currentIndexRef,
        endYear: 2030,
        selectedYear: 2024,
        startYear: 2020,
      })
    )
    expect(onChange).toHaveBeenCalled()

    currentIndexRef.current = onChange.mock.calls[0][0]
    onChange.mockClear()
    await renderHook(() =>
      useYearChange(onChange, {
        currentIndexRef,
        endYear: 2030,
        selectedYear: 2024,
        startYear: 2020,
      })
    )
    expect(onChange).not.toHaveBeenCalled()
  })
})

describe('weekday column alignment', () => {
  const original = I18nManager.isRTL

  afterEach(() => {
    I18nManager.isRTL = original
  })

  it('nudges toward the first and last visible weekday in both directions', () => {
    I18nManager.isRTL = false
    expect(alignTextToFirstWeekday()?.transform).toBeTruthy()
    expect(alignTextToLastWeekday([0])?.transform).toBeTruthy()
    expect(alignIconToFirstWeekday()?.transform).toBeTruthy()
    expect(centerIconOnLastWeekday()?.transform).toBeTruthy()
    expect(weekdaySpan()?.marginStart).toBeTruthy()

    I18nManager.isRTL = true
    expect(alignTextToFirstWeekday()?.transform).toBeTruthy()
    expect(alignTextToLastWeekday()?.transform).toBeTruthy()
    expect(weekdaySpan([0, 1, 2, 3, 4, 5, 6]).marginStart).toBe('7.142857142857143%')
  })
})

describe('shared hooks', () => {
  const saved = Dimensions.get('window')

  afterEach(() => {
    Dimensions.set({
      window: saved,
      screen: saved,
    })
  })

  it('picks a text color from the primary color and the theme', async () => {
    const dark = await renderHook(() => useTextColorOnPrimary(), {
      wrapper: withTheme({
        ...DarkTheme,
        roundness: 4,
        colors: { ...DarkTheme.colors, primary: '#000000' },
      }),
    })
    expect(dark.result.current).toBe(DarkTheme.colors.onSurface)

    const lightPrimary = await renderHook(() => useTextColorOnPrimary(), {
      wrapper: withTheme({
        ...LightTheme,
        roundness: 4,
        colors: { ...LightTheme.colors, primary: '#000000' },
      }),
    })
    expect(lightPrimary.result.current).toBe(LightTheme.colors.onPrimary)

    const plain = await renderHook(() => useTextColorOnPrimary())
    expect(plain.result.current).toBeTruthy()
  })

  it('reads header colors, screen size, and the latest value', async () => {
    Dimensions.set({
      window: { width: 800, height: 400, scale: 1, fontScale: 1 },
      screen: { width: 800, height: 400, scale: 1, fontScale: 1 },
    })
    const wide = await renderHook(() => useIsLargeScreen())
    expect(wide.result.current).toBeFalsy()

    Dimensions.set({
      window: { width: 800, height: 800, scale: 1, fontScale: 1 },
      screen: { width: 800, height: 800, scale: 1, fontScale: 1 },
    })
    const large = await renderHook(() => useIsLargeScreen())
    expect(large.result.current).toBeTruthy()

    const colors = await renderHook(() => {
      return {
        background: useHeaderBackgroundColor(),
        text: useHeaderTextColor(),
        latest: useLatest(1),
      }
    })
    expect(colors.result.current.background).toBeTruthy()
    expect(colors.result.current.text).toBeTruthy()
    expect(colors.result.current.latest.current).toBe(1)
    expect(range(1, 3)).toEqual([1, 2, 3])
    const base = Color('#336699')
    expect(lightenBy(base, 0.5).lightness()).toBeGreaterThan(base.lightness())
    expect(darkenBy(base, 0.5).lightness()).toBeLessThan(base.lightness())
    expect(themeColor('red')).toBe('red')
    expect(themeColor(undefined)).toBe('#000000')
  })

  it('calls the default display-mode setter', async () => {
    const { result } = await renderHook(() => useContext(DisplayModeContext))
    act(() => {
      result.current.setMode('PM')
    })
    expect(result.current.mode).toBe('AM')
  })

})
