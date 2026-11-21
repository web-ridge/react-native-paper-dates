import { registerTranslation, type TranslationsType } from './utils'

const fi: TranslationsType = {
  am: 'ap.',
  cancel: 'Peruuta',
  close: 'Sulje',
  confirm: 'OK',
  dateIsDisabled: 'Päivä ei ole sallittu',
  endDate: 'Päättymispäivä',
  enterDate: 'Anna päivämäärä',
  enterDates: 'Anna päivämäärät',
  hour: 'Tunti',
  hourOf: (hour, total) => `Tunti ${hour} / ${total}`,
  invalidTime: 'Virheellinen aika',
  minute: 'Minuutti',
  minuteOf: (minute, total) => `Minuutti ${minute} / ${total}`,
  mustBeBetween: (startDate, endDate) =>
    `Oltava välillä ${startDate} - ${endDate}`,
  mustBeHigherThan: (date) => `Oltava myöhempi kuin ${date}`,
  mustBeLowerThan: (date) => `Oltava aikaisempi kuin ${date}`,
  next: 'Seuraava',
  notAccordingToDateFormat: (inputFormat) =>
    `Päivämäärän on oltava muodossa ${inputFormat}`,
  pickDateFromCalendar: 'Valitse päivämäärä kalenterista',
  pm: 'ip.',
  previous: 'Edellinen',
  save: 'Tallenna',
  selectMultiple: 'Valitse päivämäärät',
  selectRange: 'Valitse ajanjakso',
  selectSingle: 'Valitse päivämäärä',
  startDate: 'Alkupäivä',
  toggleClock: 'Vaihda kelloon',
  toggleKeyboard: 'Vaihda näppäimistöä',
  toggleScroll: 'Vaihda vieritykseen',
  typeInDate: 'Syötä päivämäärä',
}

export default fi

registerTranslation('fi', fi)
