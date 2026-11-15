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
  timePickerUsesLandscape,
  timeSelectorFieldWidth,
  toHourInputFormat,
  toHourOutputFormat,
} from '../../Time/timeUtils'

const defaultInputTypeIcons = {
  keyboard: 'keyboard-outline',
  picker: 'clock-outline',
}

describe('timeUtils', () => {
  it('returns am from midnight through 11', () => {
    for (let i = 0; i < 12; i++) {
      expect(getHourType(i)).toBe(hourTypes.am)
    }
  })

  it('returns pm from noon through 23', () => {
    for (let i = 12; i < 24; i++) {
      expect(getHourType(i)).toBe(hourTypes.pm)
    }
  })

  it('should return undefined hour type, for invalid hour', () => {
    expect(getHourType(-1)).toBeUndefined()
    expect(getHourType(24)).toBeUndefined()
    expect(getHourType(26)).toBeUndefined()
  })

  it('should return keyboard icon for picker input', () => {
    expect(getTimeInputTypeIcon('picker', defaultInputTypeIcons)).toMatch(
      'keyboard-outline'
    )
  })

  it('should return clock icon for keyboard input', () => {
    expect(getTimeInputTypeIcon('keyboard', defaultInputTypeIcons)).toMatch(
      'clock-outline'
    )
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

    for (let angle = -8; angle <= 8; angle += 0.05) {
      getHours(angle, hourTypes.am)
      getHours(angle, hourTypes.pm)
      getHours(angle, undefined)
      getMinutes(angle)
      snap(angle, Math.PI / 6)
    }

    expect(toHourInputFormat(24, true)).toBe(0)
    expect(toHourInputFormat(0, false)).toBe(12)
    expect(toHourInputFormat(5, false)).toBe(5)
    expect(toHourOutputFormat(1, 0, false)).toBe(1)
    expect(toHourOutputFormat(13, 0, false)).toBe(1)
    expect(toHourOutputFormat(0, 0, false)).toBe(0)
    expect(toHourOutputFormat(15, 14, false)).toBe(15)
    expect(getTimeInputTypeIcon('picker')).toBe('keyboard-outline')
    expect(getTimeInputTypeIcon('keyboard', {} as never)).toBe('clock-outline')
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
  })

  it('chooses landscape or input fallback from the viewport', () => {
    expect(timeDialFits(400, 800)).toBe(true)
    expect(timeDialFits(900, 400)).toBe(true)
    expect(timeDialFits(320, 360)).toBe(false)
    expect(timePickerUsesLandscape(900, 400, 'picker')).toBe(true)
    expect(timePickerUsesLandscape(400, 800, 'picker')).toBe(false)
    expect(timePickerUsesLandscape(900, 400, 'keyboard')).toBe(true)
    expect(timeSelectorFieldWidth('picker', true, false)).toBe(114)
    expect(timeSelectorFieldWidth('picker', true, true)).toBe(96)
    expect(timeSelectorFieldWidth('keyboard', true, false)).toBe(96)
  })
})
