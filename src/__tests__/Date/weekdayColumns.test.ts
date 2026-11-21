import { I18nManager } from 'react-native'

import {
  alignIconToFirstWeekday,
  alignTextToFirstWeekday,
  alignTextToLastWeekday,
  centerIconOnLastWeekday,
  weekdaySpan,
} from '../../Date/weekdayColumns'

const fullWeek = `${50 / 7}%`
const everyWeekday = [0, 1, 2, 3, 4, 5, 6]

describe('weekday column alignment', () => {
  const wasRtl = I18nManager.isRTL

  afterEach(() => {
    I18nManager.isRTL = wasRtl
  })

  it('nudges text toward the centre of the first weekday column', () => {
    expect(alignTextToFirstWeekday()).toEqual({
      marginStart: fullWeek,
      transform: [{ translateX: -4 }],
    })
  })

  it('mirrors the nudge when the layout is right to left', () => {
    I18nManager.isRTL = true

    expect(alignIconToFirstWeekday()).toEqual({
      marginStart: fullWeek,
      transform: [{ translateX: 12 }],
    })
    expect(alignTextToLastWeekday()).toEqual({
      marginEnd: fullWeek,
      transform: [{ translateX: -12 }],
    })
    expect(centerIconOnLastWeekday()).toEqual({
      marginEnd: fullWeek,
      transform: [{ translateX: -20 }],
    })
  })

  it('keeps a seven-column span when every weekday is hidden', () => {
    expect(weekdaySpan(everyWeekday)).toEqual({
      marginEnd: fullWeek,
      marginStart: fullWeek,
    })
  })
})
