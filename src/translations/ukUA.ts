import { registerTranslation, type TranslationsType } from './utils'

const ukUA: TranslationsType = {
  am: 'дп',
  cancel: 'Скасувати',
  close: 'Закрити',
  confirm: 'ОК',
  dateIsDisabled: 'Цей день не дозволено обирати',
  enterDate: 'Введіть дату',
  enterDates: 'Введіть дати',
  hour: 'Година',
  hourOf: (hour, total) => `Година ${hour} з ${total}`,
  invalidTime: 'Неприпустимий час',
  minute: 'Хвилина',
  minuteOf: (minute, total) => `Хвилина ${minute} з ${total}`,
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
  toggleClock: 'Перемкнути годинник',
  toggleKeyboard: 'Перемкнути клавіатуру',
  toggleScroll: 'Перемкнути прокрутку',
  typeInDate: 'Введіть дату',
}

export default ukUA

registerTranslation('uk-UA', ukUA)
