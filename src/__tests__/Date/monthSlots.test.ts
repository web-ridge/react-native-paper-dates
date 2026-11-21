import {
  assignMonthSlots,
  getVerticalWindow,
  nextVisibleIndexes,
} from '../../Date/SwiperUtils'

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

describe('vertical month window', () => {
  it('mounts three months on each side of the visible month', () => {
    expect(getVerticalWindow(2400)).toEqual([
      2397, 2398, 2399, 2400, 2401, 2402, 2403,
    ])
  })

  it('moves one month at a time while scrolling', () => {
    const window = getVerticalWindow(2400)
    const next = nextVisibleIndexes(window, 2401)
    expect(next).toEqual([2398, 2399, 2400, 2401, 2402, 2403, 2404])
    const previous = assignMonthSlots([], window)
    const moved = assignMonthSlots(previous, next)
    const remounted = moved.filter(
      (entry) =>
        !previous.some(
          (old) =>
            old.slot === entry.slot && old.monthIndex === entry.monthIndex
        )
    )
    expect(remounted).toEqual([{ monthIndex: 2404, slot: 0 }])
  })
})
