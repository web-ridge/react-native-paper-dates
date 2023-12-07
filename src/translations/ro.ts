import type { TranslationsType } from './utils'

const ro: TranslationsType = {
  save: 'Salvează',
  selectSingle: 'Selectează data',
  selectMultiple: 'Selectează datele',
  selectRange: 'Selectează perioada',
  notAccordingToDateFormat: (inputFormat) =>
    `Formatul datei trebuie să fie ${inputFormat}`,
  mustBeHigherThan: (date) => `Trebuie să fie mai târziu de ${date}`,
  mustBeLowerThan: (date) => `Trebuie să fie mai devreme de ${date}`,
  mustBeBetween: (startDate, endDate) =>
    `Trebuie să fie între ${startDate} - ${endDate}`,
  dateIsDisabled: 'Data nu este permisă',
  previous: 'Anterior',
  next: 'Următorul',
  typeInDate: 'Tipul în dată',
  pickDateFromCalendar: 'Alege o dată din calendar',
  close: 'Închide',
  minute: 'Minut',
  hour: 'Oră',
}
export default ro
