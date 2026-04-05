import { getHostReact, getHostUI } from '@coongro/plugin-sdk';

import type { VetProfessionalDetail } from '../../hooks/useVetProfessional.js';
import { DEFAULT_STAFF_ROLE } from '../../lib/constants.js';

import {
  AvatarCircle,
  BORDER_TOP,
  LABEL_STYLE,
  MUTED_ICON_STYLE,
  SERIF_FONT,
  StatusBadge,
  avatarColor,
  formatDate,
  getInitials,
} from './utils.js';

const React = getHostReact();
const UI = getHostUI();
const h = React.createElement;

interface ContactRowProps {
  icon: string;
  label: string;
  value: string;
  showBorder: boolean;
  isLink?: boolean;
}

function ContactRow(props: ContactRowProps) {
  const { icon, label, value, showBorder, isLink } = props;
  return h(
    'div',
    {
      style: {
        display: 'flex',
        gap: 10,
        padding: '10px 0',
        ...(showBorder ? { borderTop: BORDER_TOP } : {}),
      },
    },
    h(UI.DynamicIcon, {
      icon,
      size: 14,
      style: { ...MUTED_ICON_STYLE, marginTop: 2 },
    }),
    h(
      'div',
      { style: { flex: 1, minWidth: 0 } },
      h('div', { style: { ...LABEL_STYLE, marginBottom: 2 } }, label),
      h(
        'div',
        {
          style: {
            fontSize: 14,
            ...(isLink ? { color: 'var(--cg-accent)', wordBreak: 'break-all' as const } : {}),
          },
        },
        value
      )
    )
  );
}

export function ProfileCardDesktop(props: { data: VetProfessionalDetail }) {
  const { data } = props;
  const name = data.staff_name ?? 'Desconocido';
  const initials = getInitials(name);
  const color = data.is_active ? avatarColor(name) : '#D1D5DB';
  const hasEmail = Boolean(data.staff_email);
  const hasPhone = Boolean(data.staff?.contact_phone);

  return h(
    UI.Card,
    null,
    // Avatar + nombre + rol + estado centrado
    h(
      'div',
      {
        style: {
          display: 'flex',
          flexDirection: 'column' as const,
          alignItems: 'center',
          padding: '28px 24px 20px',
          borderBottom: BORDER_TOP,
        },
      },
      h('div', { style: { marginBottom: 14 } }, h(AvatarCircle, { initials, color, size: 72 })),
      h(
        'div',
        {
          style: {
            fontFamily: SERIF_FONT,
            fontSize: 17,
            fontWeight: 700,
            textAlign: 'center' as const,
          },
        },
        name
      ),
      h(
        'div',
        { style: { fontSize: 13, color: 'var(--cg-text-muted)', marginTop: 4 } },
        data.staff_role ?? DEFAULT_STAFF_ROLE
      ),
      h('div', { style: { marginTop: 8 } }, h(StatusBadge, { isActive: data.is_active }))
    ),

    // Datos de contacto
    h(
      UI.CardBody,
      null,
      data.staff_email
        ? h(ContactRow, {
            icon: 'Mail',
            label: 'Email',
            value: data.staff_email,
            showBorder: false,
            isLink: true,
          })
        : null,
      data.staff?.contact_phone
        ? h(ContactRow, {
            icon: 'Phone',
            label: 'Telefono',
            value: data.staff.contact_phone,
            showBorder: hasEmail,
          })
        : null,
      h(ContactRow, {
        icon: 'Briefcase',
        label: 'Cargo',
        value: data.staff_role ?? DEFAULT_STAFF_ROLE,
        showBorder: hasEmail || hasPhone,
      }),
      h(ContactRow, {
        icon: 'Calendar',
        label: 'Fecha de alta',
        value: formatDate(data.created_at),
        showBorder: true,
      })
    )
  );
}
