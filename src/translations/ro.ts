import type { TranslationsType } from './utils'

const ro: TranslationsType = {
  am: 'AM',
  close: 'Închide',
  dateIsDisabled: 'Data nu este permisă',
  hour: 'Oră',
  minute: 'Minut',
  mustBeBetween: (startDate, endDate) =>
    `Trebuie să fie între ${startDate} - ${endDate}`,
  mustBeHigherThan: (date) => `Trebuie să fie mai târziu de ${date}`,
  mustBeLowerThan: (date) => `Trebuie să fie mai devreme de ${date}`,
  next: 'Următorul',
  notAccordingToDateFormat: (inputFormat) =>
    `Formatul datei trebuie să fie ${inputFormat}`,
  pickDateFromCalendar: 'Alege o dată din calendar',
  pm: 'PM',
  previous: 'Anterior',
  save: 'Salvează',
  selectMultiple: 'Selectează datele',
  selectRange: 'Selectează perioada',
  selectSingle: 'Selectează data',
  toggleKeyboard: 'Comută tastatura',
  typeInDate: 'Tipul în dată',
}
export default ro
