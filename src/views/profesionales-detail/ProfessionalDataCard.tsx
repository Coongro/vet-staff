import { getHostReact, getHostUI } from '@coongro/plugin-sdk';

import type { VetStaffSettings } from '../../hooks/useVetStaffSettings.js';
import type { VetProfessional } from '../../types/vet-professional.js';

import { BORDER_TOP, LABEL_STYLE, MONO_FONT, MUTED_COLOR, MUTED_ICON_STYLE } from './utils.js';

const React = getHostReact();
const UI = getHostUI();
const h = React.createElement;

interface DataCell {
  label: string;
  value: string;
  mono: boolean;
}

function buildCells(data: VetProfessional, settings: VetStaffSettings): DataCell[] {
  const cells: DataCell[] = [];
  if (settings.showLicense) {
    cells.push({
      label: 'Matricula',
      value: data.license_number || '\u2014',
      mono: Boolean(data.license_number),
    });
    cells.push({
      label: 'Colegio emisor',
      value: data.license_college || '\u2014',
      mono: false,
    });
  }
  if (settings.showSenasa) {
    cells.push({
      label: 'SENASA',
      value: data.senasa_number || 'No registrado',
      mono: Boolean(data.senasa_number),
    });
  }
  return cells;
}

export function ProfessionalDataMobile(props: {
  data: VetProfessional;
  settings: VetStaffSettings;
}) {
  const { data, settings } = props;
  const cells = buildCells(data, settings);

  if (cells.length === 0) return null;

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
    ...cells.map((cell) => {
      const isEmpty = cell.value === '\u2014' || cell.value === 'No registrado';
      return h(
        'div',
        {
          key: cell.label,
          style: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            padding: '12px 16px',
            borderTop: BORDER_TOP,
          },
        },
        h('span', { style: { fontSize: 12, color: MUTED_COLOR } }, cell.label),
        h(
          'span',
          {
            style: {
              fontSize: 14,
              fontWeight: 500,
              textAlign: 'right' as const,
              fontFamily: cell.mono ? MONO_FONT : undefined,
              color: isEmpty ? MUTED_COLOR : undefined,
            },
          },
          cell.value
        )
      );
    })
  );
}

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

export function ProfessionalDataDesktop(props: {
  data: VetProfessional;
  settings: VetStaffSettings;
}) {
  const { data, settings } = props;
  const cells = buildCells(data, settings);

  if (cells.length === 0) return null;

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
          gridTemplateColumns: `repeat(${cells.length}, 1fr)`,
          borderTop: BORDER_TOP,
        },
      },
      ...cells.map((cell, i) =>
        h(BentoCell, {
          key: cell.label,
          label: cell.label,
          value: cell.value,
          mono: cell.mono,
          showBorder: i < cells.length - 1,
        })
      )
    )
  );
}
