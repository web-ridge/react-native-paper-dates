import { registerTranslation, type TranslationsType } from './utils'

const ru: TranslationsType = {
  am: 'ДП',
  cancel: 'Отмена',
  close: 'Закрыть',
  confirm: 'ОК',
  dateIsDisabled: 'День не разрешён',
  enterDate: 'Введите дату',
  enterDates: 'Введите даты',
  hour: 'Час',
  hourOf: (hour, total) => `Час ${hour} из ${total}`,
  minute: 'Минута',
  minuteOf: (minute, total) => `Минута ${minute} из ${total}`,
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
  toggleClock: 'Переключить часы',
  toggleKeyboard: 'Переключить клавиатуру',
  typeInDate: 'Ввод в дате',
}

export default ru

registerTranslation('ru', ru)
