import type { ModuleDatabaseAPI } from '@coongro/plugin-sdk';
import { eq } from 'drizzle-orm';

import type { VetProfessionalRow, NewVetProfessionalRow } from '../schema/vet-professional.js';
import { vetProfessionalTable } from '../schema/vet-professional.js';

export class VetProfessionalRepository {
  constructor(private readonly db: ModuleDatabaseAPI) {}

  async list(): Promise<VetProfessionalRow[]> {
    return this.db.ormQuery((tx) => tx.select().from(vetProfessionalTable));
  }

  async getById({ id }: { id: string }): Promise<VetProfessionalRow | undefined> {
    const rows = await this.db.ormQuery((tx) =>
      tx.select().from(vetProfessionalTable).where(eq(vetProfessionalTable.id, id)).limit(1)
    );
    return rows[0];
  }

  async create({ data }: { data: NewVetProfessionalRow }): Promise<VetProfessionalRow[]> {
    return this.db.ormQuery((tx) => tx.insert(vetProfessionalTable).values(data).returning());
  }

  async update({
    id,
    data,
  }: {
    id: string;
    data: Partial<NewVetProfessionalRow>;
  }): Promise<VetProfessionalRow[]> {
    return this.db.ormQuery((tx) =>
      tx
        .update(vetProfessionalTable)
        .set({ ...data, updated_at: new Date().toISOString() })
        .where(eq(vetProfessionalTable.id, id))
        .returning()
    );
  }

  async delete({ id }: { id: string }): Promise<void> {
    await this.db.ormQuery((tx) =>
      tx.delete(vetProfessionalTable).where(eq(vetProfessionalTable.id, id))
    );
  }
}
