import type { TranslationsType } from './utils'

const id: TranslationsType = {
  save: 'Simpan',
  selectSingle: 'Pilih tanggal',
  selectMultiple: 'Pilih tanggal',
  selectRange: 'Pilih periode',
  notAccordingToDateFormat: (inputFormat) =>
    `Format tanggal harus ${inputFormat}`,
  mustBeHigherThan: (date) => `Harus lebih besar dari ${date}`,
  mustBeLowerThan: (date) => `Harus lebih kecil dari ${date}`,
  mustBeBetween: (startDate, endDate) =>
    `Harus di antara ${startDate} - ${endDate}`,
  dateIsDisabled: 'Hari tidak diperbolehkan',
  previous: 'Sebelumnya',
  next: 'Berikutnya',
  typeInDate: 'Ketik tanggal',
  pickDateFromCalendar: 'Pilih tanggal dari kalender',
  close: 'Tutup',
  minute: 'Menit',
  hour: 'Jam',
}
export default id
