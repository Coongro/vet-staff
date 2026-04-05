/**
 * Card de especialidades del profesional.
 */
import { getHostReact, getHostUI } from '@coongro/plugin-sdk';

import { formatSpecialty } from '../../lib/specialties.js';
import type { VetProfessional } from '../../types/vet-professional.js';

import { MUTED_ICON_STYLE } from './utils.js';

const React = getHostReact();
const UI = getHostUI();
const h = React.createElement;

export function SpecialtiesCard(props: { data: VetProfessional }) {
  const { data } = props;
  const specs = data.specialty ? data.specialty.split(',').filter(Boolean) : [];

  return h(
    UI.Card,
    null,
    h(
      UI.CardBody,
      null,
      h(
        'div',
        { className: 'flex items-center gap-2 text-sm font-bold mb-4' },
        h(UI.DynamicIcon, { icon: 'Award', size: 14, style: MUTED_ICON_STYLE }),
        'Especialidades'
      ),
      specs.length > 0
        ? h(
            'div',
            { className: 'flex flex-wrap gap-2' },
            ...specs.map((s) =>
              h(UI.Badge, { key: s, variant: 'warning-soft' }, formatSpecialty(s))
            )
          )
        : h('div', { className: 'text-sm text-cg-text-muted' }, 'Sin especialidades registradas')
    )
  );
}
