import type { TranslationsType } from './utils'

const pl: TranslationsType = {
  save: 'Zapisz',
  selectSingle: 'Wybierz datę',
  selectMultiple: 'Wybierz daty',
  selectRange: 'Wybierz zakres',
  notAccordingToDateFormat: (inputFormat: string) =>
    `Data musi mieć format ${inputFormat}`,
  mustBeHigherThan: 'Nie wcześniej niż',
  mustBeLowerThan: 'Nie później niż',
  mustBeBetween: 'Pomiędzy',
  dateIsDisabled: 'Niedozwolona data',
}
export default pl
