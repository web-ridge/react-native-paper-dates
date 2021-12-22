import type { TranslationsType } from './utils'

const pt: TranslationsType = {
  save: 'Salvar',
  selectSingle: 'Selecione a data',
  selectMultiple: 'Selecione as datas',
  selectRange: 'Selecione o período',
  notAccordingToDateFormat: (inputFormat: string) =>
    `O formato da data deve ser ${inputFormat}`,
  mustBeHigherThan: 'Deve ser depois de',
  mustBeLowerThan: 'Deve ser antes de',
  mustBeBetween: 'Deve estar entre',
  dateIsDisabled: 'Data não é permitida',
  previous: 'Anterior',
  next: 'Próximo',
  typeInDate: 'Digite a data',
  pickDateFromCalendar: 'Escolha a data do calendário',
  close: 'Fechar',
}
export default pt
