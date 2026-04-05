/**
 * Lista de especialidades veterinarias comunes en Argentina.
 * Basada en CPMV y colegios profesionales provinciales.
 */
export const SPECIALTIES = [
  'clinica_medica',
  'cirugia',
  'dermatologia',
  'cardiologia',
  'oftalmologia',
  'oncologia',
  'traumatologia',
  'diagnostico_imagenes',
  'anestesiologia',
  'odontologia',
  'neurologia',
  'nutricion',
  'reproduccion',
  'medicina_felina',
  'comportamiento',
] as const;

export type Specialty = (typeof SPECIALTIES)[number];

const LABELS: Record<string, string> = {
  clinica_medica: 'Clinica Medica',
  cirugia: 'Cirugia',
  dermatologia: 'Dermatologia',
  cardiologia: 'Cardiologia',
  oftalmologia: 'Oftalmologia',
  oncologia: 'Oncologia',
  traumatologia: 'Traumatologia y Ortopedia',
  diagnostico_imagenes: 'Diagnostico por Imagenes',
  anestesiologia: 'Anestesiologia',
  odontologia: 'Odontologia',
  neurologia: 'Neurologia',
  nutricion: 'Nutricion Animal',
  reproduccion: 'Reproduccion',
  medicina_felina: 'Medicina Felina',
  comportamiento: 'Comportamiento Animal',
};

export function formatSpecialty(key: string): string {
  return LABELS[key] ?? key;
}
