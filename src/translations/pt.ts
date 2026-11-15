import type { TranslationsType } from './utils'

const pt: TranslationsType = {
  am: 'AM',
  close: 'Fechar',
  dateIsDisabled: 'Data não é permitida',
  hour: 'Hora',
  hourOf: (hour, total) => `Hora ${hour} de ${total}`,
  minute: 'Minuto',
  minuteOf: (minute, total) => `Minuto ${minute} de ${total}`,
  mustBeBetween: (startDate, endDate) =>
    `Deve estar entre ${startDate} - ${endDate}`,
  mustBeHigherThan: (date) => `Deve ser depois de ${date}`,
  mustBeLowerThan: (date) => `Deve ser antes de ${date}`,
  next: 'Próximo',
  notAccordingToDateFormat: (inputFormat: string) =>
    `O formato da data deve ser ${inputFormat}`,
  pickDateFromCalendar: 'Escolha a data do calendário',
  pm: 'PM',
  previous: 'Anterior',
  save: 'Salvar',
  selectMultiple: 'Selecione as datas',
  selectRange: 'Selecione o período',
  selectSingle: 'Selecione a data',
  toggleClock: 'Alternar relógio',
  toggleKeyboard: 'Alternar teclado',
  typeInDate: 'Digite a data',
}
export default pt
