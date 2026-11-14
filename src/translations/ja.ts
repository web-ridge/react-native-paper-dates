import type { TranslationsType } from './utils'

const ja: TranslationsType = {
  am: '午前',
  close: '閉じる',
  dateIsDisabled: '日付は入力できません',
  hour: '時',
  minute: '分',
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
  toggleKeyboard: 'キーボードに切り替え',
  typeInDate: '日付を入力',
}
export default ja
