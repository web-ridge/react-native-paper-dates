import { registerTranslation, type TranslationsType } from './utils'

const ja: TranslationsType = {
  am: '午前',
  cancel: 'キャンセル',
  close: '閉じる',
  confirm: 'OK',
  dateIsDisabled: '日付は入力できません',
  enterDate: '日付を入力',
  enterDates: '日付を入力',
  hour: '時',
  hourOf: (hour, total) => `${hour} 時 / ${total}`,
  minute: '分',
  minuteOf: (minute, total) => `${minute} 分 / ${total}`,
  mustBeBetween: (startDate, endDate) =>
    `${startDate} - ${endDate}の範囲で入力してください`,
  mustBeHigherThan: (date) => `${date}より後にする必要があります`,
  mustBeLowerThan: (date) => `${date}より前にする必要があります`,
  next: '次へ',
  notAccordingToDateFormat: (inputFormat) =>
    `形式が無効です。使用：${inputFormat}`,
  pickDateFromCalendar: 'カレンダーから日付を選択',
  pm: '午後',
  previous: '前へ',
  save: '保存',
  selectMultiple: '日付を選択',
  selectRange: '期間を選択',
  selectSingle: '日付を選択',
  toggleClock: '時計に切り替え',
  toggleKeyboard: 'キーボードに切り替え',
  typeInDate: '日付を入力',
}

export default ja

registerTranslation('ja', ja)
