import { dateTimeFormat } from '../shared/intl'

describe('dateTimeFormat', () => {
  it('reuses a formatter for the same locale and options', () => {
    const first = dateTimeFormat('en', { month: 'long' })
    const second = dateTimeFormat('en', { month: 'long' })
    expect(second).toBe(first)
    expect(first.format(new Date(2020, 0, 1))).toBe('January')
  })

  it('keeps different option sets apart', () => {
    const long = dateTimeFormat('en', { month: 'long' })
    const short = dateTimeFormat('en', { month: 'short' })
    expect(short).not.toBe(long)
  })
})
