/**
 * Skeleton de carga para la vista de detalle de profesional.
 */
import { getHostReact, getHostUI } from '@coongro/plugin-sdk';

import { BORDER_TOP } from './utils.js';

const React = getHostReact();
const UI = getHostUI();
const h = React.createElement;

export function DetailSkeleton(props: { isMobile: boolean }) {
  const { isMobile } = props;

  return h(
    'div',
    { className: 'flex flex-col gap-4' },
    // Header skeleton
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
              borderTop: BORDER_TOP,
            },
          },
          h(UI.Skeleton, { className: 'h-3 w-20' }),
          h(UI.Skeleton, { className: 'h-4 w-24' })
        )
      )
    )
  );
}
