/**
 * @coongro/vet-staff — Entry point principal (browser-safe)
 *
 * Exportar aquí: hooks, componentes, tipos, utilidades.
 * NO exportar schema tables ni repositories (usan drizzle-orm, solo backend).
 * Para exports server-only → usar server.ts
 */

// Tipos
export type {
  VetProfessional,
  VetProfessionalCreateData,
  VetProfessionalUpdateData,
} from './types/vet-professional.js';

// Hooks
export { useVetProfessionals } from './hooks/useVetProfessionals.js';
export { useVetProfessional } from './hooks/useVetProfessional.js';
export type { VetProfessionalDetail } from './hooks/useVetProfessional.js';
export { useVetStaffSettings } from './hooks/useVetStaffSettings.js';

// Utilidades
export { SPECIALTIES, formatSpecialty } from './lib/specialties.js';
export type { Specialty } from './lib/specialties.js';
