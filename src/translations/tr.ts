import type { TranslationsType } from './utils'

const tr: TranslationsType = {
  am: 'ÖÖ',
  close: 'Kapat',
  dateIsDisabled: 'Gün seçilemez',
  hour: 'Saat',
  minute: 'Dakika',
  mustBeBetween: (startDate, endDate) =>
    `${startDate} - ${endDate} tarihleri arasında olmalı`,
  mustBeHigherThan: (date) => `${date} tarihinden sonra olmalı`,
  mustBeLowerThan: (date) => `${date} tarihinden önce olmalı`,
  next: 'Sonraki',
  notAccordingToDateFormat: (inputFormat) =>
    `Tarih formatı ${inputFormat} olmalı`,
  pickDateFromCalendar: 'Takvimden tarih seçin',
  pm: 'ÖS',
  previous: 'Önceki',
  save: 'Kaydet',
  selectMultiple: 'Tarihleri seç',
  selectRange: 'Periyot seç',
  selectSingle: 'Tarih seç',
  toggleKeyboard: 'Klavyeyi değiştir',
  typeInDate: 'Tarihi yazın',
}
export default tr
