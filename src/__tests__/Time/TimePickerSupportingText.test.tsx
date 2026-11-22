import { timePickerErrorMessage } from '../../Time/TimePickerSupportingText'
import en from '../../translations/en'
import { registerTranslation } from '../../translations/utils'

registerTranslation('en', en)

it('resolves the time picker error message', () => {
  expect(timePickerErrorMessage(false, undefined, false)).toBeUndefined()
  expect(timePickerErrorMessage(true, undefined, false, 'en')).toBe(
    'Invalid time'
  )
  expect(timePickerErrorMessage(true, 'Outside hours', false)).toBe(
    'Outside hours'
  )
  expect(timePickerErrorMessage(true, '', false)).toBeUndefined()
  expect(timePickerErrorMessage(false, undefined, true, 'en')).toBe(
    'Invalid time'
  )
  expect(timePickerErrorMessage(true, 'Outside hours', true)).toBe(
    'Outside hours'
  )
})
