import type { TranslationsType } from './utils'

const de: TranslationsType = {
    save: 'Speichern',
    selectSingle: 'Wähle Datum',
    selectMultiple: 'Wähle Daten',
    selectRange: 'Wähle Zeitspanne',
    notAccordingToDateFormat: (inputFormat: string) =>
      `Das Format sollte ${inputFormat} sein`,
    mustBeHigherThan: 'Muss später sein als',
    mustBeLowerThan: 'Muss früher sein als',
    mustBeBetween: 'Muss in dieser Zeitspanne liegen',
    dateIsDisabled: 'Datum nicht wählbar',
    previous: 'Vorheriges',
    next: 'Nächstes',
    typeInDate: 'Datum eingeben',
    pickDateFromCalendar: 'Datum vom Kalender auswählen',
    close: 'Schliessen',
}
export default nl
