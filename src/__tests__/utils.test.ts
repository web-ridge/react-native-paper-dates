import { themeColor, withAlpha } from '../shared/utils'

describe('withAlpha', () => {
  it('returns the same string for a repeated color and alpha', () => {
    const first = withAlpha('#123456', 0.08)
    expect(withAlpha('#123456', 0.08)).toBe(first)
    expect(first).toBe('rgba(18, 52, 86, 0.08)')
    expect(withAlpha('#123456', 0.12)).toBe('rgba(18, 52, 86, 0.12)')
  })

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
