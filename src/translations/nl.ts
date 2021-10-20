import type { TranslationsType } from './utils'

const nl: TranslationsType = {
  save: 'Opslaan',
  selectSingle: 'Selecteer datum',
  selectMultiple: 'Selecteer datums',
  selectRange: 'Selecteer periode',
  notAccordingToDateFormat: (inputFormat: string) =>
    `Datumformaat moet ${inputFormat} zijn`,
  mustBeHigherThan: 'Moet later dan',
  mustBeLowerThan: 'Moet eerder dan',
  mustBeBetween: 'Moet tussen',
  dateIsDisabled: 'Deze dag mag niet',
}
export default nl
