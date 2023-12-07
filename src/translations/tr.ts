import type { TranslationsType } from './utils'

const tr: TranslationsType = {
  save: 'Kaydet',
  selectSingle: 'Tarih seç',
  selectMultiple: 'Tarihleri seç',
  selectRange: 'Periyot seç',
  notAccordingToDateFormat: (inputFormat) =>
    `Tarih formatı ${inputFormat} olmalı`,
  mustBeHigherThan: (date) => `${date} tarihinden sonra olmalı`,
  mustBeLowerThan: (date) => `${date} tarihinden önce olmalı`,
  mustBeBetween: (startDate, endDate) =>
    `${startDate} - ${endDate} tarihleri arasında olmalı`,
  dateIsDisabled: 'Gün seçilemez',
  previous: 'Önceki',
  next: 'Sonraki',
  typeInDate: 'Tarihi yazın',
  pickDateFromCalendar: 'Takvimden tarih seçin',
  close: 'Kapat',
  minute: 'Dakika',
  hour: 'Saat',
}
export default tr
