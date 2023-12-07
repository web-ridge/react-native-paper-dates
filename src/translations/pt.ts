import type { TranslationsType } from './utils'

const pt: TranslationsType = {
  save: 'Salvar',
  selectSingle: 'Selecione a data',
  selectMultiple: 'Selecione as datas',
  selectRange: 'Selecione o período',
  notAccordingToDateFormat: (inputFormat: string) =>
    `O formato da data deve ser ${inputFormat}`,
  mustBeHigherThan: (date) => `Deve ser depois de ${date}`,
  mustBeLowerThan: (date) => `Deve ser antes de ${date}`,
  mustBeBetween: (startDate, endDate) =>
    `Deve estar entre ${startDate} - ${endDate}`,
  dateIsDisabled: 'Data não é permitida',
  previous: 'Anterior',
  next: 'Próximo',
  typeInDate: 'Digite a data',
  pickDateFromCalendar: 'Escolha a data do calendário',
  close: 'Fechar',
  hour: 'Hora',
  minute: 'Minuto',
}
export default pt
