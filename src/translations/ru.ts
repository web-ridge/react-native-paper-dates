import type { TranslationsType } from './utils'

const ru: TranslationsType = {
  am: 'ДП',
  close: 'Закрыть',
  dateIsDisabled: 'День не разрешён',
  hour: 'Час',
  minute: 'Минута',
  mustBeBetween: (startDate, endDate) =>
    `Должен быть между ${startDate} - ${endDate}`,
  mustBeHigherThan: (date) => `Должен быть позже, чем ${date}`,
  mustBeLowerThan: (date) => `Должен быть ранее, чем ${date}`,
  next: 'Следующий',
  notAccordingToDateFormat: (inputFormat) =>
    `Формат даты должен быть ${inputFormat}`,
  pickDateFromCalendar: 'Выбор даты из календаря',
  pm: 'ПП',
  previous: 'Предыдущий',
  save: 'Сохранить',
  selectMultiple: 'Выбор дат',
  selectRange: 'Выбор диапазона',
  selectSingle: 'Выбор даты',
  toggleKeyboard: 'Переключить клавиатуру',
  typeInDate: 'Ввод в дате',
}
export default ru
