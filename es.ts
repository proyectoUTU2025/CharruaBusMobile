import { TranslationsType } from 'react-native-paper-dates';

const es: TranslationsType = {
  save: 'Guardar',
  selectSingle: 'Selecciona una fecha',
  selectMultiple: 'Selecciona múltiples fechas',
  selectRange: 'Selecciona un rango',
  notAccordingToDateFormat: (inputFormat: string) =>
    `El formato debe ser ${inputFormat}`,
  mustBeHigherThan: (date: string) =>
    `Debe ser posterior a ${date}`,
  mustBeLowerThan: (date: string) =>
    `Debe ser anterior a ${date}`,
  mustBeBetween: (startDate: string, endDate: string) =>
    `Debe estar entre ${startDate} y ${endDate}`,
  dateIsDisabled: 'Esta fecha no está permitida',
  previous: 'Anterior',
  next: 'Siguiente',
  typeInDate: 'Ingresa la fecha',
  pickDateFromCalendar: 'Selecciona una fecha del calendario',
  close: 'Cerrar',
  hour: 'Hora',
  minute: 'Minuto',
};

export default es;
