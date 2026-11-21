import { assignMonthSlots } from '../../Date/SwiperUtils'

describe('assignMonthSlots', () => {
  it('gives the first window slots in order', () => {
    expect(assignMonthSlots([], [4, 5, 6])).toEqual([
      { monthIndex: 4, slot: 0 },
      { monthIndex: 5, slot: 1 },
      { monthIndex: 6, slot: 2 },
    ])
  })

  it('reuses the slot that left the window', () => {
    const previous = assignMonthSlots([], [4, 5, 6])
    expect(assignMonthSlots(previous, [5, 6, 7])).toEqual([
      { monthIndex: 7, slot: 0 },
      { monthIndex: 5, slot: 1 },
      { monthIndex: 6, slot: 2 },
    ])
  })

  it('keeps every slot when the window jumps', () => {
    const previous = assignMonthSlots([], [4, 5, 6])
    const next = assignMonthSlots(previous, [20, 21, 22])
    expect(next.map((entry) => entry.slot)).toEqual([0, 1, 2])
    expect(next.map((entry) => entry.monthIndex)).toEqual([20, 21, 22])
  })
})
