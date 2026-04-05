/**
 * Tarjeta de perfil del profesional para vista mobile.
 * Muestra avatar, nombre, rol, estado, email y telefono en layout horizontal.
 */
import { getHostReact, getHostUI } from '@coongro/plugin-sdk';

import type { VetProfessionalDetail } from '../../hooks/useVetProfessional.js';

import {
  AvatarCircle,
  BORDER_TOP,
  MUTED_COLOR,
  MUTED_ICON_STYLE,
  SERIF_FONT,
  StatusBadge,
  avatarColor,
  getInitials,
} from './utils.js';

const React = getHostReact();
const UI = getHostUI();
const h = React.createElement;

const CONTACT_ROW_STYLE = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '11px 16px',
  borderTop: BORDER_TOP,
  fontSize: 13,
} as const;

export function ProfileCardMobile(props: { data: VetProfessionalDetail }) {
  const { data } = props;
  const name = data.staff_name ?? 'Desconocido';
  const initials = getInitials(name);
  const color = data.is_active ? avatarColor(name) : '#D1D5DB';

  return h(
    UI.Card,
    null,
    // Avatar + nombre + rol + estado
    h(
      'div',
      { style: { display: 'flex', alignItems: 'center', gap: 14, padding: 16 } },
      h(AvatarCircle, { initials, color, size: 56 }),
      h(
        'div',
        { style: { flex: 1, minWidth: 0 } },
        h('div', { style: { fontFamily: SERIF_FONT, fontSize: 16, fontWeight: 700 } }, name),
        h(
          'div',
          { style: { fontSize: 12, color: MUTED_COLOR, marginTop: 2 } },
          data.staff_role ?? 'Veterinario'
        ),
        h('div', { style: { marginTop: 6 } }, h(StatusBadge, { isActive: data.is_active }))
      )
    ),
    // Email
    data.staff_email
      ? h(
          'div',
          { style: CONTACT_ROW_STYLE },
          h(UI.DynamicIcon, {
            icon: 'Mail',
            size: 13,
            style: MUTED_ICON_STYLE,
          }),
          h('div', { style: { flex: 1, minWidth: 0, color: 'var(--cg-accent)' } }, data.staff_email)
        )
      : null,
    // Telefono
    data.staff?.contact_phone
      ? h(
          'div',
          { style: CONTACT_ROW_STYLE },
          h(UI.DynamicIcon, {
            icon: 'Phone',
            size: 13,
            style: MUTED_ICON_STYLE,
          }),
          h('div', { style: { flex: 1, minWidth: 0 } }, data.staff.contact_phone)
        )
      : null
  );
}
