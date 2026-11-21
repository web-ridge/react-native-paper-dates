import { themeColor, withAlpha } from '../shared/utils'

describe('withAlpha', () => {
  it('expands short hex colors before applying the alpha', () => {
    expect(withAlpha('#abc', 0.5)).toBe('rgba(170, 187, 204, 0.5)')
    expect(withAlpha('#abcd', 1)).toBe('rgba(170, 187, 204, 1)')
  })

  it('reads full hex colors and ignores an unrecognized color', () => {
    expect(withAlpha('#aabbcc', 0)).toBe('rgba(170, 187, 204, 0)')
    expect(withAlpha('#aabbccdd', 0.25)).toBe('rgba(170, 187, 204, 0.25)')
    expect(withAlpha('not-a-color', 0.5)).toBe('rgba(0, 0, 0, 0.5)')
  })
})

describe('themeColor', () => {
  it('keeps strings and falls back otherwise', () => {
    expect(themeColor('#ffffff')).toBe('#ffffff')
    expect(themeColor(undefined)).toBe('#000000')
  })
})
