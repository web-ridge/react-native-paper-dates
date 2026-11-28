import { pressDate } from '../../Date/selection'

it('sorts multiple dates without Array.prototype.toSorted', () => {
  const proto = Array.prototype as unknown as {
    toSorted?: typeof Array.prototype.toSorted
  }
  const original = proto.toSorted
  delete proto.toSorted

  try {
    expect(typeof Array.prototype.toSorted).toBe('undefined')
    const first = new Date(2026, 5, 2)
    const second = new Date(2026, 0, 15)
    const next = pressDate({ dates: [first], mode: 'multiple' }, second)
    expect(next.dates?.map((date) => date.getTime())).toEqual([
      second.getTime(),
      first.getTime(),
    ])
  } finally {
    if (original) {
      proto.toSorted = original
    }
  }
})

it('toggles a date out of a multiple selection', () => {
  const date = new Date(2026, 5, 2)
  const next = pressDate({ dates: [date], mode: 'multiple' }, date)
  expect(next.dates).toEqual([])
  expect(next.change).toBe('removed')
})
