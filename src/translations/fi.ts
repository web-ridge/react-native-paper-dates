import type { TranslationsType } from './utils'

const fi: TranslationsType = {
  am: 'ap.',
  close: 'Sulje',
  dateIsDisabled: 'Päivä ei ole sallittu',
  hour: 'Tunti',
  minute: 'Minuutti',
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
  toggleKeyboard: 'Vaihda näppäimistöä',
  typeInDate: 'Syötä päivämäärä',
}
export default fi
