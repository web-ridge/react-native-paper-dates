import { registerTranslation, type TranslationsType } from './utils'

const th: TranslationsType = {
  am: 'AM',
  cancel: 'ยกเลิก',
  close: 'ปิด',
  confirm: 'ตกลง',
  dateIsDisabled: 'ไม่สามารถใช้วันที่นี้ได้',
  enterDate: 'ป้อนวันที่',
  enterDates: 'ป้อนวันที่',
  hour: 'ชั่วโมง',
  hourOf: (hour, total) => `ชั่วโมง ${hour} จาก ${total}`,
  invalidTime: 'เวลาไม่ถูกต้อง',
  minute: 'นาที',
  minuteOf: (minute, total) => `นาที ${minute} จาก ${total}`,
  mustBeBetween: (startDate, endDate) =>
    `ต้องอยู่ในช่วงวันที่ ${startDate} - ${endDate}`,
  mustBeHigherThan: (date) => `ต้องอยู่ภายหลังวันที่ ${date}`,
  mustBeLowerThan: (date) => `ต้องอยู่ก่อนวันที่ ${date}`,
  next: 'ถัดไป',
  notAccordingToDateFormat: (inputFormat) => `รูปแบบวันที่จะต้องเป็น ${inputFormat}`,
  pickDateFromCalendar: 'เลือกวันที่จากปฏิทิน',
  pm: 'PM',
  previous: 'ก่อนหน้า',
  save: 'บันทึก',
  selectMultiple: 'เลือกวันที่',
  selectRange: 'เลือกช่วงวันที่',
  selectSingle: 'เลือกวันที่',
  toggleClock: 'สลับนาฬิกา',
  toggleKeyboard: 'สลับแป้นพิมพ์',
  toggleScroll: 'สลับการเลื่อน',
  typeInDate: 'พิมพ์วันที่',
}

export default th

registerTranslation('th', th)
