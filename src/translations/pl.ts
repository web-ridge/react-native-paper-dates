import { registerTranslation, type TranslationsType } from './utils'

const pl: TranslationsType = {
  am: 'AM',
  cancel: 'Anuluj',
  close: 'Zamknij',
  confirm: 'OK',
  dateIsDisabled: 'Niedozwolona data',
  enterDate: 'Wpisz datę',
  enterDates: 'Wpisz daty',
  hour: 'Godzina',
  hourOf: (hour, total) => `Godzina ${hour} z ${total}`,
  invalidTime: 'Nieprawidłowa godzina',
  minute: 'Minuta',
  minuteOf: (minute, total) => `Minuta ${minute} z ${total}`,
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
  toggleClock: 'Przełącz zegar',
  toggleKeyboard: 'Przełącz klawiaturę',
  typeInDate: 'Wpisz datę',
}

export default pl

registerTranslation('pl', pl)
