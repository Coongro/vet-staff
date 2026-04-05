/**
 * Utilidades compartidas para la vista de detalle de profesionales.
 */
import { getHostReact, getHostUI } from '@coongro/plugin-sdk';

const React = getHostReact();
const UI = getHostUI();
const { useState, useEffect } = React;
const h = React.createElement;

// --- useIsMobile local (no depende de version de plugin-sdk) ---

export function useIsMobile(threshold = 1024): boolean {
  const [mobile, setMobile] = useState(() => window.innerWidth < threshold);
  useEffect(() => {
    const handler = () => setMobile(window.innerWidth < threshold);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, [threshold]);
  return mobile;
}

// --- Utilidades ---

export function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return iso;
  }
}

export function formatDateShort(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return iso;
  }
}

// --- Colores de avatar por inicial ---

const AVATAR_COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F97316', '#EC4899', '#06B6D4'];

export function avatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

// --- Estilos compartidos ---

export const MUTED_COLOR = 'var(--cg-text-muted)';

export const MUTED_ICON_STYLE = { color: MUTED_COLOR } as const;

export const LABEL_STYLE = {
  fontSize: 11,
  fontWeight: 500,
  color: 'var(--cg-text-muted)',
  textTransform: 'uppercase' as const,
  letterSpacing: 0.5,
  marginBottom: 2,
};

export const BORDER_TOP = '1px solid var(--cg-border)';

export const MONO_FONT = "'Roboto Mono', monospace";

export const SERIF_FONT = "'Noto Serif JP', serif";

// --- Componentes compartidos ---

export function AvatarCircle(props: { initials: string; color: string; size: number }) {
  const { initials, color, size } = props;
  return h(
    'div',
    {
      style: {
        width: size,
        height: size,
        borderRadius: '50%',
        background: color,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: Math.round(size * 0.33),
        fontWeight: 600,
        color: '#fff',
      },
    },
    initials
  );
}

export function StatusBadge(props: { isActive: boolean }) {
  return h(
    UI.Badge,
    { variant: props.isActive ? 'success-soft' : 'secondary', size: 'sm' },
    props.isActive ? 'Activo' : 'Inactivo'
  );
}
