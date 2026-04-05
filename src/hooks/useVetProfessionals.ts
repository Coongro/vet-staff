/**
 * Hook para listar profesionales veterinarios con filtros, sort y paginacion.
 * Resuelve nombre del staff vinculado via staff.members.getById.
 */
import { getHostReact, actions } from '@coongro/plugin-sdk';
import type { StaffMember } from '@coongro/staff';

import type { VetProfessional } from '../types/vet-professional.js';

const React = getHostReact();
const { useState, useEffect, useCallback, useRef, useMemo } = React;

export interface VetProfessionalFilters {
  query?: string;
  specialty?: string;
  isActive?: string;
}

export type SortDirection = 'asc' | 'desc';

export interface UseVetProfessionalsOptions {
  pageSize?: number;
}

export function useVetProfessionals(options: UseVetProfessionalsOptions = {}) {
  const { pageSize = 20 } = options;

  const [rawData, setRawData] = useState<VetProfessional[]>([]);
  const [data, setData] = useState<VetProfessional[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<VetProfessionalFilters>({});
  const [sortKey, setSortKey] = useState<string>('');
  const [sortDir, setSortDir] = useState<SortDirection>('asc');
  const [page, setPage] = useState(1);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    // Safety timeout — fuerza fin de loading si todo cuelga
    const safetyTimer = setTimeout(() => {
      if (mountedRef.current) {
        setError('No se pudo conectar con el servidor');
        setRawData([]);
        setLoading(false);
      }
    }, 5000);

    try {
      const result = await actions.execute<VetProfessional[]>('vet-staff.professionals.list');
      clearTimeout(safetyTimer);
      if (!mountedRef.current) return;

      const list = Array.isArray(result) ? result : [];

      // Resolver nombres de staff en paralelo
      if (list.length > 0) {
        const staffIds = [...new Set(list.map((p) => p.staff_id))];
        const staffMap = new Map<string, StaffMember>();

        const staffResults = await Promise.allSettled(
          staffIds.map((id) => actions.execute<StaffMember>('staff.members.getById', { id }))
        );

        staffResults.forEach((r, i) => {
          if (r.status === 'fulfilled' && r.value) {
            staffMap.set(staffIds[i], r.value);
          }
        });

        const enriched = list.map((p) => {
          const staff = staffMap.get(p.staff_id);
          return {
            ...p,
            staff_name: staff?.contact_name ?? 'Desconocido',
            staff_email: staff?.contact_email ?? null,
            staff_role: staff?.role ?? null,
          };
        });

        if (mountedRef.current) setRawData(enriched);
      } else {
        if (mountedRef.current) setRawData([]);
      }
    } catch (err) {
      clearTimeout(safetyTimer);
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : 'Error al cargar profesionales');
        setRawData([]);
      }
    } finally {
      clearTimeout(safetyTimer);
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  // Filtrado + sort client-side
  useEffect(() => {
    let filtered = [...rawData];

    // Filtro por busqueda
    if (filters.query) {
      const q = filters.query.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          (p.staff_name ?? '').toLowerCase().includes(q) ||
          p.license_number.toLowerCase().includes(q) ||
          (p.specialty ?? '').toLowerCase().includes(q) ||
          (p.license_college ?? '').toLowerCase().includes(q)
      );
    }

    // Filtro por especialidad
    if (filters.specialty) {
      filtered = filtered.filter((p) => p.specialty === filters.specialty);
    }

    // Filtro por estado
    if (filters.isActive === 'active') {
      filtered = filtered.filter((p) => p.is_active);
    } else if (filters.isActive === 'inactive') {
      filtered = filtered.filter((p) => !p.is_active);
    }

    // Sort
    if (sortKey) {
      filtered.sort((a, b) => {
        const aVal = (a as unknown as Record<string, unknown>)[sortKey] ?? '';
        const bVal = (b as unknown as Record<string, unknown>)[sortKey] ?? '';
        const cmp = String(aVal).localeCompare(String(bVal));
        return sortDir === 'desc' ? -cmp : cmp;
      });
    }

    setData(filtered);
    setPage(1);
  }, [rawData, filters, sortKey, sortDir]);

  // Paginacion
  const total = data.length;
  const totalPages = Math.ceil(total / pageSize);
  const pagedData = useMemo(
    () => data.slice((page - 1) * pageSize, page * pageSize),
    [data, page, pageSize]
  );

  const setSort = useCallback((key: string, dir: SortDirection) => {
    setSortKey(key);
    setSortDir(dir);
  }, []);

  const goToPage = useCallback(
    (p: number) => {
      setPage(Math.max(1, Math.min(p, totalPages || 1)));
    },
    [totalPages]
  );

  // Stats
  const stats = useMemo(
    () => ({
      total: rawData.length,
      active: rawData.filter((p) => p.is_active).length,
      inactive: rawData.filter((p) => !p.is_active).length,
    }),
    [rawData]
  );

  return {
    data: pagedData,
    allData: data,
    loading,
    error,
    filters,
    setFilters,
    setSort,
    sortKey,
    sortDir,
    pagination: { page, pageSize, total, totalPages },
    goToPage,
    refetch: load,
    stats,
  };
}
