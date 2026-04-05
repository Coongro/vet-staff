/**
 * Card de datos profesionales (matricula, colegio, SENASA).
 * Version mobile: filas key-value apiladas.
 * Version desktop: grid bento de 3 columnas.
 */
import { getHostReact, getHostUI } from '@coongro/plugin-sdk';

import type { VetStaffSettings } from '../../hooks/useVetStaffSettings.js';
import type { VetProfessional } from '../../types/vet-professional.js';

import { BORDER_TOP, LABEL_STYLE, MONO_FONT, MUTED_COLOR, MUTED_ICON_STYLE } from './utils.js';

const React = getHostReact();
const UI = getHostUI();
const h = React.createElement;

const NO_DATA = NO_DATA;

// --- Mobile: filas key-value ---

interface DataRow {
  label: string;
  value: string;
  mono: boolean;
}

function buildDataRows(data: VetProfessional, settings: VetStaffSettings): DataRow[] {
  const rows: DataRow[] = [
    {
      label: 'Matricula',
      value: settings.licensePrefix + ' ' + data.license_number,
      mono: true,
    },
    {
      label: 'Colegio emisor',
      value: data.license_college || '\u2014',
      mono: false,
    },
  ];
  if (settings.senasaEnabled) {
    rows.push({
      label: 'SENASA',
      value: data.senasa_number || NO_DATA,
      mono: Boolean(data.senasa_number),
    });
  }
  return rows;
}

export function ProfessionalDataMobile(props: {
  data: VetProfessional;
  settings: VetStaffSettings;
}) {
  const { data, settings } = props;
  const rows = buildDataRows(data, settings);

  return h(
    UI.Card,
    null,
    h(
      UI.CardBody,
      { style: { paddingBottom: 0 } },
      h(
        'div',
        { className: 'flex items-center gap-2 text-sm font-bold mb-3' },
        h(UI.DynamicIcon, { icon: 'Stethoscope', size: 13, style: MUTED_ICON_STYLE }),
        'Datos profesionales'
      )
    ),
    ...rows.map((row) => {
      const isEmpty = row.value === '\u2014' || row.value === NO_DATA;
      return h(
        'div',
        {
          key: row.label,
          style: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            padding: '12px 16px',
            borderTop: BORDER_TOP,
          },
        },
        h('span', { style: { fontSize: 12, color: MUTED_COLOR } }, row.label),
        h(
          'span',
          {
            style: {
              fontSize: 14,
              fontWeight: 500,
              textAlign: 'right' as const,
              fontFamily: row.mono ? MONO_FONT : undefined,
              color: isEmpty ? MUTED_COLOR : undefined,
            },
          },
          row.value
        )
      );
    })
  );
}

// --- Desktop: grid bento ---

const BENTO_LABEL_STYLE = {
  ...LABEL_STYLE,
  marginBottom: 6,
} as const;

function BentoCell(props: { label: string; value: string; mono?: boolean; showBorder?: boolean }) {
  const { label, value, mono, showBorder } = props;
  return h(
    'div',
    {
      style: {
        padding: '16px 20px',
        ...(showBorder ? { borderRight: BORDER_TOP } : {}),
      },
    },
    h('div', { style: BENTO_LABEL_STYLE }, label),
    h(
      'div',
      {
        style: {
          fontSize: 15,
          fontWeight: 500,
          ...(mono ? { fontFamily: MONO_FONT } : {}),
        },
      },
      value
    )
  );
}

function SenasaCell(props: { data: VetProfessional; settings: VetStaffSettings }) {
  const { data, settings } = props;

  if (!settings.senasaEnabled) {
    return h(
      'div',
      { style: { padding: '16px 20px' } },
      h('div', { style: BENTO_LABEL_STYLE }, 'SENASA'),
      h('div', { style: { fontSize: 13, color: MUTED_COLOR } }, 'No habilitado')
    );
  }

  const hasSenasa = Boolean(data.senasa_number);
  return h(
    'div',
    { style: { padding: '16px 20px' } },
    h('div', { style: BENTO_LABEL_STYLE }, 'SENASA'),
    h(
      'div',
      {
        style: {
          fontSize: 15,
          fontWeight: 500,
          ...(hasSenasa
            ? { fontFamily: MONO_FONT }
            : { color: MUTED_COLOR }),
        },
      },
      data.senasa_number || NO_DATA
    )
  );
}

export function ProfessionalDataDesktop(props: {
  data: VetProfessional;
  settings: VetStaffSettings;
}) {
  const { data, settings } = props;

  return h(
    UI.Card,
    null,
    h(
      UI.CardBody,
      { style: { paddingBottom: 0 } },
      h(
        'div',
        { className: 'flex items-center gap-2 text-sm font-bold mb-4' },
        h(UI.DynamicIcon, { icon: 'Stethoscope', size: 14, style: MUTED_ICON_STYLE }),
        'Datos profesionales'
      )
    ),
    h(
      'div',
      {
        style: {
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          borderTop: BORDER_TOP,
        },
      },
      h(BentoCell, {
        label: 'Matricula',
        value: settings.licensePrefix + ' ' + data.license_number,
        mono: true,
        showBorder: true,
      }),
      h(BentoCell, {
        label: 'Colegio emisor',
        value: data.license_college || '\u2014',
        showBorder: true,
      }),
      h(SenasaCell, { data, settings })
    )
  );
}
