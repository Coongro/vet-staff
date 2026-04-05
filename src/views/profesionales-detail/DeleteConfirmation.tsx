/**
 * Confirmacion de eliminacion de un profesional.
 */
import { getHostReact, getHostUI } from '@coongro/plugin-sdk';

const React = getHostReact();
const UI = getHostUI();
const h = React.createElement;

export function DeleteConfirmation(props: {
  name: string;
  deleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const { name, deleting, onCancel, onConfirm } = props;

  return h(
    'div',
    {
      className: 'rounded-lg border p-4',
      style: { background: 'var(--cg-danger-bg, #FEF2F2)', borderColor: '#FECACA' },
    },
    h(
      'div',
      { className: 'text-sm text-cg-danger mb-3' },
      h('strong', null, 'Eliminar a ' + name + '?'),
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
          onClick: onCancel,
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
          onClick: onConfirm,
          disabled: deleting,
          className: 'flex-1',
        },
        deleting ? 'Eliminando...' : 'Eliminar'
      )
    )
  );
}
