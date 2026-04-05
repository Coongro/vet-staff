/**
 * Hook para cargar un profesional veterinario individual con datos de staff/contacto.
 */
import { getHostReact, actions } from '@coongro/plugin-sdk';
import type { StaffMember } from '@coongro/staff';

import type { VetProfessional } from '../types/vet-professional.js';

const React = getHostReact();
const { useState, useEffect, useCallback, useRef } = React;

export interface VetProfessionalDetail extends VetProfessional {
  staff?: StaffMember;
}

export function useVetProfessional(professionalId: string | undefined) {
  const [data, setData] = useState<VetProfessionalDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const load = useCallback(async () => {
    if (!professionalId) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await actions.execute<VetProfessional>('vet-staff.professionals.getById', {
        id: professionalId,
      });
      if (!mountedRef.current) return;

      if (!result) {
        setError('Profesional no encontrado');
        setData(null);
        setLoading(false);
        return;
      }

      // Resolver staff member para obtener datos de contacto
      let staff: StaffMember | undefined;
      try {
        staff = await actions.execute<StaffMember>('staff.members.getById', {
          id: result.staff_id,
        });
      } catch {
        // Si falla, seguimos sin datos de staff
      }

      if (!mountedRef.current) return;

      setData({
        ...result,
        staff_name: staff?.contact_name ?? 'Desconocido',
        staff_email: staff?.contact_email ?? null,
        staff_role: staff?.role ?? null,
        staff,
      });
    } catch (err) {
      if (!mountedRef.current) return;
      setError(err instanceof Error ? err.message : 'Error al cargar el profesional');
      setData(null);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [professionalId]);

  useEffect(() => {
    void load();
  }, [load]);

  return { data, loading, error, refetch: load };
}
