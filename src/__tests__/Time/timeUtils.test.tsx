import {
  circleSize,
  getAngle,
  getHours,
  getHourType,
  getHourTypeFromOffset,
  getMinutes,
  getTimeInputTypeIcon,
  hourTypes,
  snap,
  toHourInputFormat,
  toHourOutputFormat,
} from '../../Time/timeUtils'

const defaultInputTypeIcons = {
  keyboard: 'keyboard-outline',
  picker: 'clock-outline',
}

describe('timeUtils', () => {
  it('should return "am" hour type, for hour between 0 and 12', () => {
    for (let i = 0; i < 13; i++) {
      expect(getHourType(i)).toMatch(hourTypes.am)
    }
  })

  it('should return "pm" hour type, for hour between 12 and 24', () => {
    for (let i = 13; i < 25; i++) {
      expect(getHourType(i)).toMatch(hourTypes.pm)
    }
  })

  it('should return undefined hour type, for invalid hour', () => {
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
})
