import {
  circleSize,
  focusRingOffset,
  focusRingReach,
  getAngle,
  getHours,
  getHourType,
  getHourTypeFromOffset,
  getMinutes,
  getTimeInputTypeIcon,
  hourTypes,
  isValidHourInput,
  isValidMinuteInput,
  modalScrollFieldHeight,
  periodSelectorGap,
  scrollFieldHeight,
  scrollFieldWidth,
  scrollItemHeight,
  scrollNeighborMinVisible,
  snap,
  timeDialFits,
  timeFieldMaxHeight,
  timeFieldMaxWidth,
  timeFieldReservedWidth,
  timeFieldSize,
  timeInputFieldHeight,
  timePickerModalMinWidth,
  timePickerUsesLandscape,
  timeSelectorFieldWidth,
  timeSelectorHeight,
  timeSeparatorGlyphWidth,
  timeSeparatorWidth,
  toHourInputFormat,
  toHourOutputFormat,
} from '../../Time/timeUtils'

const defaultInputTypeIcons = {
  keyboard: 'keyboard',
  picker: 'clock',
}

describe('timeUtils', () => {
  it('classifies hour types from a 24-hour value', () => {
    expect(getHourType(0)).toBe(hourTypes.am)
    expect(getHourType(11)).toBe(hourTypes.am)
    expect(getHourType(12)).toBe(hourTypes.pm)
    expect(getHourType(23)).toBe(hourTypes.pm)
    expect(getHourType(-1)).toBeUndefined()
    expect(getHourType(24)).toBeUndefined()
    expect(getHourType(26)).toBeUndefined()
  })

  it('resolves the next input type icon', () => {
    expect(getTimeInputTypeIcon('picker', defaultInputTypeIcons)).toBe(
      'keyboard'
    )
    expect(getTimeInputTypeIcon('keyboard', defaultInputTypeIcons)).toBe(
      'clock'
    )
    expect(getTimeInputTypeIcon('scroll')).toBe('keyboard')
    expect(getTimeInputTypeIcon('keyboard', undefined, 'scroll')).toBe(
      'gesture-swipe-vertical'
    )
    expect(
      getTimeInputTypeIcon(
        'scroll',
        { keyboard: 'keys', picker: 'face', scroll: 'swipe' },
        'scroll'
      )
    ).toBe('keys')
    expect(getTimeInputTypeIcon('picker')).toBe('keyboard')
    expect(getTimeInputTypeIcon('keyboard', {} as never)).toBe('clock')
    expect(getTimeInputTypeIcon('nope' as 'picker')).toBeUndefined()
  })

  it('covers clock geometry and hour conversions', () => {
    expect(snap(22, 10)).toBe(20)
    expect(getHourTypeFromOffset(20, 75, circleSize)).toBe(hourTypes.am)
    expect(getHourTypeFromOffset(135, 45, circleSize)).toBe(hourTypes.pm)
    expect(getMinutes(3)).toBe(14)
    expect(getHours(4.5, hourTypes.am)).toBe(6)
    expect(getHours(4.5, hourTypes.pm)).toBe(6)

    expect(getAngle(10, circleSize / 2, circleSize)).toEqual(expect.any(Number))
    expect(getAngle(circleSize, 10, circleSize)).toEqual(expect.any(Number))
    expect(getAngle(circleSize / 2, circleSize, circleSize)).toBeCloseTo(
      -Math.PI / 2
    )
    expect(getAngle(circleSize / 2, 0, circleSize)).toBeCloseTo(Math.PI / 2)
    expect(getAngle(circleSize / 2, circleSize / 2, circleSize)).toBeCloseTo(
      Math.PI / 2
    )

    expect(getHours(0.3, undefined)).toBe(10)
    expect(getHours(1.6, hourTypes.am)).toBe(12)
    expect(getHours(7.9, undefined)).toBe(0)
    expect(getHours(7.9, hourTypes.am)).toBe(12)
    expect(getHours(-6.25, undefined)).toBe(9)
    expect(getMinutes(0.05)).toBe(45)
    expect(getMinutes(7.85)).toBe(0)
    expect(snap(-6.25, Math.PI / 6)).toBeCloseTo(-Math.PI * 2)
    expect(snap(0.3, Math.PI / 6)).toBeCloseTo(Math.PI / 6)

    expect(toHourInputFormat(13, false)).toBe(1)
    expect(toHourInputFormat(13, true)).toBe(13)
    expect(toHourInputFormat(24, true)).toBe(0)
    expect(toHourInputFormat(0, false)).toBe(12)
    expect(toHourInputFormat(5, false)).toBe(5)
    expect(toHourOutputFormat(11, 13, false)).toBe(23)
    expect(toHourOutputFormat(8, 6, true)).toBe(8)
    expect(toHourOutputFormat(1, 0, false)).toBe(1)
    expect(toHourOutputFormat(13, 0, false)).toBe(1)
    expect(toHourOutputFormat(0, 0, false)).toBe(0)
    expect(toHourOutputFormat(15, 14, false)).toBe(15)
  })

  it('validates typed hours and minutes', () => {
    expect(isValidHourInput(0, true)).toBe(true)
    expect(isValidHourInput(23, true)).toBe(true)
    expect(isValidHourInput(24, true)).toBe(false)
    expect(isValidHourInput(0, false)).toBe(false)
    expect(isValidHourInput(12, false)).toBe(true)
    expect(isValidHourInput(13, false)).toBe(false)
    expect(isValidMinuteInput(0)).toBe(true)
    expect(isValidMinuteInput(59)).toBe(true)
    expect(isValidMinuteInput(60)).toBe(false)
    expect(isValidMinuteInput(Number.NaN)).toBe(false)
    expect(isValidHourInput(Number.NaN, true)).toBe(false)
    expect(isValidHourInput(Number.POSITIVE_INFINITY, false)).toBe(false)
    expect(isValidHourInput(-1, true)).toBe(false)
  })

  it('chooses landscape or input fallback from the viewport', () => {
    expect(timeDialFits(400, 800)).toBe(true)
    expect(timeDialFits(900, 400)).toBe(true)
    expect(timeDialFits(320, 360)).toBe(false)
    expect(timePickerUsesLandscape(900, 400, 'picker')).toBe(true)
    expect(timePickerUsesLandscape(400, 800, 'picker')).toBe(false)
    expect(timePickerUsesLandscape(800, 1000, 'picker')).toBe(true)
    expect(timePickerUsesLandscape(800, 1000, 'keyboard')).toBe(false)
    expect(timePickerUsesLandscape(900, 400, 'keyboard')).toBe(true)
    expect(timeSelectorFieldWidth('picker', true, false)).toBe(132)
    expect(timeSelectorFieldWidth('picker', true, true)).toBe(100)
    expect(timeSelectorFieldWidth('keyboard', true, false)).toBe(100)
    expect(timePickerModalMinWidth(false, true)).toBe(318)
    expect(timePickerModalMinWidth(false, false)).toBe(318)
    expect(timePickerModalMinWidth(true, true)).toBe(314)
    expect(timePickerModalMinWidth(true, false)).toBe(250)
  })

  it('keeps at least half of each neighboring scroll value visible', () => {
    expect(scrollItemHeight).toBe(64)
    expect(scrollNeighborMinVisible).toBe(32)
    expect(scrollFieldHeight).toBe(128)
    expect(modalScrollFieldHeight).toBe(128)
    expect(timeInputFieldHeight).toBe(128)
    expect(timeSelectorHeight).toBe(120)
    expect((scrollFieldHeight - scrollItemHeight) / 2).toBeGreaterThanOrEqual(
      scrollNeighborMinVisible
    )
  })

  it('sizes growing time fields from the pane width, with a floor and a cap', () => {
    expect(timeFieldReservedWidth(true)).toBe(timeSeparatorWidth)
    expect(timeFieldReservedWidth(false)).toBeGreaterThan(timeSeparatorWidth)
    expect(timeFieldSize({ is24Hour: true })).toEqual({
      height: scrollFieldHeight,
      width: scrollFieldWidth,
    })
    expect(timeFieldSize({ availableWidth: 200, is24Hour: true })).toEqual({
      height: scrollFieldHeight,
      width: scrollFieldWidth,
    })
    const twelveHourRow = scrollFieldWidth * 2 + timeFieldReservedWidth(false)
    expect(
      timeFieldSize({ availableWidth: twelveHourRow, is24Hour: false })
    ).toEqual({ height: scrollFieldHeight, width: scrollFieldWidth })
    const grown = timeFieldSize({ availableWidth: 500, is24Hour: true })
    expect(grown.width).toBe(timeFieldMaxWidth)
    expect(grown.height).toBe(timeFieldMaxHeight)
    const midWidth = scrollFieldWidth + 20
    const midPane = midWidth * 2 + timeFieldReservedWidth(true)
    const mid = timeFieldSize({ availableWidth: midPane, is24Hour: true })
    expect(mid.width).toBe(midWidth)
    expect(mid.height).toBe(
      Math.round((midWidth / scrollFieldWidth) * scrollFieldHeight)
    )
  })

  it('clears the 5dp focus ring around the 16dp colon and the AM/PM selector', () => {
    expect(focusRingReach).toBe(5)
    expect(timeSeparatorGlyphWidth).toBe(16)
    expect(timeSeparatorWidth).toBe(
      focusRingReach + timeSeparatorGlyphWidth + focusRingReach
    )
    expect(periodSelectorGap).toBe(focusRingReach * 2 + focusRingOffset)
    expect(periodSelectorGap).toBeGreaterThan(focusRingReach * 2)
  })
})
