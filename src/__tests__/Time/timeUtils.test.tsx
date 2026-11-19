import {
  circleSize,
  getAngle,
  getHours,
  getHourType,
  getHourTypeFromOffset,
  getMinutes,
  getTimeInputTypeIcon,
  hourTypes,
  isValidHourInput,
  isValidMinuteInput,
  snap,
  timeDialFits,
  timePickerModalMinWidth,
  timePickerUsesLandscape,
  timeSelectorFieldWidth,
  toHourInputFormat,
  toHourOutputFormat,
} from '../../Time/timeUtils'

const defaultInputTypeIcons = {
  keyboard: 'keyboard',
  picker: 'clock',
}

describe('timeUtils', () => {
  it('returns am from midnight through 11', () => {
    expect(getHourType(0)).toBe(hourTypes.am)
    expect(getHourType(11)).toBe(hourTypes.am)
  })

  it('returns pm from noon through 23', () => {
    expect(getHourType(12)).toBe(hourTypes.pm)
    expect(getHourType(23)).toBe(hourTypes.pm)
  })

  it('should return undefined hour type, for invalid hour', () => {
    expect(getHourType(-1)).toBeUndefined()
    expect(getHourType(24)).toBeUndefined()
    expect(getHourType(26)).toBeUndefined()
  })

  it('should return keyboard icon for picker input', () => {
    expect(getTimeInputTypeIcon('picker', defaultInputTypeIcons)).toBe(
      'keyboard'
    )
  })

  it('should return clock icon for keyboard input', () => {
    expect(getTimeInputTypeIcon('keyboard', defaultInputTypeIcons)).toBe(
      'clock'
    )
  })

  it('returns the keyboard icon for scroll and the scroll icon when leaving input', () => {
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
  })

  it('should snap angle to given step', () => {
    expect(snap(22, 10)).toBe(20)
  })

  it('should return "am" hour type from offset', () => {
    expect(getHourTypeFromOffset(20, 75, circleSize)).toBe(hourTypes.am)
  })

  it('should return "pm" hour type from offset', () => {
    expect(getHourTypeFromOffset(135, 45, circleSize)).toBe(hourTypes.pm)
  })

  it('should return correct minutes from hand angle', () => {
    expect(getMinutes(3)).toBe(14)
  })

  it('should return correct hours from hand angle for "am" hour type', () => {
    expect(getHours(4.5, hourTypes.am)).toBe(6)
  })

  it('should return correct hours from hand angle for "pm" hour type', () => {
    expect(getHours(4.5, hourTypes.pm)).toBe(6)
  })

  it('should return correct hour input format when not is24Hour', () => {
    expect(toHourInputFormat(13, false)).toBe(1)
  })

  it('should return correct hour input format when is24Hour', () => {
    expect(toHourInputFormat(13, true)).toBe(13)
  })

  it('should return correct hour output format when not is24Hour', () => {
    expect(toHourOutputFormat(11, 13, false)).toBe(23)
  })

  it('should return correct hour output format when is24Hour', () => {
    expect(toHourOutputFormat(8, 6, true)).toBe(8)
  })

  it('covers clock geometry and the remaining hour conversions', () => {
    expect(getAngle(10, circleSize / 2, circleSize)).toEqual(expect.any(Number))
    expect(getAngle(circleSize, 10, circleSize)).toEqual(expect.any(Number))
    expect(getAngle(circleSize / 2, circleSize, circleSize)).toBeCloseTo(
      -Math.PI / 2
    )
    expect(getAngle(circleSize / 2, 0, circleSize)).toBeCloseTo(Math.PI / 2)
    expect(getAngle(circleSize / 2, circleSize / 2, circleSize)).toBeCloseTo(
      Math.PI / 2
    )

    // Angles that hit a negative hour, hour 12, and a minute that wraps past 60.
    expect(getHours(0.3, undefined)).toBe(10)
    expect(getHours(1.6, hourTypes.am)).toBe(12)
    expect(getHours(7.9, undefined)).toBe(0)
    expect(getHours(7.9, hourTypes.am)).toBe(12)
    expect(getHours(-6.25, undefined)).toBe(9)
    expect(getMinutes(0.05)).toBe(45)
    expect(getMinutes(7.85)).toBe(0)
    expect(snap(-6.25, Math.PI / 6)).toBeCloseTo(-Math.PI * 2)
    expect(snap(0.3, Math.PI / 6)).toBeCloseTo(Math.PI / 6)

    expect(toHourInputFormat(24, true)).toBe(0)
    expect(toHourInputFormat(0, false)).toBe(12)
    expect(toHourInputFormat(5, false)).toBe(5)
    expect(toHourOutputFormat(1, 0, false)).toBe(1)
    expect(toHourOutputFormat(13, 0, false)).toBe(1)
    expect(toHourOutputFormat(0, 0, false)).toBe(0)
    expect(toHourOutputFormat(15, 14, false)).toBe(15)
    expect(getTimeInputTypeIcon('picker')).toBe('keyboard')
    expect(getTimeInputTypeIcon('keyboard', {} as never)).toBe('clock')
    expect(getTimeInputTypeIcon('nope' as 'picker')).toBeUndefined()
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
    expect(timePickerModalMinWidth(false, true)).toBe(310)
    expect(timePickerModalMinWidth(false, false)).toBe(310)
    expect(timePickerModalMinWidth(true, true)).toBe(310)
    expect(timePickerModalMinWidth(true, false)).toBe(246)
  })
})
