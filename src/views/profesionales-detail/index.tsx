import { getHostReact, getHostUI, usePlugin, actions } from '@coongro/plugin-sdk';

import { useVetProfessional } from '../../hooks/useVetProfessional.js';
import { useVetStaffSettings } from '../../hooks/useVetStaffSettings.js';
import type { VetProfessional } from '../../types/vet-professional.js';

import { DeleteConfirmation } from './DeleteConfirmation.js';
import { DetailSkeleton } from './DetailSkeleton.js';
import { EditProfessionalDialog } from './EditProfessionalDialog.js';
import { ProfessionalDataDesktop, ProfessionalDataMobile } from './ProfessionalDataCard.js';
import { ProfileCardDesktop } from './ProfileCardDesktop.js';
import { ProfileCardMobile } from './ProfileCardMobile.js';
import { SpecialtiesCard } from './SpecialtiesCard.js';
import { BORDER_TOP, formatDateShort, useIsMobile } from './utils.js';

const React = getHostReact();
const UI = getHostUI();
const { useState, useCallback } = React;
const h = React.createElement;

// --- Timestamps (siempre visible) ---

function TimestampsFooter(props: { createdAt: string; updatedAt: string; isMobile: boolean }) {
  return h(
    'div',
    {
      style: {
        display: 'flex',
        flexDirection: props.isMobile ? ('column' as const) : ('row' as const),
        gap: props.isMobile ? 4 : 24,
        fontSize: 12,
        padding: '12px 0',
        color: 'var(--cg-text-muted)',
        borderTop: BORDER_TOP,
      },
    },
    h(
      'div',
      { style: { display: 'flex', alignItems: 'center', gap: 6 } },
      h(UI.DynamicIcon, { icon: 'Clock', size: 12 }),
      'Registrado: ' + formatDateShort(props.createdAt)
    ),
    h(
      'div',
      { style: { display: 'flex', alignItems: 'center', gap: 6 } },
      h(UI.DynamicIcon, { icon: 'RefreshCw', size: 12 }),
      'Actualizado: ' + formatDateShort(props.updatedAt)
    )
  );
}

// --- Header con navegacion y acciones ---

function DetailHeader(props: { onBack: () => void; onEdit: () => void; onDelete: () => void }) {
  return h(
    'div',
    { className: 'flex items-center justify-between' },
    h(
      UI.Button,
      { variant: 'ghost', onClick: props.onBack, className: 'gap-1' },
      h(UI.DynamicIcon, { icon: 'ArrowLeft', size: 16 }),
      'Volver'
    ),
    h(
      'div',
      { className: 'flex gap-2 flex-shrink-0' },
      h(UI.Button, { variant: 'outline', size: 'sm', onClick: props.onEdit }, 'Editar'),
      h(UI.Button, { variant: 'destructive', size: 'sm', onClick: props.onDelete }, 'Eliminar')
    )
  );
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

  React.useEffect(() => {
    if (refreshKey > 0) void refetch();
  }, [refreshKey, refetch]);

  const handleDelete = useCallback(async () => {
    if (!data) return;
    setDeleting(true);
    try {
      await actions.execute('vet-staff.professionals.delete', { id: data.id });
      toast.success('Eliminado', (data.staff_name ?? 'Profesional') + ' fue eliminado');
      onDeleted();
    } catch (err) {
      toast.error('Error', err instanceof Error ? err.message : 'No se pudo eliminar');
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  }, [data, toast, onDeleted]);

  if (loading) return h(DetailSkeleton, { isMobile });
  if (error)
    return h(UI.ErrorDisplay, {
      title: 'Error al cargar',
      message: error,
      onRetry: () => void refetch(),
    });

  if (!data) {
    return h(UI.EmptyState, {
      title: 'Profesional no encontrado',
      description: 'El registro puede haber sido eliminado.',
      icon: h(UI.DynamicIcon, { icon: 'UserX', size: 24 }),
      action: h(UI.Button, { variant: 'outline', onClick: onBack }, 'Volver a la lista'),
    });
  }

  const header = h(DetailHeader, {
    onBack,
    onEdit: () => onEdit(data),
    onDelete: () => setConfirmDelete(true),
  });

  const deleteConfirm = confirmDelete
    ? h(DeleteConfirmation, {
        name: data.staff_name ?? 'Desconocido',
        deleting,
        onCancel: () => setConfirmDelete(false),
        onConfirm: () => void handleDelete(),
      })
    : null;

  const showDataCard = settings.showLicense || settings.showSenasa;
  const hasRightColumn = showDataCard || settings.showSpecialty;
  const timestamps = h(TimestampsFooter, {
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    isMobile,
  });

  if (isMobile) {
    return h(
      'div',
      { style: { display: 'flex', flexDirection: 'column' as const, gap: 12 } },
      header,
      deleteConfirm,
      h(ProfileCardMobile, { data }),
      showDataCard ? h(ProfessionalDataMobile, { data, settings }) : null,
      settings.showSpecialty ? h(SpecialtiesCard, { data }) : null,
      timestamps
    );
  }

  // Sin columna derecha: profile card centrado
  if (!hasRightColumn) {
    return h(
      'div',
      { style: { display: 'flex', flexDirection: 'column' as const, gap: 20 } },
      header,
      deleteConfirm,
      h(
        'div',
        { style: { maxWidth: 400, margin: '0 auto', width: '100%' } },
        h(ProfileCardDesktop, { data }),
        timestamps
      )
    );
  }

  return h(
    'div',
    { style: { display: 'flex', flexDirection: 'column' as const, gap: 20 } },
    header,
    deleteConfirm,
    h(
      'div',
      {
        style: { display: 'grid', gridTemplateColumns: '320px 1fr', gap: 20, alignItems: 'start' },
      },
      h(ProfileCardDesktop, { data }),
      h(
        'div',
        { style: { display: 'flex', flexDirection: 'column' as const, gap: 20 } },
        showDataCard ? h(ProfessionalDataDesktop, { data, settings }) : null,
        settings.showSpecialty ? h(SpecialtiesCard, { data }) : null
      )
    ),
    timestamps
  );
}

// --- Vista wrapper (orquesta navegacion y modales) ---

export function ProfesionalesDetailView(props: { professionalId?: string }) {
  const { views } = usePlugin();
  const { settings } = useVetStaffSettings();
  const professionalId =
    props.professionalId ?? (views.params as Record<string, string>)?.professionalId;

  const [editTarget, setEditTarget] = useState<VetProfessional | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const goToList = useCallback(() => {
    views.open('vet-staff.profesionales.open');
  }, [views]);

  const handleEdit = useCallback((p: VetProfessional) => {
    setEditTarget(p);
  }, []);

  const handleEditSaved = useCallback(() => {
    setRefreshKey((k: number) => k + 1);
  }, []);

  if (!professionalId) {
    return h(UI.EmptyState, {
      title: 'No se especifico un profesional',
      className: 'p-6',
    });
  }

  return h(
    'div',
    { className: 'min-h-screen bg-cg-bg-secondary p-6' },
    h(
      'div',
      { className: 'w-full', style: { maxWidth: 1080, margin: '0 auto' } },
      h(ProfessionalDetail, {
        professionalId,
        onBack: goToList,
        onEdit: handleEdit,
        onDeleted: goToList,
        refreshKey,
      })
    ),
    editTarget
      ? h(EditProfessionalDialog, {
          professional: editTarget,
          open: true,
          onOpenChange: (open: boolean) => {
            if (!open) setEditTarget(null);
          },
          settings,
          onSaved: handleEditSaved,
        })
      : null
  );
}
