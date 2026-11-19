import { registerTranslation, type TranslationsType } from './utils'

const pt: TranslationsType = {
  am: 'AM',
  cancel: 'Cancelar',
  close: 'Fechar',
  confirm: 'OK',
  dateIsDisabled: 'Data não é permitida',
  enterDate: 'Introduzir data',
  enterDates: 'Introduzir datas',
  hour: 'Hora',
  hourOf: (hour, total) => `Hora ${hour} de ${total}`,
  invalidTime: 'Hora inválida',
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
  toggleScroll: 'Alternar rolagem',
  typeInDate: 'Digite a data',
}

export default pt

registerTranslation('pt', pt)
