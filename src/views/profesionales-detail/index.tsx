/**
 * Vista de detalle de un profesional veterinario.
 * Muestra perfil, datos profesionales, especialidades.
 * Permite editar y eliminar.
 */
import { getHostReact, getHostUI, usePlugin, actions } from '@coongro/plugin-sdk';

import { useVetProfessional } from '../../hooks/useVetProfessional.js';
import { useVetStaffSettings } from '../../hooks/useVetStaffSettings.js';
import { SPECIALTIES, formatSpecialty } from '../../lib/specialties.js';
import type { VetProfessional } from '../../types/vet-professional.js';

const React = getHostReact();
const UI = getHostUI();
const { useState, useCallback, useEffect } = React;
const h = React.createElement;

// --- useIsMobile local (no depende de version de plugin-sdk) ---

function useIsMobile(threshold = 1024): boolean {
  const [mobile, setMobile] = useState(() => window.innerWidth < threshold);
  useEffect(() => {
    const handler = () => setMobile(window.innerWidth < threshold);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, [threshold]);
  return mobile;
}

// --- Utilidades ---

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return iso;
  }
}

function formatDateShort(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return iso;
  }
}

// --- Colores de avatar por inicial ---

const AVATAR_COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F97316', '#EC4899', '#06B6D4'];

function avatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

// --- Componente de detalle ---

function ProfessionalDetail(props: {
  professionalId: string;
  onBack: () => void;
  onEdit: (p: VetProfessional) => void;
  onDeleted: () => void;
  refreshKey: number;
}) {
  const { professionalId, onBack, onEdit, onDeleted, refreshKey } = props;
  const { toast } = usePlugin();
  const { settings } = useVetStaffSettings();
  const { data, loading, error, refetch } = useVetProfessional(professionalId);
  const isMobile = useIsMobile(1024);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Re-fetch cuando cambia el refreshKey (despues de editar)
  React.useEffect(() => {
    if (refreshKey > 0) void refetch();
  }, [refreshKey, refetch]);

  const handleDelete = useCallback(async () => {
    if (!data) return;
    setDeleting(true);
    try {
      await actions.execute('vet-staff.professionals.delete', { id: data.id });
      toast.success('Eliminado', `${data.staff_name ?? 'Profesional'} fue eliminado`);
      onDeleted();
    } catch (err) {
      toast.error('Error', err instanceof Error ? err.message : 'No se pudo eliminar');
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  }, [data, toast, onDeleted]);

  // Loading skeleton
  if (loading) {
    return h(
      'div',
      { className: 'flex flex-col gap-4' },
      h(
        'div',
        { className: 'flex items-center gap-3' },
        h(UI.Skeleton, { className: 'w-9 h-9 rounded-lg' }),
        h(
          'div',
          { className: 'flex-1' },
          h(UI.Skeleton, { className: 'h-5 w-40 mb-2' }),
          h(
            'div',
            { className: 'flex gap-2' },
            h(UI.Skeleton, { className: 'h-4 w-16 rounded-full' }),
            h(UI.Skeleton, { className: 'h-3 w-24' })
          )
        ),
        !isMobile
          ? h(
              'div',
              { className: 'flex gap-2' },
              h(UI.Skeleton, { className: 'h-9 w-24 rounded-lg' }),
              h(UI.Skeleton, { className: 'h-9 w-24 rounded-lg' })
            )
          : h(UI.Skeleton, { className: 'w-9 h-9 rounded-lg' })
      ),
      // Profile skeleton
      h(
        UI.Card,
        null,
        h(
          'div',
          {
            className: 'flex items-center gap-3 p-4',
            style: isMobile
              ? undefined
              : { flexDirection: 'column' as const, padding: '28px 24px 20px' },
          },
          h(UI.Skeleton, {
            className: isMobile ? 'w-14 h-14 rounded-full' : 'w-[72px] h-[72px] rounded-full',
          }),
          h(
            'div',
            { className: 'flex-1' },
            h(UI.Skeleton, { className: 'h-5 w-36 mb-2' }),
            h(UI.Skeleton, { className: 'h-3 w-20' })
          )
        )
      ),
      // Data skeleton
      h(
        UI.Card,
        null,
        h(UI.CardBody, null, h(UI.Skeleton, { className: 'h-4 w-40 mb-4' })),
        ...[0, 1, 2, 3].map((i) =>
          h(
            'div',
            {
              key: i,
              style: {
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 16px',
                borderTop: '1px solid var(--cg-border)',
              },
            },
            h(UI.Skeleton, { className: 'h-3 w-20' }),
            h(UI.Skeleton, { className: 'h-4 w-24' })
          )
        )
      )
    );
  }

  // Error
  if (error) {
    return h(UI.ErrorDisplay, {
      title: 'Error al cargar',
      message: error,
      onRetry: refetch,
    });
  }

  // No data
  if (!data) {
    return h(UI.EmptyState, {
      title: 'Profesional no encontrado',
      description: 'El registro puede haber sido eliminado.',
      icon: h(UI.DynamicIcon, { icon: 'UserX', size: 24 }),
      action: h(UI.Button, { variant: 'outline', onClick: onBack }, 'Volver a la lista'),
    });
  }

  const name = data.staff_name ?? 'Desconocido';
  const initials = getInitials(name);
  const color = data.is_active ? avatarColor(name) : '#D1D5DB';
  const specs = data.specialty ? data.specialty.split(',').filter(Boolean) : [];

  // --- Shared sub-components ---

  const deleteConfirmation = confirmDelete
    ? h(
        'div',
        {
          className: 'rounded-lg border p-4',
          style: { background: 'var(--cg-danger-bg, #FEF2F2)', borderColor: '#FECACA' },
        },
        h(
          'div',
          { className: 'text-sm text-cg-danger mb-3' },
          h('strong', null, `Eliminar a ${name}?`),
          ' Se eliminara el registro profesional. El contacto y empleado se mantienen.'
        ),
        h(
          'div',
          { style: { display: 'flex', gap: 8 } },
          h(
            UI.Button,
            {
              variant: 'outline',
              size: 'sm',
              onClick: () => setConfirmDelete(false),
              disabled: deleting,
              className: 'flex-1',
            },
            'Cancelar'
          ),
          h(
            UI.Button,
            {
              variant: 'destructive',
              size: 'sm',
              onClick: () => void handleDelete(),
              disabled: deleting,
              className: 'flex-1',
            },
            deleting ? 'Eliminando...' : 'Eliminar'
          )
        )
      )
    : null;

  const specialtiesCard = h(
    UI.Card,
    null,
    h(
      UI.CardBody,
      { style: { paddingBottom: specs.length > 0 ? 0 : undefined } },
      h(
        'div',
        { className: 'flex items-center gap-2 text-sm font-bold mb-4' },
        h(UI.DynamicIcon, { icon: 'Award', size: 14, style: { color: 'var(--cg-text-muted)' } }),
        'Especialidades'
      ),
      specs.length > 0
        ? h(
            'div',
            { className: 'flex flex-wrap gap-2 pb-4' },
            ...specs.map((s) =>
              h(UI.Badge, { key: s, variant: 'warning-soft' }, formatSpecialty(s))
            )
          )
        : h('div', { className: 'text-sm text-cg-text-muted' }, 'Sin especialidades registradas')
    ),
    h(
      'div',
      {
        style: {
          display: 'flex',
          flexDirection: isMobile ? ('column' as const) : ('row' as const),
          gap: isMobile ? 4 : 24,
          fontSize: 12,
          padding: '12px 20px',
          color: 'var(--cg-text-muted)',
          borderTop: '1px solid var(--cg-border)',
        },
      },
      h(
        'div',
        { style: { display: 'flex', alignItems: 'center', gap: 6 } },
        h(UI.DynamicIcon, { icon: 'Clock', size: 12 }),
        `Registrado: ${formatDateShort(data.created_at)}`
      ),
      h(
        'div',
        { style: { display: 'flex', alignItems: 'center', gap: 6 } },
        h(UI.DynamicIcon, { icon: 'RefreshCw', size: 12 }),
        `Actualizado: ${formatDateShort(data.updated_at)}`
      )
    )
  );

  // =================================================================
  // HEADER (identico desktop y mobile — patron de consultations/patients)
  // =================================================================
  const header = h(
    'div',
    { className: 'flex items-center justify-between' },
    h(
      UI.Button,
      { variant: 'ghost', onClick: onBack, className: 'gap-1' },
      h(UI.DynamicIcon, { icon: 'ArrowLeft', size: 16 }),
      'Volver'
    ),
    h(
      'div',
      { className: 'flex gap-2 flex-shrink-0' },
      h(UI.Button, { variant: 'outline', size: 'sm', onClick: () => onEdit(data) }, 'Editar'),
      h(
        UI.Button,
        { variant: 'destructive', size: 'sm', onClick: () => setConfirmDelete(true) },
        'Eliminar'
      )
    )
  );

  // =================================================================
  // MOBILE: cards apiladas
  // =================================================================
  if (isMobile) {
    return h(
      'div',
      { style: { display: 'flex', flexDirection: 'column' as const, gap: 12 } },
      header,
      deleteConfirmation,

      // Perfil horizontal
      h(
        UI.Card,
        null,
        h(
          'div',
          { style: { display: 'flex', alignItems: 'center', gap: 14, padding: 16 } },
          h(
            'div',
            {
              style: {
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: color,
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 19,
                fontWeight: 600,
                color: '#fff',
              },
            },
            initials
          ),
          h(
            'div',
            { style: { flex: 1, minWidth: 0 } },
            h(
              'div',
              { style: { fontFamily: "'Noto Serif JP', serif", fontSize: 16, fontWeight: 700 } },
              name
            ),
            h(
              'div',
              { style: { fontSize: 12, color: 'var(--cg-text-muted)', marginTop: 2 } },
              data.staff_role ?? 'Veterinario'
            ),
            h(
              'div',
              { style: { marginTop: 6 } },
              h(
                UI.Badge,
                {
                  variant: data.is_active ? 'success-soft' : 'secondary',
                  size: 'sm',
                },
                data.is_active ? 'Activo' : 'Inactivo'
              )
            )
          )
        ),
        data.staff_email
          ? h(
              'div',
              {
                style: {
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '11px 16px',
                  borderTop: '1px solid var(--cg-border)',
                  fontSize: 13,
                },
              },
              h(UI.DynamicIcon, {
                icon: 'Mail',
                size: 13,
                style: { color: 'var(--cg-text-muted)' },
              }),
              h(
                'div',
                { style: { flex: 1, minWidth: 0, color: 'var(--cg-accent)' } },
                data.staff_email
              )
            )
          : null,
        data.staff?.contact_phone
          ? h(
              'div',
              {
                style: {
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '11px 16px',
                  borderTop: '1px solid var(--cg-border)',
                  fontSize: 13,
                },
              },
              h(UI.DynamicIcon, {
                icon: 'Phone',
                size: 13,
                style: { color: 'var(--cg-text-muted)' },
              }),
              h('div', { style: { flex: 1, minWidth: 0 } }, data.staff.contact_phone)
            )
          : null
      ),

      // Datos profesionales — filas key-value
      h(
        UI.Card,
        null,
        h(
          UI.CardBody,
          { style: { paddingBottom: 0 } },
          h(
            'div',
            { className: 'flex items-center gap-2 text-sm font-bold mb-3' },
            h(UI.DynamicIcon, {
              icon: 'Stethoscope',
              size: 13,
              style: { color: 'var(--cg-text-muted)' },
            }),
            'Datos profesionales'
          )
        ),
        ...[
          {
            label: 'Matricula',
            value: `${settings.licensePrefix} ${data.license_number}`,
            mono: true,
          },
          { label: 'Colegio emisor', value: data.license_college || '\u2014', mono: false },
          ...(settings.senasaEnabled
            ? [
                {
                  label: 'SENASA',
                  value: data.senasa_number || 'No registrado',
                  mono: !!data.senasa_number,
                },
              ]
            : []),
        ].map((row) =>
          h(
            'div',
            {
              key: row.label,
              style: {
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                padding: '12px 16px',
                borderTop: '1px solid var(--cg-border)',
              },
            },
            h('span', { style: { fontSize: 12, color: 'var(--cg-text-muted)' } }, row.label),
            h(
              'span',
              {
                style: {
                  fontSize: 14,
                  fontWeight: 500,
                  textAlign: 'right' as const,
                  fontFamily: row.mono ? "'Roboto Mono', monospace" : undefined,
                  color:
                    row.value === '\u2014' || row.value === 'No registrado'
                      ? 'var(--cg-text-muted)'
                      : undefined,
                },
              },
              row.value
            )
          )
        )
      ),

      specialtiesCard
    );
  }

  // =================================================================
  // DESKTOP: dos columnas
  // =================================================================
  return h(
    'div',
    { style: { display: 'flex', flexDirection: 'column' as const, gap: 20 } },
    header,
    deleteConfirmation,

    h(
      'div',
      {
        style: { display: 'grid', gridTemplateColumns: '320px 1fr', gap: 20, alignItems: 'start' },
      },

      // Left: Profile sidebar
      h(
        UI.Card,
        null,
        h(
          'div',
          {
            style: {
              display: 'flex',
              flexDirection: 'column' as const,
              alignItems: 'center',
              padding: '28px 24px 20px',
              borderBottom: '1px solid var(--cg-border)',
            },
          },
          h(
            'div',
            {
              style: {
                width: 72,
                height: 72,
                borderRadius: '50%',
                background: color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 24,
                fontWeight: 600,
                color: '#fff',
                marginBottom: 14,
              },
            },
            initials
          ),
          h(
            'div',
            {
              style: {
                fontFamily: "'Noto Serif JP', serif",
                fontSize: 17,
                fontWeight: 700,
                textAlign: 'center' as const,
              },
            },
            name
          ),
          h(
            'div',
            { style: { fontSize: 13, color: 'var(--cg-text-muted)', marginTop: 4 } },
            data.staff_role ?? 'Veterinario'
          ),
          h(
            'div',
            { style: { marginTop: 8 } },
            h(
              UI.Badge,
              {
                variant: data.is_active ? 'success-soft' : 'secondary',
                size: 'sm',
              },
              data.is_active ? 'Activo' : 'Inactivo'
            )
          )
        ),

        h(
          UI.CardBody,
          null,
          // Email
          data.staff_email
            ? h(
                'div',
                { style: { display: 'flex', gap: 10, padding: '10px 0' } },
                h(UI.DynamicIcon, {
                  icon: 'Mail',
                  size: 14,
                  style: { color: 'var(--cg-text-muted)', marginTop: 2 },
                }),
                h(
                  'div',
                  { style: { flex: 1, minWidth: 0 } },
                  h(
                    'div',
                    {
                      style: {
                        fontSize: 11,
                        fontWeight: 500,
                        color: 'var(--cg-text-muted)',
                        textTransform: 'uppercase' as const,
                        letterSpacing: 0.5,
                        marginBottom: 2,
                      },
                    },
                    'Email'
                  ),
                  h(
                    'div',
                    {
                      style: {
                        fontSize: 14,
                        color: 'var(--cg-accent)',
                        wordBreak: 'break-all' as const,
                      },
                    },
                    data.staff_email
                  )
                )
              )
            : null,
          // Telefono
          data.staff?.contact_phone
            ? h(
                'div',
                {
                  style: {
                    display: 'flex',
                    gap: 10,
                    padding: '10px 0',
                    ...(data.staff_email ? { borderTop: '1px solid var(--cg-border)' } : {}),
                  },
                },
                h(UI.DynamicIcon, {
                  icon: 'Phone',
                  size: 14,
                  style: { color: 'var(--cg-text-muted)', marginTop: 2 },
                }),
                h(
                  'div',
                  { style: { flex: 1, minWidth: 0 } },
                  h(
                    'div',
                    {
                      style: {
                        fontSize: 11,
                        fontWeight: 500,
                        color: 'var(--cg-text-muted)',
                        textTransform: 'uppercase' as const,
                        letterSpacing: 0.5,
                        marginBottom: 2,
                      },
                    },
                    'Telefono'
                  ),
                  h('div', { style: { fontSize: 14 } }, data.staff.contact_phone)
                )
              )
            : null,
          // Rol
          h(
            'div',
            {
              style: {
                display: 'flex',
                gap: 10,
                padding: '10px 0',
                ...(data.staff_email || data.staff?.contact_phone
                  ? { borderTop: '1px solid var(--cg-border)' }
                  : {}),
              },
            },
            h(UI.DynamicIcon, {
              icon: 'Briefcase',
              size: 14,
              style: { color: 'var(--cg-text-muted)', marginTop: 2 },
            }),
            h(
              'div',
              { style: { flex: 1, minWidth: 0 } },
              h(
                'div',
                {
                  style: {
                    fontSize: 11,
                    fontWeight: 500,
                    color: 'var(--cg-text-muted)',
                    textTransform: 'uppercase' as const,
                    letterSpacing: 0.5,
                    marginBottom: 2,
                  },
                },
                'Rol en staff'
              ),
              h('div', { style: { fontSize: 14 } }, data.staff_role ?? 'Veterinario')
            )
          ),
          // Fecha alta
          h(
            'div',
            {
              style: {
                display: 'flex',
                gap: 10,
                padding: '10px 0',
                borderTop: '1px solid var(--cg-border)',
              },
            },
            h(UI.DynamicIcon, {
              icon: 'Calendar',
              size: 14,
              style: { color: 'var(--cg-text-muted)', marginTop: 2 },
            }),
            h(
              'div',
              { style: { flex: 1, minWidth: 0 } },
              h(
                'div',
                {
                  style: {
                    fontSize: 11,
                    fontWeight: 500,
                    color: 'var(--cg-text-muted)',
                    textTransform: 'uppercase' as const,
                    letterSpacing: 0.5,
                    marginBottom: 2,
                  },
                },
                'Fecha de alta'
              ),
              h('div', { style: { fontSize: 14 } }, formatDate(data.created_at))
            )
          )
        )
      ),

      // Right: Professional data
      h(
        'div',
        { style: { display: 'flex', flexDirection: 'column' as const, gap: 20 } },

        // Bento card
        h(
          UI.Card,
          null,
          h(
            UI.CardBody,
            { style: { paddingBottom: 0 } },
            h(
              'div',
              { className: 'flex items-center gap-2 text-sm font-bold mb-4' },
              h(UI.DynamicIcon, {
                icon: 'Stethoscope',
                size: 14,
                style: { color: 'var(--cg-text-muted)' },
              }),
              'Datos profesionales'
            )
          ),
          h(
            'div',
            {
              style: {
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                borderTop: '1px solid var(--cg-border)',
              },
            },
            // Matricula
            h(
              'div',
              { style: { padding: '16px 20px', borderRight: '1px solid var(--cg-border)' } },
              h(
                'div',
                {
                  style: {
                    fontSize: 11,
                    fontWeight: 500,
                    color: 'var(--cg-text-muted)',
                    textTransform: 'uppercase' as const,
                    letterSpacing: 0.5,
                    marginBottom: 6,
                  },
                },
                'Matricula'
              ),
              h(
                'div',
                {
                  style: { fontSize: 15, fontWeight: 500, fontFamily: "'Roboto Mono', monospace" },
                },
                `${settings.licensePrefix} ${data.license_number}`
              )
            ),
            // Colegio
            h(
              'div',
              { style: { padding: '16px 20px', borderRight: '1px solid var(--cg-border)' } },
              h(
                'div',
                {
                  style: {
                    fontSize: 11,
                    fontWeight: 500,
                    color: 'var(--cg-text-muted)',
                    textTransform: 'uppercase' as const,
                    letterSpacing: 0.5,
                    marginBottom: 6,
                  },
                },
                'Colegio emisor'
              ),
              h(
                'div',
                { style: { fontSize: 15, fontWeight: 500 } },
                data.license_college || '\u2014'
              )
            ),
            // SENASA
            h(
              'div',
              { style: { padding: '16px 20px' } },
              h(
                'div',
                {
                  style: {
                    fontSize: 11,
                    fontWeight: 500,
                    color: 'var(--cg-text-muted)',
                    textTransform: 'uppercase' as const,
                    letterSpacing: 0.5,
                    marginBottom: 6,
                  },
                },
                'SENASA'
              ),
              settings.senasaEnabled
                ? h(
                    'div',
                    {
                      style: {
                        fontSize: 15,
                        fontWeight: 500,
                        ...(data.senasa_number
                          ? { fontFamily: "'Roboto Mono', monospace" }
                          : { color: 'var(--cg-text-muted)' }),
                      },
                    },
                    data.senasa_number || 'No registrado'
                  )
                : h(
                    'div',
                    { style: { fontSize: 13, color: 'var(--cg-text-muted)' } },
                    'No habilitado'
                  )
            )
          )
        ),

        // Especialidades
        specialtiesCard
      )
    )
  );
}

// --- Vista wrapper (orquesta navegacion y modales) ---

export function ProfesionalesDetailView(props: { professionalId?: string }) {
  const { views, toast } = usePlugin();
  const { settings } = useVetStaffSettings();
  const professionalId =
    props.professionalId ?? (views.params as Record<string, string>)?.professionalId;

  const [showEditDialog, setShowEditDialog] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Estado del formulario de edicion
  const [editData, setEditData] = useState<VetProfessional | null>(null);
  const [editForm, setEditForm] = useState({
    license_number: '',
    license_college: '',
    specialties: [] as string[],
    senasa_number: '',
    is_active: true,
  });
  const [editSaving, setEditSaving] = useState(false);
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});

  const handleBack = useCallback(() => {
    views.open('vet-staff.profesionales.open');
  }, [views]);

  const handleEdit = useCallback((p: VetProfessional) => {
    setEditData(p);
    setEditForm({
      license_number: p.license_number,
      license_college: p.license_college ?? '',
      specialties: p.specialty ? p.specialty.split(',').filter(Boolean) : [],
      senasa_number: p.senasa_number ?? '',
      is_active: p.is_active,
    });
    setEditErrors({});
    setShowEditDialog(true);
  }, []);

  const handleEditSave = useCallback(async () => {
    if (!editData) return;

    // Validar
    const errs: Record<string, string> = {};
    if (!editForm.license_number.trim()) errs.license_number = 'La matricula es obligatoria';
    if (settings.senasaEnabled && settings.senasaRequired && !editForm.senasa_number.trim()) {
      errs.senasa_number = 'El numero SENASA es obligatorio';
    }
    if (Object.keys(errs).length > 0) {
      setEditErrors(errs);
      return;
    }

    setEditSaving(true);
    try {
      await actions.execute('vet-staff.professionals.update', {
        id: editData.id,
        data: {
          license_number: editForm.license_number.trim(),
          license_college: editForm.license_college.trim() || null,
          specialty: editForm.specialties.length > 0 ? editForm.specialties.join(',') : null,
          senasa_number: editForm.senasa_number.trim() || null,
          is_active: editForm.is_active,
        },
      });
      toast.success('Actualizado', 'Los datos del profesional se guardaron correctamente');
      setShowEditDialog(false);
      setRefreshKey((k: number) => k + 1);
    } catch (err) {
      toast.error('Error', err instanceof Error ? err.message : 'No se pudo guardar');
    } finally {
      setEditSaving(false);
    }
  }, [editData, editForm, settings, toast]);

  const handleDeleted = useCallback(() => {
    views.open('vet-staff.profesionales.open');
  }, [views]);

  if (!professionalId) {
    return h(UI.EmptyState, {
      title: 'No se especifico un profesional',
      className: 'p-6',
    });
  }

  const updateEditField = (key: string, value: unknown) => {
    setEditForm((prev) => ({ ...prev, [key]: value }));
    setEditErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  return h(
    'div',
    { className: 'min-h-screen bg-cg-bg-secondary p-6' },
    h(
      'div',
      { className: 'w-full', style: { maxWidth: 1080, margin: '0 auto' } },
      h(ProfessionalDetail, {
        professionalId,
        onBack: handleBack,
        onEdit: handleEdit,
        onDeleted: handleDeleted,
        refreshKey,
      })
    ),

    // Dialog de edicion
    showEditDialog
      ? h(
          UI.FormDialog,
          {
            open: showEditDialog,
            onOpenChange: (open: boolean) => {
              if (!open && !editSaving) setShowEditDialog(false);
            },
            title: 'Editar profesional',
            size: 'md',
            footer: h(
              'div',
              { className: 'flex justify-end gap-3 w-full' },
              h(
                UI.Button,
                {
                  variant: 'outline',
                  onClick: () => setShowEditDialog(false),
                  disabled: editSaving,
                },
                'Cancelar'
              ),
              h(
                UI.Button,
                {
                  variant: 'brand',
                  onClick: () => void handleEditSave(),
                  disabled: editSaving,
                },
                editSaving ? 'Guardando...' : 'Guardar cambios'
              )
            ),
          },
          h(
            'div',
            { className: 'flex flex-col gap-4' },
            // Matricula + Colegio
            h(
              'div',
              { className: 'grid grid-cols-1 sm:grid-cols-2 gap-4' },
              h(
                'div',
                null,
                h(
                  'label',
                  { className: 'text-sm font-medium text-cg-text mb-1 block' },
                  'Matricula',
                  h('span', { className: 'text-cg-danger ml-0.5' }, '*')
                ),
                h(UI.Input, {
                  value: editForm.license_number,
                  onChange: (e: { target: { value: string } }) =>
                    updateEditField('license_number', e.target.value),
                  placeholder: 'Ej: 12345',
                }),
                editErrors.license_number
                  ? h('p', { className: 'text-xs text-cg-danger mt-1' }, editErrors.license_number)
                  : null
              ),
              h(
                'div',
                null,
                h(
                  'label',
                  { className: 'text-sm font-medium text-cg-text mb-1 block' },
                  'Colegio emisor'
                ),
                h(UI.Input, {
                  value: editForm.license_college,
                  onChange: (e: { target: { value: string } }) =>
                    updateEditField('license_college', e.target.value),
                  placeholder: 'Ej: CVPBA',
                })
              )
            ),

            // Especialidades
            h(
              'div',
              null,
              h(
                'label',
                { className: 'text-sm font-medium text-cg-text mb-1 block' },
                'Especialidades'
              ),
              h(
                UI.MultiSelect,
                {
                  values: editForm.specialties,
                  onValuesChange: (vals: string[]) => updateEditField('specialties', vals),
                  placeholder: 'Seleccionar especialidades...',
                },
                ...SPECIALTIES.map((s) =>
                  h(UI.SelectItem, { key: s, value: s }, formatSpecialty(s))
                )
              )
            ),

            // SENASA
            settings.senasaEnabled
              ? h(
                  'div',
                  null,
                  h(
                    'label',
                    { className: 'text-sm font-medium text-cg-text mb-1 block' },
                    'SENASA',
                    settings.senasaRequired
                      ? h('span', { className: 'text-cg-danger ml-0.5' }, '*')
                      : h('span', { className: 'text-cg-text-muted ml-1' }, '(opcional)')
                  ),
                  h(UI.Input, {
                    value: editForm.senasa_number,
                    onChange: (e: { target: { value: string } }) =>
                      updateEditField('senasa_number', e.target.value),
                    placeholder: 'Ej: 12345678',
                  }),
                  editErrors.senasa_number
                    ? h('p', { className: 'text-xs text-cg-danger mt-1' }, editErrors.senasa_number)
                    : null
                )
              : null,

            h(UI.Separator, null),

            // Toggle activo/inactivo
            h(
              'div',
              { className: 'flex items-center justify-between' },
              h(
                'div',
                null,
                h(
                  'span',
                  { className: 'text-sm font-medium text-cg-text block' },
                  'Profesional activo'
                ),
                h(
                  'span',
                  { className: 'text-xs text-cg-text-muted' },
                  'Los inactivos no aparecen en selectores ni agenda'
                )
              ),
              h(UI.Switch, {
                checked: editForm.is_active,
                onCheckedChange: (checked: boolean) => updateEditField('is_active', checked),
              })
            )
          )
        )
      : null
  );
}
