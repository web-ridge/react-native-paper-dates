import { registerTranslation, type TranslationsType } from './utils'

const id: TranslationsType = {
  am: 'AM',
  cancel: 'Batal',
  close: 'Tutup',
  confirm: 'OK',
  dateIsDisabled: 'Hari tidak diperbolehkan',
  endDate: 'Tanggal selesai',
  enterDate: 'Masukkan tanggal',
  enterDates: 'Masukkan tanggal',
  hour: 'Jam',
  hourOf: (hour, total) => `Jam ${hour} dari ${total}`,
  invalidTime: 'Waktu tidak valid',
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
  startDate: 'Tanggal mulai',
  toggleClock: 'Alihkan jam',
  toggleKeyboard: 'Alihkan keyboard',
  toggleScroll: 'Alihkan gulir',
  typeInDate: 'Ketik tanggal',
}

export default id

registerTranslation('id', id)
