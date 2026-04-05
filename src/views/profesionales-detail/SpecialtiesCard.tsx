/**
 * Card de especialidades con timestamps de creacion/actualizacion.
 */
import { getHostReact, getHostUI } from '@coongro/plugin-sdk';

import { formatSpecialty } from '../../lib/specialties.js';
import type { VetProfessional } from '../../types/vet-professional.js';

import { BORDER_TOP, MUTED_ICON_STYLE, formatDateShort } from './utils.js';

const React = getHostReact();
const UI = getHostUI();
const h = React.createElement;

export function SpecialtiesCard(props: { data: VetProfessional; isMobile: boolean }) {
  const { data, isMobile } = props;
  const specs = data.specialty ? data.specialty.split(',').filter(Boolean) : [];

  return h(
    UI.Card,
    null,
    h(
      UI.CardBody,
      { style: { paddingBottom: specs.length > 0 ? 0 : undefined } },
      h(
        'div',
        { className: 'flex items-center gap-2 text-sm font-bold mb-4' },
        h(UI.DynamicIcon, { icon: 'Award', size: 14, style: MUTED_ICON_STYLE }),
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
          borderTop: BORDER_TOP,
        },
      },
      h(
        'div',
        { style: { display: 'flex', alignItems: 'center', gap: 6 } },
        h(UI.DynamicIcon, { icon: 'Clock', size: 12 }),
        'Registrado: ' + formatDateShort(data.created_at)
      ),
      h(
        'div',
        { style: { display: 'flex', alignItems: 'center', gap: 6 } },
        h(UI.DynamicIcon, { icon: 'RefreshCw', size: 12 }),
        'Actualizado: ' + formatDateShort(data.updated_at)
      )
    )
  );
}
