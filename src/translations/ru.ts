import type { TranslationsType } from './utils'

const ru: TranslationsType = {
  save: 'Сохранить',
  selectSingle: 'Выбор даты',
  selectMultiple: 'Выбор дат',
  selectRange: 'Выбор диапазона',
  notAccordingToDateFormat: (inputFormat) =>
    `Формат даты должен быть ${inputFormat}`,
  mustBeHigherThan: (date) => `Должен быть позже, чем ${date}`,
  mustBeLowerThan: (date) => `Должен быть ранее, чем ${date}`,
  mustBeBetween: (startDate, endDate) =>
    `Должен быть между ${startDate} - ${endDate}`,
  dateIsDisabled: 'День не разрешён',
  previous: 'Предыдущий',
  next: 'Следующий',
  typeInDate: 'Ввод в дате',
  pickDateFromCalendar: 'Выбор даты из календаря',
  close: 'Закрыть',
  hour: 'Час',
  minute: 'Минута',
}
export default ru
