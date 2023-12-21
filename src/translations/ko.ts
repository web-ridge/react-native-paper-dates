import type { TranslationsType } from './utils'

const ko: TranslationsType = {
  save: '저장',
  selectSingle: '날짜 선택',
  selectMultiple: '여러 날짜 선택',
  selectRange: '기간 선택',
  notAccordingToDateFormat: (inputFormat) =>
    `날짜 형식은 ${inputFormat}가 되어야 합니다`,
  mustBeHigherThan: (date) => `${date} 보다 커야 합니다`,
  mustBeLowerThan: (date) => `${date} 보다 작아야 합니다`,
  mustBeBetween: (startDate, endDate) =>
    `${startDate} - ${endDate} 사이여야 합니다`,
  dateIsDisabled: '날짜는 허용되지 않습니다',
  previous: '이전',
  next: '다음',
  typeInDate: '날짜 입력',
  pickDateFromCalendar: '달력에서 날짜 선택',
  close: '닫기',
  minute: '분',
  hour: '시',
}
export default ko
