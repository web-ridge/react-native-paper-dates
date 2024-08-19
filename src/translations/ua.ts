import type { TranslationsType } from './utils'

const ukUA: TranslationsType = {
  save: 'Зберегти',
  selectSingle: 'Оберіть дату',
  selectMultiple: 'Оберіть дати',
  selectRange: 'Оберіть період',
  notAccordingToDateFormat: (inputFormat: string) =>
    `Формат дати має бути ${inputFormat}`,
  mustBeHigherThan: (date: string) => `Має бути пізніше ніж ${date}`,
  mustBeLowerThan: (date: string) => `Має бути раніше ніж ${date}`,
  mustBeBetween: (startDate: string, endDate: string) =>
    `Має бути між ${startDate} - ${endDate}`,
  dateIsDisabled: 'Цей день не дозволено обирати',
  previous: 'Попередній',
  next: 'Наступний',
  typeInDate: 'Введіть дату',
  pickDateFromCalendar: 'Оберіть дату з календаря',
  close: 'Закрити',
  hour: 'Година',
  minute: 'Хвилина',
}
export default ukUA
