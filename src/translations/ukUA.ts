import type { TranslationsType } from './utils'

const ukUA: TranslationsType = {
  am: 'дп',
  close: 'Закрити',
  dateIsDisabled: 'Цей день не дозволено обирати',
  hour: 'Година',
  minute: 'Хвилина',
  mustBeBetween: (startDate: string, endDate: string) =>
    `Має бути між ${startDate} - ${endDate}`,
  mustBeHigherThan: (date: string) => `Має бути пізніше ніж ${date}`,
  mustBeLowerThan: (date: string) => `Має бути раніше ніж ${date}`,
  next: 'Наступний',
  notAccordingToDateFormat: (inputFormat: string) =>
    `Формат дати має бути ${inputFormat}`,
  pickDateFromCalendar: 'Оберіть дату з календаря',
  pm: 'пп',
  previous: 'Попередній',
  save: 'Зберегти',
  selectMultiple: 'Оберіть дати',
  selectRange: 'Оберіть період',
  selectSingle: 'Оберіть дату',
  toggleKeyboard: 'Перемкнути клавіатуру',
  typeInDate: 'Введіть дату',
}
export default ukUA
