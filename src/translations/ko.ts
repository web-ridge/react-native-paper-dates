import { registerTranslation, type TranslationsType } from './utils'

const ko: TranslationsType = {
  am: '오전',
  cancel: '취소',
  close: '닫기',
  confirm: '확인',
  dateIsDisabled: '날짜는 허용되지 않습니다',
  enterDate: '날짜 입력',
  enterDates: '날짜 입력',
  hour: '시',
  hourOf: (hour, total) => `${hour}시 / ${total}`,
  invalidTime: '잘못된 시간',
  minute: '분',
  minuteOf: (minute, total) => `${minute}분 / ${total}`,
  mustBeBetween: (startDate, endDate) =>
    `${startDate} - ${endDate} 사이여야 합니다`,
  mustBeHigherThan: (date) => `${date} 보다 커야 합니다`,
  mustBeLowerThan: (date) => `${date} 보다 작아야 합니다`,
  next: '다음',
  notAccordingToDateFormat: (inputFormat) =>
    `날짜 형식은 ${inputFormat}가 되어야 합니다`,
  pickDateFromCalendar: '달력에서 날짜 선택',
  pm: '오후',
  previous: '이전',
  save: '저장',
  selectMultiple: '여러 날짜 선택',
  selectRange: '기간 선택',
  selectSingle: '날짜 선택',
  toggleClock: '시계로 전환',
  toggleKeyboard: '키보드 전환',
  toggleScroll: '스크롤로 전환',
  typeInDate: '날짜 입력',
}

export default ko

registerTranslation('ko', ko)
