/**
 * @coongro/vet-staff — Exportaciones server-only
 *
 * Schema tables y repositories (dependen de drizzle-orm).
 * NO importar desde el browser — usar '@coongro/vet-staff' para hooks/componentes.
 */
export * from './schema/vet-professional.js';
export { VetProfessionalRepository } from './repositories/vet-professional.repository.js';
