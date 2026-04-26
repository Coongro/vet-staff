import { sql } from 'drizzle-orm';
import { boolean, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const vetProfessionalTable = pgTable('module_vet_staff_vet_professionals', {
  id: text('id')
    .primaryKey()
    .notNull()
    .default(sql`gen_random_uuid()`),
  staff_id: text('staff_id').notNull(),
  license_number: text('license_number').notNull(),
  license_college: text('license_college'),
  specialty: text('specialty'),
  senasa_number: text('senasa_number'),
  is_active: boolean('is_active').notNull(),
  created_at: timestamp('created_at', { mode: 'string' })
    .notNull()
    .default(sql`now()`),
  updated_at: timestamp('updated_at', { mode: 'string' })
    .notNull()
    .default(sql`now()`)
    .$onUpdate(() => new Date().toISOString()),
});

export type VetProfessionalRow = typeof vetProfessionalTable.$inferSelect;
export type NewVetProfessionalRow = typeof vetProfessionalTable.$inferInsert;
