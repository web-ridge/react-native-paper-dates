import type { TranslationsType } from './utils'

const pt: TranslationsType = {
  am: 'AM',
  close: 'Fechar',
  dateIsDisabled: 'Data não é permitida',
  hour: 'Hora',
  minute: 'Minuto',
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
  toggleKeyboard: 'Alternar teclado',
  typeInDate: 'Digite a data',
}
export default pt
