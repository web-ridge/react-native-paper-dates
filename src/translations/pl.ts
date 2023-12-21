import type { TranslationsType } from './utils'

const pl: TranslationsType = {
  save: 'Zapisz',
  selectSingle: 'Wybierz datę',
  selectMultiple: 'Wybierz daty',
  selectRange: 'Wybierz zakres',
  notAccordingToDateFormat: (inputFormat) =>
    `Data musi mieć format ${inputFormat}`,
  mustBeHigherThan: (date) => `Nie wcześniej niżn ${date}`,
  mustBeLowerThan: (date) => `Nie później niż ${date}`,
  mustBeBetween: (startDate, endDate) => `Pomiędzy ${startDate} - ${endDate}`,
  dateIsDisabled: 'Niedozwolona data',
  previous: 'Poprzedni',
  next: 'Dalej',
  typeInDate: 'Wpisz datę',
  pickDateFromCalendar: 'Wybierz datę z kalendarza',
  close: 'Zamknij',
  minute: 'Minuta',
  hour: 'Godzina',
}
export default pl
