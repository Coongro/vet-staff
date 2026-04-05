/**
 * Dialog para editar los datos profesionales de un veterinario.
 */
import { getHostReact, getHostUI, usePlugin, actions } from '@coongro/plugin-sdk';

import type { VetStaffSettings } from '../../hooks/useVetStaffSettings.js';
import type { VetProfessional } from '../../types/vet-professional.js';
import {
  ActiveToggle,
  LicenseFields,
  SenasaField,
  SpecialtiesField,
} from '../shared/form-fields.js';

const React = getHostReact();
const UI = getHostUI();
const { useState, useCallback } = React;
const h = React.createElement;

interface EditFormData {
  license_number: string;
  license_college: string;
  specialties: string[];
  senasa_number: string;
  is_active: boolean;
}

function buildInitialForm(p: VetProfessional): EditFormData {
  return {
    license_number: p.license_number,
    license_college: p.license_college ?? '',
    specialties: p.specialty ? p.specialty.split(',').filter(Boolean) : [],
    senasa_number: p.senasa_number ?? '',
    is_active: p.is_active,
  };
}

export function EditProfessionalDialog(props: {
  professional: VetProfessional;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: VetStaffSettings;
  onSaved: () => void;
}) {
  const { professional, open, onOpenChange, settings, onSaved } = props;
  const { toast } = usePlugin();

  const [form, setForm] = useState<EditFormData>(() => buildInitialForm(professional));
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Sincronizar form cuando cambia el profesional
  React.useEffect(() => {
    setForm(buildInitialForm(professional));
    setErrors({});
  }, [professional]);

  const updateField = useCallback((key: string, value: unknown) => {
    setForm((prev: EditFormData) => ({ ...prev, [key]: value }));
    setErrors((prev: Record<string, string>) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const handleSave = useCallback(async () => {
    const errs: Record<string, string> = {};
    if (settings.showLicense && !form.license_number.trim()) {
      errs.license_number = 'La matricula es obligatoria';
    }
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setSaving(true);
    try {
      await actions.execute('vet-staff.professionals.update', {
        id: professional.id,
        data: {
          license_number: settings.showLicense
            ? form.license_number.trim()
            : professional.license_number,
          license_college: settings.showLicense
            ? form.license_college.trim() || null
            : professional.license_college,
          specialty:
            settings.showSpecialty && form.specialties.length > 0
              ? form.specialties.join(',')
              : settings.showSpecialty
                ? null
                : professional.specialty,
          senasa_number: settings.showSenasa
            ? form.senasa_number.trim() || null
            : professional.senasa_number,
          is_active: form.is_active,
        },
      });
      toast.success('Actualizado', 'Los datos del profesional se guardaron correctamente');
      onOpenChange(false);
      onSaved();
    } catch (err) {
      toast.error('Error', err instanceof Error ? err.message : 'No se pudo guardar');
    } finally {
      setSaving(false);
    }
  }, [professional, form, settings, toast, onOpenChange, onSaved]);

  const handleClose = useCallback(() => {
    if (!saving) onOpenChange(false);
  }, [saving, onOpenChange]);

  const hasVisibleFields = settings.showLicense || settings.showSpecialty || settings.showSenasa;

  return h(
    UI.FormDialog,
    {
      open,
      onOpenChange: handleClose,
      title: 'Editar profesional',
      size: 'md',
      footer: h(
        'div',
        { className: 'flex justify-end gap-3 w-full' },
        h(UI.Button, { variant: 'outline', onClick: handleClose, disabled: saving }, 'Cancelar'),
        h(
          UI.Button,
          { variant: 'brand', onClick: () => void handleSave(), disabled: saving },
          saving ? 'Guardando...' : 'Guardar cambios'
        )
      ),
    },
    h(
      'div',
      { className: 'flex flex-col gap-4' },
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
      hasVisibleFields ? h(UI.Separator, null) : null,
      h(ActiveToggle, {
        checked: form.is_active,
        onCheckedChange: (checked: boolean) => updateField('is_active', checked),
      })
    )
  );
}
