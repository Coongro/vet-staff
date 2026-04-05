import { getHostReact, getHostUI, usePlugin, actions } from '@coongro/plugin-sdk';
import { StaffBadge } from '@coongro/staff';

import { useVetProfessionals } from '../../hooks/useVetProfessionals.js';
import type { VetStaffSettings } from '../../hooks/useVetStaffSettings.js';
import { useVetStaffSettings } from '../../hooks/useVetStaffSettings.js';
import { DEFAULT_STAFF_ROLE } from '../../lib/constants.js';
import { SPECIALTIES, formatSpecialty } from '../../lib/specialties.js';
import type { VetProfessional } from '../../types/vet-professional.js';
import {
  ActiveToggle,
  LicenseFields,
  PersonalDataFields,
  SenasaField,
  SpecialtiesField,
} from '../shared/form-fields.js';

const React = getHostReact();
const UI = getHostUI();
const { useState, useCallback, useMemo } = React;
const h = React.createElement;

const SORTABLE_KEYS = new Set(['staff_name', 'specialty', 'license_number', 'is_active']);

// --- Formulario de creacion ---

interface CreateFormData {
  name: string;
  email: string;
  phone: string;
  license_number: string;
  license_college: string;
  specialties: string[];
  senasa_number: string;
  is_active: boolean;
}

const EMPTY_FORM: CreateFormData = {
  name: '',
  email: '',
  phone: '',
  license_number: '',
  license_college: '',
  specialties: [],
  senasa_number: '',
  is_active: true,
};

function CreateProfessionalDialog(props: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: VetStaffSettings;
  onCreated: () => void;
}) {
  const { open, onOpenChange, settings, onCreated } = props;
  const { toast } = usePlugin();

  const [form, setForm] = useState<CreateFormData>({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});

  const updateField = useCallback(
    <K extends keyof CreateFormData>(key: K, value: CreateFormData[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    },
    []
  );

  const validate = useCallback((): boolean => {
    const errs: Partial<Record<string, string>> = {};
    if (!form.name.trim()) errs.name = 'El nombre es obligatorio';
    if (settings.showLicense && !form.license_number.trim()) {
      errs.license_number = 'La matricula es obligatoria';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }, [form, settings]);

  const handleSave = useCallback(async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      // 1. Crear contacto (repos retornan array via .returning(), generan UUID internamente)
      const contacts = await actions.execute<Array<{ id: string }>>('contacts.create', {
        data: {
          name: form.name.trim(),
          email: form.email.trim() || null,
          phone: form.phone.trim() || null,
          type: 'person',
          is_active: form.is_active,
        },
      });
      const contactId = contacts[0]?.id;
      if (!contactId) throw new Error('No se pudo crear el contacto');

      // 2. Crear staff member
      const staffMembers = await actions.execute<Array<{ id: string }>>('staff.members.create', {
        data: {
          contact_id: contactId,
          role: DEFAULT_STAFF_ROLE,
          is_active: form.is_active,
        },
      });
      const staffId = staffMembers[0]?.id;
      if (!staffId) throw new Error('No se pudo crear el miembro de staff');

      // 3. Crear vet professional (DB genera UUID via gen_random_uuid())
      await actions.execute('vet-staff.professionals.create', {
        data: {
          staff_id: staffId,
          license_number: settings.showLicense ? form.license_number.trim() : '',
          license_college: settings.showLicense ? form.license_college.trim() || null : null,
          specialty:
            settings.showSpecialty && form.specialties.length > 0
              ? form.specialties.join(',')
              : null,
          senasa_number: settings.showSenasa ? form.senasa_number.trim() || null : null,
          is_active: form.is_active,
        },
      });

      toast.success('Creado', `${form.name.trim()} registrado como profesional`);
      setForm({ ...EMPTY_FORM });
      setErrors({});
      onOpenChange(false);
      onCreated();
    } catch (err) {
      toast.error('Error', err instanceof Error ? err.message : 'No se pudo crear el profesional');
    } finally {
      setSaving(false);
    }
  }, [form, validate, settings, onOpenChange, onCreated, toast]);

  const handleClose = useCallback(() => {
    if (!saving) {
      setForm({ ...EMPTY_FORM });
      setErrors({});
      onOpenChange(false);
    }
  }, [saving, onOpenChange]);

  return h(
    UI.FormDialog,
    {
      open,
      onOpenChange: handleClose,
      title: 'Nuevo profesional',
      size: 'md',
      footer: h(
        'div',
        { className: 'flex justify-end gap-3 w-full' },
        h(UI.Button, { variant: 'outline', onClick: handleClose, disabled: saving }, 'Cancelar'),
        h(
          UI.Button,
          { variant: 'brand', onClick: () => void handleSave(), disabled: saving },
          saving ? 'Guardando...' : 'Guardar'
        )
      ),
    },

    // Datos personales
    h(
      'div',
      { className: 'flex flex-col gap-4' },
      h(PersonalDataFields, {
        name: form.name,
        email: form.email,
        phone: form.phone,
        nameError: errors.name,
        onNameChange: (v: string) => updateField('name', v),
        onEmailChange: (v: string) => updateField('email', v),
        onPhoneChange: (v: string) => updateField('phone', v),
      }),

      // Datos profesionales (condicional por settings)
      settings.showLicense || settings.showSpecialty || settings.showSenasa
        ? h(UI.Separator, null)
        : null,

      settings.showLicense
        ? h(LicenseFields, {
            licenseNumber: form.license_number,
            licenseCollege: form.license_college,
            licenseError: errors.license_number,
            onLicenseNumberChange: (v: string) => updateField('license_number', v),
            onLicenseCollegeChange: (v: string) => updateField('license_college', v),
          })
        : null,
      settings.showSpecialty
        ? h(SpecialtiesField, {
            values: form.specialties,
            onValuesChange: (vals: string[]) => updateField('specialties', vals),
          })
        : null,
      settings.showSenasa
        ? h(SenasaField, {
            value: form.senasa_number,
            error: errors.senasa_number,
            onChange: (v: string) => updateField('senasa_number', v),
          })
        : null,

      h(UI.Separator, null),

      h(ActiveToggle, {
        checked: form.is_active,
        onCheckedChange: (checked: boolean) => updateField('is_active', checked),
      })
    )
  );
}

// --- Vista principal ---

export function ProfesionalesView() {
  const { views } = usePlugin();
  const { settings } = useVetStaffSettings();

  const { data, loading, error, setFilters, setSort, pagination, goToPage, refetch, stats } =
    useVetProfessionals({ pageSize: 20 });

  const [searchValue, setSearchValue] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortKey, setSortKey] = useState('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [dialogOpen, setDialogOpen] = useState(false);

  // Filtros
  const applyFilters = useCallback(
    (overrides: { query?: string; specialty?: string; isActive?: string }) => {
      setFilters({
        query: (overrides.query ?? searchValue) || undefined,
        specialty: (overrides.specialty ?? specialtyFilter) || undefined,
        isActive: (overrides.isActive ?? statusFilter) || undefined,
      });
    },
    [setFilters, searchValue, specialtyFilter, statusFilter]
  );

  const handleSearch = useCallback(
    (value: string) => {
      setSearchValue(value);
      applyFilters({ query: value });
    },
    [applyFilters]
  );

  const handleSpecialtyFilter = useCallback(
    (value: string) => {
      setSpecialtyFilter(value);
      applyFilters({ specialty: value });
    },
    [applyFilters]
  );

  const handleStatusFilter = useCallback(
    (value: string) => {
      setStatusFilter(value);
      applyFilters({ isActive: value });
    },
    [applyFilters]
  );

  const handleSort = useCallback(
    (key: string, direction: 'asc' | 'desc' | null) => {
      if (!SORTABLE_KEYS.has(key)) return;
      setSortKey(direction ? key : '');
      setSortDir(direction ?? 'asc');
      setSort(key, direction ?? 'asc');
    },
    [setSort]
  );

  // Columnas (condicional por settings)
  const columns = useMemo(() => {
    const cols: Array<{
      key: string;
      header: string;
      sortable?: boolean;
      render: (p: VetProfessional) => unknown;
    }> = [
      {
        key: 'staff_name',
        header: 'Profesional',
        sortable: true,
        render: (p: VetProfessional) =>
          h(StaffBadge, {
            staffId: p.staff_id,
            variant: 'default' as const,
            showStatus: false,
          }),
      },
    ];

    if (settings.showSpecialty) {
      cols.push({
        key: 'specialty',
        header: 'Especialidad',
        sortable: true,
        render: (p: VetProfessional) => {
          if (!p.specialty) return h('span', { style: { color: 'var(--cg-text-muted)' } }, '—');
          const specs = p.specialty.split(',');
          return h(
            'div',
            { className: 'flex flex-wrap gap-1' },
            ...specs.map((s) =>
              h(
                UI.Badge,
                { key: s, variant: 'warning-soft' as string, size: 'sm' },
                formatSpecialty(s)
              )
            )
          );
        },
      });
    }

    if (settings.showLicense) {
      cols.push({
        key: 'license_number',
        header: 'Matricula',
        sortable: true,
        render: (p: VetProfessional) =>
          h(
            'div',
            null,
            h('span', { className: 'font-medium text-sm' }, p.license_number),
            p.license_college
              ? h(
                  'div',
                  { className: 'text-xs', style: { color: 'var(--cg-text-muted)' } },
                  p.license_college
                )
              : null
          ),
      });
    }

    cols.push({
      key: 'is_active',
      header: 'Estado',
      sortable: true,
      render: (p: VetProfessional) =>
        h(
          UI.Badge,
          { variant: p.is_active ? 'success-soft' : ('secondary' as string), size: 'sm' },
          p.is_active ? 'Activo' : 'Inactivo'
        ),
    });

    return cols;
  }, [settings.showSpecialty, settings.showLicense]);

  // Mobile render
  const mobileRender = useCallback(
    (p: VetProfessional) =>
      h(
        'div',
        { className: 'flex flex-col gap-1' },
        h(StaffBadge, { staffId: p.staff_id, variant: 'compact' as const, showStatus: true }),
        h(
          'div',
          { className: 'flex items-center gap-2 mt-1' },
          settings.showSpecialty && p.specialty
            ? h(
                UI.Badge,
                { variant: 'warning-soft' as string, size: 'sm' },
                formatSpecialty(p.specialty.split(',')[0])
              )
            : null,
          settings.showLicense
            ? h(
                'span',
                { className: 'text-xs', style: { color: 'var(--cg-text-muted)' } },
                p.license_number + (p.license_college ? ' · ' + p.license_college : '')
              )
            : null
        ),
        !p.is_active
          ? h(
              'div',
              { className: 'mt-1' },
              h(UI.Badge, { variant: 'secondary' as string, size: 'sm' }, 'Inactivo')
            )
          : null
      ),
    [settings.showSpecialty, settings.showLicense]
  );

  const statsHeader = h(UI.StatCardRow, {
    cards: [
      { label: 'Total', value: stats.total },
      { label: 'Activos', value: stats.active },
      { label: 'Inactivos', value: stats.inactive },
    ],
    loading,
    skeletonCount: 3,
    layout: 'row',
  });

  const filterSections = useMemo(
    () => [
      {
        label: 'Estado',
        options: [
          { value: '', label: 'Todos' },
          { value: 'active', label: 'Activos' },
          { value: 'inactive', label: 'Inactivos' },
        ],
        value: statusFilter,
        onChange: handleStatusFilter,
      },
    ],
    [statusFilter, handleStatusFilter]
  );

  const specialtySelectSlot = settings.showSpecialty
    ? h(
        UI.Select,
        {
          value: specialtyFilter,
          onValueChange: handleSpecialtyFilter,
          placeholder: 'Especialidad',
          clearable: true,
        },
        ...SPECIALTIES.map((s) => h(UI.SelectItem, { key: s, value: s }, formatSpecialty(s)))
      )
    : null;

  const openDialog = useCallback(() => setDialogOpen(true), []);

  const handleRowClick = useCallback(
    (p: VetProfessional) => {
      views.open('vet-staff.profesionales-detail.open', { professionalId: p.id });
    },
    [views]
  );

  return h(
    'div',
    { className: 'min-h-screen bg-cg-bg-secondary p-6' },
    h(
      'div',
      { className: 'w-full flex flex-col gap-6' },

      // Header
      h(
        'div',
        { className: 'flex items-center justify-between' },
        h(
          'div',
          null,
          h('h1', { className: 'text-2xl font-bold text-cg-text' }, 'Personal'),
          h(
            'p',
            { className: 'text-sm text-cg-text-muted mt-1' },
            'Profesionales veterinarios del equipo'
          )
        ),
        h(
          UI.Button,
          { variant: 'brand', onClick: openDialog },
          h(UI.DynamicIcon, { icon: 'Plus', size: 16 }),
          ' Nuevo profesional'
        )
      ),

      // Stats
      statsHeader,

      // DataTable
      h(
        'div',
        { className: 'bg-cg-bg rounded-xl border border-cg-border p-6 shadow-sm' },
        h(UI.DataTable, {
          data,
          rowKey: (p: VetProfessional) => p.id,
          loading,
          error: error ?? undefined,
          onRetry: () => refetch(),
          onRowClick: handleRowClick,
          columns,
          searchPlaceholder: 'Buscar por nombre o matricula...',
          searchValue,
          onSearchChange: handleSearch,
          filterSections,
          filterRightSlot: specialtySelectSlot,
          sortKey: sortKey || null,
          sortDirection: sortDir,
          onSortChange: handleSort,
          pagination: {
            page: pagination.page,
            pageSize: pagination.pageSize,
            total: pagination.total,
          },
          onPageChange: goToPage,
          emptyState: {
            title: 'No hay profesionales aun',
            description:
              'Agrega tu primer profesional veterinario para gestionar matriculas y especialidades.',
            icon: h(UI.DynamicIcon, { icon: 'Stethoscope', size: 24 }),
            action: h(
              UI.Button,
              { variant: 'brand', onClick: openDialog },
              h(UI.DynamicIcon, { icon: 'Plus', size: 16 }),
              ' Nuevo profesional'
            ),
            filteredTitle: 'No se encontraron profesionales',
            filteredDescription: 'Prueba con otros terminos o ajusta los filtros.',
          },
          mobileRender,
        })
      )
    ),

    // Dialog de creacion
    h(CreateProfessionalDialog, {
      open: dialogOpen,
      onOpenChange: setDialogOpen,
      settings,
      onCreated: () => void refetch(),
    })
  );
}
