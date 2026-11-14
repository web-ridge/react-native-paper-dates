import type { TranslationsType } from './utils'

const pl: TranslationsType = {
  am: 'AM',
  close: 'Zamknij',
  dateIsDisabled: 'Niedozwolona data',
  hour: 'Godzina',
  minute: 'Minuta',
  mustBeBetween: (startDate, endDate) => `Pomiędzy ${startDate} - ${endDate}`,
  mustBeHigherThan: (date) => `Nie wcześniej niżn ${date}`,
  mustBeLowerThan: (date) => `Nie później niż ${date}`,
  next: 'Dalej',
  notAccordingToDateFormat: (inputFormat) =>
    `Data musi mieć format ${inputFormat}`,
  pickDateFromCalendar: 'Wybierz datę z kalendarza',
  pm: 'PM',
  previous: 'Poprzedni',
  save: 'Zapisz',
  selectMultiple: 'Wybierz daty',
  selectRange: 'Wybierz zakres',
  selectSingle: 'Wybierz datę',
  toggleKeyboard: 'Przełącz klawiaturę',
  typeInDate: 'Wpisz datę',
}
export default pl
