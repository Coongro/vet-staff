import { getHostReact, getHostUI, usePlugin, actions } from '@coongro/plugin-sdk';

import type { VetProfessionalDetail } from '../../hooks/useVetProfessional.js';
import type { VetStaffSettings } from '../../hooks/useVetStaffSettings.js';
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
  name: string;
  license_number: string;
  license_college: string;
  specialties: string[];
  senasa_number: string;
  is_active: boolean;
}

function buildInitialForm(p: VetProfessionalDetail): EditFormData {
  return {
    name: p.staff_name ?? p.staff?.contact_name ?? '',
    license_number: p.license_number ?? '',
    license_college: p.license_college ?? '',
    specialties: p.specialty ? p.specialty.split(',').filter(Boolean) : [],
    senasa_number: p.senasa_number ?? '',
    is_active: p.is_active,
  };
}

export function EditProfessionalDialog(props: {
  professional: VetProfessionalDetail;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: VetStaffSettings;
  onSaved: () => void;
}) {
  const { professional, open, onOpenChange, settings, onSaved } = props;

  // Mostrar campo si la setting está activa O si ya hay datos cargados
  // (para no esconder valores existentes que el usuario debería poder editar/limpiar).
  const showLicense =
    settings.showLicense || !!professional.license_number || !!professional.license_college;
  const showSpecialty = settings.showSpecialty || !!professional.specialty;
  const showSenasa = settings.showSenasa || !!professional.senasa_number;
  const { toast } = usePlugin();

  const [form, setForm] = useState<EditFormData>(() => buildInitialForm(professional));
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});

  // Sincronizar form cuando cambia el profesional
  React.useEffect(() => {
    setForm(buildInitialForm(professional));
    setErrors({});
  }, [professional]);

  const updateField = useCallback((key: string, value: unknown) => {
    setForm((prev: EditFormData) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }, []);

  const handleSave = useCallback(async () => {
    const errs: Partial<Record<string, string>> = {};
    if (!form.name.trim()) {
      errs.name = 'El nombre es obligatorio';
    }
    if (showLicense && !form.license_number.trim()) {
      errs.license_number = 'La matricula es obligatoria';
    }
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setSaving(true);
    try {
      // Si cambió el nombre, actualizar el contacto vinculado al staff
      const originalName = professional.staff_name ?? professional.staff?.contact_name ?? '';
      if (form.name.trim() !== originalName && professional.staff?.contact_id) {
        await actions.execute('contacts.update', {
          id: professional.staff.contact_id,
          data: { name: form.name.trim() },
        });
      }

      await actions.execute('vet-staff.professionals.update', {
        id: professional.id,
        data: {
          license_number: showLicense ? form.license_number.trim() : professional.license_number,
          license_college: showLicense
            ? form.license_college.trim() || null
            : professional.license_college,
          specialty: showSpecialty
            ? form.specialties.length > 0
              ? form.specialties.join(',')
              : null
            : professional.specialty,
          senasa_number: showSenasa
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
  }, [professional, form, showLicense, showSpecialty, showSenasa, toast, onOpenChange, onSaved]);

  const handleClose = useCallback(() => {
    if (!saving) onOpenChange(false);
  }, [saving, onOpenChange]);

  return h(UI.FormDialogSubmit, {
    open,
    onOpenChange: handleClose,
    title: 'Editar profesional',
    size: 'md',
    submitLabel: 'Guardar cambios',
    onCancel: handleClose,
    disabled: saving,
    children: ({ formRef }: { formRef: React.RefObject<HTMLFormElement> }) =>
      h(
        'form',
        {
          ref: formRef,
          onSubmit: (e: React.FormEvent) => {
            e.preventDefault();
            void handleSave();
          },
          className: 'flex flex-col gap-4',
        },
        // Nombre (siempre visible, requerido)
        h(
          'div',
          null,
          h(
            'label',
            { className: 'text-sm font-medium text-cg-text mb-1 block' },
            'Nombre completo',
            h('span', { className: 'text-cg-danger ml-0.5' }, '*')
          ),
          h(UI.Input, {
            value: form.name,
            onChange: (e: { target: { value: string } }) => updateField('name', e.target.value),
            placeholder: 'Ej: Dra. Maria Garcia',
            'aria-invalid': !!errors.name,
            className: errors.name ? 'border-cg-danger' : '',
          }),
          errors.name && h('p', { className: 'text-xs text-cg-danger mt-1' }, errors.name)
        ),
        showLicense
          ? h(LicenseFields, {
              licenseNumber: form.license_number,
              licenseCollege: form.license_college,
              licenseError: errors.license_number,
              onLicenseNumberChange: (v: string) => updateField('license_number', v),
              onLicenseCollegeChange: (v: string) => updateField('license_college', v),
            })
          : null,
        showSpecialty
          ? h(SpecialtiesField, {
              values: form.specialties,
              onValuesChange: (vals: string[]) => updateField('specialties', vals),
            })
          : null,
        showSenasa
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
      ),
  });
}
