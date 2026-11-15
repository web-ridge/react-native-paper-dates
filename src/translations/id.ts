import type { TranslationsType } from './utils'

const id: TranslationsType = {
  am: 'AM',
  close: 'Tutup',
  dateIsDisabled: 'Hari tidak diperbolehkan',
  hour: 'Jam',
  hourOf: (hour, total) => `Jam ${hour} dari ${total}`,
  minute: 'Menit',
  minuteOf: (minute, total) => `Menit ${minute} dari ${total}`,
  mustBeBetween: (startDate, endDate) =>
    `Harus di antara ${startDate} - ${endDate}`,
  mustBeHigherThan: (date) => `Harus lebih besar dari ${date}`,
  mustBeLowerThan: (date) => `Harus lebih kecil dari ${date}`,
  next: 'Berikutnya',
  notAccordingToDateFormat: (inputFormat) =>
    `Format tanggal harus ${inputFormat}`,
  pickDateFromCalendar: 'Pilih tanggal dari kalender',
  pm: 'PM',
  previous: 'Sebelumnya',
  save: 'Simpan',
  selectMultiple: 'Pilih tanggal',
  selectRange: 'Pilih periode',
  selectSingle: 'Pilih tanggal',
  toggleClock: 'Alihkan jam',
  toggleKeyboard: 'Alihkan keyboard',
  typeInDate: 'Ketik tanggal',
}
export default id
