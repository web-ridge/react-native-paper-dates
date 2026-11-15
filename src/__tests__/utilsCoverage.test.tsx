import { act, renderHook } from '@testing-library/react-native'
import { type ReactNode, useContext } from 'react'
import { Dimensions, I18nManager } from 'react-native'
import { DarkTheme, LightTheme, ThemeProvider } from 'react-native-paper'

import { DisplayModeContext } from '../contexts/DisplayModeContext'
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
import {
  darkenColor,
  fadeColor,
  hexColor,
  isDarkColor,
  range,
  scrimColor,
  themeColor,
  useHeaderBackgroundColor,
  useHeaderTextColor,
  useIsLargeScreen,
  useLatest,
  useTextColorOnPrimary,
} from '../shared/utils'
import en from '../translations/en'
import { registerTranslation } from '../translations/utils'

registerTranslation('en', en)

function fill(format: string, year: string, month: string, day: string) {
  return format
    .replace('YYYY', year)
    .replace('AAAA', year)
    .replace('MM', month)
    .replace('DD', day)
}

function withTheme(theme: object) {
  return function ThemeWrap({ children }: { children: ReactNode }) {
    return <ThemeProvider theme={theme as never}>{children}</ThemeProvider>
  }
}

describe('useDateInput', () => {
  async function commit(
    result: {
      current: {
        onBlur: () => void
        onChangeText: (text: string) => void
      }
    },
    text: string
  ) {
    await act(() => {
      result.current.onChangeText(text)
    })
    await act(() => {
      result.current.onBlur()
    })
  }

  async function input(props: Partial<Parameters<typeof useDateInput>[0]> = {}) {
    const onChange = jest.fn()
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
    const onValidationError = props.onValidationError
    return { ...hook, onChange }
  }

  it('formats an empty value and rejects each broken field', async () => {
    const { result } = await input()
    expect(result.current.formattedValue).toBe('')
    const format = result.current.inputFormat

    await commit(result, fill(format, 'abcd', '01', '01'))
    expect(result.current.error).toEqual(expect.any(String))

    await commit(result, fill(format, '2022', 'aa', '01'))
    expect(result.current.error).toEqual(expect.any(String))

    await commit(result, fill(format, '2022', '01', 'aa'))
    expect(result.current.error).toEqual(expect.any(String))
  })

  it('reports disabled dates and each side of a valid range', async () => {
    const disabled = new Date(2022, 5, 15)
    const onValidationError = jest.fn()
    const { onChange, result } = await input({
      onValidationError,
      validRange: {
        disabledDates: [disabled],
        endDate: new Date(2022, 5, 20),
        startDate: new Date(2022, 5, 10),
      },
    })
    const format = result.current.inputFormat

    await commit(result, fill(format, '2022', '06', '15'))
    expect(onValidationError).toHaveBeenCalledWith(expect.any(String))
    expect(onChange).not.toHaveBeenCalled()

    await commit(result, fill(format, '2022', '06', '01'))
    await commit(result, fill(format, '2022', '06', '28'))

    await commit(result, fill(format, '2022', '06', '12'))
    expect(onChange).toHaveBeenCalled()
    expect(onValidationError).toHaveBeenCalledWith(null)
    expect(result.current.error).toBeNull()
  })

  it('accepts an end-of-day value and a one-sided range', async () => {
    const startOnly = await input({
      inputMode: 'end',
      validRange: { startDate: new Date(2022, 5, 10) },
      value: new Date(2022, 5, 12),
    })
    expect(startOnly.result.current.formattedValue).not.toBe('')
    await commit(
      startOnly.result,
      fill(startOnly.result.current.inputFormat, '2022', '06', '01')
    )
    await commit(
      startOnly.result,
      fill(startOnly.result.current.inputFormat, '2022', '06', '18')
    )
    const confirmed = startOnly.onChange.mock.calls.at(-1)?.[0] as Date
    expect(confirmed.getHours()).toBe(23)

    const endOnly = await input({
      validRange: { endDate: new Date(2022, 5, 20) },
    })
    await commit(
      endOnly.result,
      fill(endOnly.result.current.inputFormat, '2022', '06', '28')
    )
    await commit(
      endOnly.result,
      fill(endOnly.result.current.inputFormat, '2022', '06', '02')
    )
    expect(endOnly.onChange).toHaveBeenCalled()
  })

  it('rejects a calendar day that does not exist', async () => {
    const { onChange, result } = await input()
    const format = result.current.inputFormat
    await commit(result, fill(format, '2022', '02', '31'))
    expect(onChange).not.toHaveBeenCalled()
    expect(result.current.error).toEqual(expect.any(String))

    await commit(result, fill(format, '2022', '02', '29'))
    expect(onChange).not.toHaveBeenCalled()

    await commit(result, fill(format, '2024', '02', '29'))
    expect(onChange).toHaveBeenCalled()
    const parsed = onChange.mock.calls.at(-1)?.[0] as Date
    expect(parsed.getFullYear()).toBe(2024)
    expect(parsed.getMonth()).toBe(1)
    expect(parsed.getDate()).toBe(29)
    expect(result.current.error).toBeNull()
  })

  it('reads a portuguese year token', async () => {
    const { onChange, result } = await input({ locale: 'pt' })
    await commit(
      result,
      fill(result.current.inputFormat, '2022', '06', '12')
    )
    expect(onChange).toHaveBeenCalled()
  })

  it('parses Korean, Czech, and Arabic date formats', async () => {
    const korean = await input({ locale: 'ko' })
    expect(korean.result.current.inputFormat).toBe('YYYY. MM. DD.')
    await commit(korean.result, '2024. 06. 15.')

    const czech = await input({ locale: 'cs' })
    expect(czech.result.current.inputFormat).toBe('DD. MM. YYYY')
    await commit(czech.result, '15. 06. 2024')

    const arabic = await input({ locale: 'ar' })
    expect(arabic.result.current.inputFormat).toBe('DD\u200f/MM\u200f/YYYY')
    await commit(arabic.result, '15\u200f/06\u200f/2024')

    for (const hook of [korean, czech, arabic]) {
      const parsed = hook.onChange.mock.calls.at(-1)?.[0] as Date
      expect(parsed.getFullYear()).toBe(2024)
      expect(parsed.getMonth()).toBe(5)
      expect(parsed.getDate()).toBe(15)
    }
  })

  it('clears a validation error when the selected date changes', async () => {
    const onValidationError = jest.fn()
    const hook = await renderHook(
      ({ value }: { value: Date | undefined }) =>
        useDateInput({
          inputMode: 'start',
          locale: 'en',
          onChange: () => undefined,
          onValidationError,
          validRange: undefined,
          value,
        }),
      { initialProps: { value: undefined as Date | undefined } }
    )
    const format = hook.result.current.inputFormat
    await commit(hook.result, fill(format, '2022', '02', '31'))
    expect(hook.result.current.error).toEqual(expect.any(String))

    await act(() => {
      hook.rerender({ value: new Date(2022, 5, 12) })
    })
    expect(hook.result.current.error).toBeNull()
    expect(onValidationError).toHaveBeenCalledWith(null)
  })

  it('parses a Thai input as a Gregorian date', async () => {
    const { onChange, result } = await input({ locale: 'th' })
    expect(result.current.inputFormat).toBe('DD/MM/YYYY')
    await commit(result, '05/01/2024')
    const parsed = onChange.mock.calls.at(-1)?.[0] as Date
    expect(parsed.getFullYear()).toBe(2024)
    expect(parsed.getMonth()).toBe(0)
    expect(parsed.getDate()).toBe(5)
  })

  it('uses the supplied fallback when a locale has no copy', async () => {
    const onValidationError = jest.fn()
    const broken = await input({ locale: 'zz', onValidationError })
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined)
    await commit(broken.result, 'not-a-date')
    expect(broken.result.current.error).toEqual(expect.any(String))
    expect(onValidationError).toHaveBeenCalled()

    const bounded = await input({
      locale: 'zz',
      validRange: {
        endDate: new Date(2022, 0, 10),
        startDate: new Date(2022, 0, 1),
      },
    })
    await commit(
      bounded.result,
      fill(bounded.result.current.inputFormat, '2022', '06', '12')
    )
    expect(bounded.result.current.error).toEqual(expect.any(String))

    const startOnly = await input({
      locale: 'zz',
      validRange: { startDate: new Date(2022, 5, 20) },
    })
    await commit(
      startOnly.result,
      fill(startOnly.result.current.inputFormat, '2022', '01', '02')
    )
    const endOnly = await input({
      locale: 'zz',
      validRange: { endDate: new Date(2022, 0, 10) },
    })
    await commit(
      endOnly.result,
      fill(endOnly.result.current.inputFormat, '2022', '06', '12')
    )
    expect(endOnly.result.current.error).toEqual(expect.any(String))
    expect(warn).toHaveBeenCalled()
    warn.mockRestore()
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
    const currentIndexRef = { current: 0 }
    const onChange = jest.fn()
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

  afterEach(async () => {
    await act(async () => {
      Dimensions.set({
        screen: saved,
        window: saved,
      })
    })
  })

  it('picks a text color from the primary color and the theme', async () => {
    const dark = await renderHook(() => useTextColorOnPrimary(), {
      wrapper: withTheme({
        ...DarkTheme,
        colors: { ...DarkTheme.colors, primary: '#000000' },
        roundness: 4,
      }),
    })
    expect(dark.result.current).toBe(DarkTheme.colors.onSurface)

    const lightPrimary = await renderHook(() => useTextColorOnPrimary(), {
      wrapper: withTheme({
        ...LightTheme,
        colors: { ...LightTheme.colors, primary: '#000000' },
        roundness: 4,
      }),
    })
    expect(lightPrimary.result.current).toBe(LightTheme.colors.onPrimary)

    const plain = await renderHook(() => useTextColorOnPrimary())
    expect(plain.result.current).toBeTruthy()
  })

  it('reads header colors, screen size, and the latest value', async () => {
    await act(async () => {
      Dimensions.set({
        screen: { fontScale: 1, height: 400, scale: 1, width: 800 },
        window: { fontScale: 1, height: 400, scale: 1, width: 800 },
      })
    })
    const wide = await renderHook(() => useIsLargeScreen())
    expect(wide.result.current).toBeFalsy()

    await act(async () => {
      Dimensions.set({
        screen: { fontScale: 1, height: 800, scale: 1, width: 800 },
        window: { fontScale: 1, height: 800, scale: 1, width: 800 },
      })
    })
    const large = await renderHook(() => useIsLargeScreen())
    expect(large.result.current).toBeTruthy()

    const colors = await renderHook(() => {
      return {
        background: useHeaderBackgroundColor(),
        latest: useLatest(1),
        text: useHeaderTextColor(),
      }
    })
    expect(colors.result.current.background).toBeTruthy()
    expect(colors.result.current.text).toBeTruthy()
    expect(colors.result.current.latest.current).toBe(1)
    expect(range(1, 3)).toEqual([1, 2, 3])
    expect(scrimColor('#336699')).toBe('rgba(51, 102, 153, 0.32)')
    expect(scrimColor(undefined)).toBe('rgba(0, 0, 0, 0.32)')
    expect(fadeColor('#336699', 0.5)).toBe('rgba(51, 102, 153, 0.5)')
    expect(fadeColor('rgba(20, 30, 40, 0.8)', 0.5)).toBe(
      'rgba(20, 30, 40, 0.4)'
    )
    expect(darkenColor('#ff0000', 0.2)).toBe('#CC0000')
    expect(darkenColor('#336699', 0.2)).toBe('#29527A')
    expect(darkenColor('#ffffff', 0.2)).toBe('#CCCCCC')
    expect(hexColor('rgba(103, 80, 164, 1)')).toBe('#6750A4')
    expect(hexColor('#abc')).toBe('#AABBCC')
    expect(hexColor('#abcd')).toBe('#AABBCC')
    expect(hexColor('rgb(16, 32, 48)')).toBe('#102030')
    expect(scrimColor('not-a-color')).toBe('rgba(0, 0, 0, 0.32)')
    expect(isDarkColor('#000000')).toBe(true)
    expect(isDarkColor('#ffffff')).toBe(false)
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

describe('public entry', () => {
  it('loads the package exports', () => {
    const api = require('../index') as typeof import('../index')
    expect(api.Calendar).toBeTruthy()
    expect(api.DatePickerModal).toBeTruthy()
    expect(api.DatePickerInput).toBeTruthy()
    expect(api.TimePickerModal).toBeTruthy()
    expect(api.TimePicker).toBeTruthy()
    expect(api.en.save).toBe('Save')
    expect(api.getTranslation('en', 'save')).toBe('Save')
  })
})
