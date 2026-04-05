/**
 * Campos de formulario reutilizables para crear/editar profesionales.
 * Compartidos entre CreateProfessionalDialog y EditProfessionalDialog.
 */
import { getHostReact, getHostUI } from '@coongro/plugin-sdk';

import type { VetStaffSettings } from '../../hooks/useVetStaffSettings.js';
import { SPECIALTIES, formatSpecialty } from '../../lib/specialties.js';

const React = getHostReact();
const UI = getHostUI();
const h = React.createElement;

const LABEL_CLASS = 'text-sm font-medium text-cg-text mb-1 block';
const ERROR_CLASS = 'text-xs text-cg-danger mt-1';
const REQUIRED_CLASS = 'text-cg-danger ml-0.5';

// --- Helpers de formulario ---

function RequiredMark() {
  return h('span', { className: REQUIRED_CLASS }, '*');
}

function FieldError(props: { message?: string }) {
  if (!props.message) return null;
  return h('p', { className: ERROR_CLASS }, props.message);
}

// --- Datos personales (solo para creacion) ---

export function PersonalDataFields(props: {
  name: string;
  email: string;
  phone: string;
  nameError?: string;
  onNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
}) {
  return h(
    React.Fragment,
    null,
    h(
      'div',
      null,
      h('label', { className: LABEL_CLASS }, 'Nombre completo', h(RequiredMark, null)),
      h(UI.Input, {
        value: props.name,
        onChange: (e: { target: { value: string } }) => props.onNameChange(e.target.value),
        placeholder: 'Ej: Dra. Maria Garcia',
      }),
      h(FieldError, { message: props.nameError })
    ),
    h(
      'div',
      { className: 'grid grid-cols-1 sm:grid-cols-2 gap-4' },
      h(
        'div',
        null,
        h('label', { className: LABEL_CLASS }, 'Email'),
        h(UI.Input, {
          value: props.email,
          onChange: (e: { target: { value: string } }) => props.onEmailChange(e.target.value),
          placeholder: 'email@ejemplo.com',
        })
      ),
      h(
        'div',
        null,
        h('label', { className: LABEL_CLASS }, 'Telefono'),
        h(UI.Input, {
          value: props.phone,
          onChange: (e: { target: { value: string } }) => props.onPhoneChange(e.target.value),
          placeholder: '+54 11 1234-5678',
        })
      )
    )
  );
}

// --- Campos profesionales ---

export function LicenseFields(props: {
  licenseNumber: string;
  licenseCollege: string;
  licenseError?: string;
  onLicenseNumberChange: (value: string) => void;
  onLicenseCollegeChange: (value: string) => void;
}) {
  return h(
    'div',
    { className: 'grid grid-cols-1 sm:grid-cols-2 gap-4' },
    h(
      'div',
      null,
      h('label', { className: LABEL_CLASS }, 'Matricula', h(RequiredMark, null)),
      h(UI.Input, {
        value: props.licenseNumber,
        onChange: (e: { target: { value: string } }) => props.onLicenseNumberChange(e.target.value),
        placeholder: 'Ej: 12345',
      }),
      h(FieldError, { message: props.licenseError })
    ),
    h(
      'div',
      null,
      h('label', { className: LABEL_CLASS }, 'Colegio emisor'),
      h(UI.Input, {
        value: props.licenseCollege,
        onChange: (e: { target: { value: string } }) =>
          props.onLicenseCollegeChange(e.target.value),
        placeholder: 'Ej: CVPBA',
      })
    )
  );
}

export function SpecialtiesField(props: {
  values: string[];
  onValuesChange: (values: string[]) => void;
}) {
  return h(
    'div',
    null,
    h('label', { className: LABEL_CLASS }, 'Especialidades'),
    h(
      UI.MultiSelect,
      {
        values: props.values,
        onValuesChange: props.onValuesChange,
        placeholder: 'Seleccionar especialidades...',
      },
      ...SPECIALTIES.map((s) => h(UI.SelectItem, { key: s, value: s }, formatSpecialty(s)))
    )
  );
}

export function SenasaField(props: {
  settings: VetStaffSettings;
  value: string;
  error?: string;
  onChange: (value: string) => void;
}) {
  if (!props.settings.senasaEnabled) return null;

  return h(
    'div',
    null,
    h(
      'label',
      { className: LABEL_CLASS },
      'SENASA',
      props.settings.senasaRequired
        ? h(RequiredMark, null)
        : h('span', { className: 'text-cg-text-muted ml-1' }, '(opcional)')
    ),
    h(UI.Input, {
      value: props.value,
      onChange: (e: { target: { value: string } }) => props.onChange(e.target.value),
      placeholder: 'Ej: 12345678',
    }),
    h(FieldError, { message: props.error })
  );
}

export function ActiveToggle(props: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return h(
    'div',
    { className: 'flex items-center justify-between' },
    h(
      'div',
      null,
      h('span', { className: 'text-sm font-medium text-cg-text block' }, 'Profesional activo'),
      h(
        'span',
        { className: 'text-xs text-cg-text-muted' },
        'Los inactivos no aparecen en selectores ni agenda'
      )
    ),
    h(UI.Switch, {
      checked: props.checked,
      onCheckedChange: props.onCheckedChange,
    })
  );
}
