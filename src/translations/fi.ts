import { registerTranslation, type TranslationsType } from './utils'

const fi: TranslationsType = {
  am: 'ap.',
  cancel: 'Peruuta',
  close: 'Sulje',
  confirm: 'OK',
  dateIsDisabled: 'Päivä ei ole sallittu',
  enterDate: 'Anna päivämäärä',
  enterDates: 'Anna päivämäärät',
  hour: 'Tunti',
  hourOf: (hour, total) => `Tunti ${hour} / ${total}`,
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
  toggleClock: 'Vaihda kelloon',
  toggleKeyboard: 'Vaihda näppäimistöä',
  typeInDate: 'Syötä päivämäärä',
}

export default fi

registerTranslation('fi', fi)
