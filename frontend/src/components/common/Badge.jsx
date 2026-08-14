import React from 'react';

export const Badge = ({
  children,
  count,
  variant = 'healthy', // 'healthy' | 'overloaded' | 'degraded' | 'critical' | 'disabled' | 'orange' | 'info' | 'dark'
  size = 'md', // 'sm' | 'md'
  icon: Icon,
  pulsing = false,
  className = '',
  style = {}
}) => {
  const getColors = () => {
    switch (variant) {
      case 'healthy':
        return { bg: 'var(--status-healthy-bg)', text: 'var(--status-healthy)', border: 'var(--status-healthy-border)' };
      case 'overloaded':
        return { bg: 'var(--status-overloaded-bg)', text: 'var(--status-overloaded)', border: 'var(--status-overloaded-border)' };
      case 'degraded':
        return { bg: 'var(--status-degraded-bg)', text: 'var(--status-degraded)', border: 'var(--status-degraded-border)' };
      case 'critical':
        return { bg: 'var(--status-critical-bg)', text: 'var(--status-critical)', border: 'var(--status-critical-border)' };
      case 'disabled':
        return { bg: 'var(--status-disabled-bg)', text: 'var(--status-disabled)', border: 'var(--status-disabled-border)' };
      case 'orange':
        return { bg: 'var(--primary-orange-soft)', text: 'var(--primary-orange-dark)', border: 'var(--primary-orange-soft)' };
      case 'info':
        return { bg: 'var(--status-info-bg)', text: 'var(--status-info)', border: 'var(--status-info-border)' };
      case 'dark':
        return { bg: '#1E2337', text: '#FFFFFF', border: '#2A3047' };
      default:
        return { bg: 'var(--bg-surface-warm)', text: 'var(--text-body)', border: 'var(--border-warm)' };
    }
  };

  const colors = getColors();

  return (
    <span
      className={`badge-pill ${pulsing ? 'animate-pulse-slow' : ''} ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        background: colors.bg,
        color: colors.text,
        border: `1px solid ${colors.border}`,
        borderRadius: 'var(--radius-full)',
        padding: size === 'sm' ? '2px 8px' : '4px 12px',
        fontSize: size === 'sm' ? '11px' : '12px',
        fontWeight: '600',
        lineHeight: 1.2,
        letterSpacing: '0.01em',
        whiteSpace: 'nowrap',
        ...style
      }}
    >
      {Icon && <Icon size={size === 'sm' ? 12 : 14} />}
      {count !== undefined && <span style={{ fontWeight: '700' }}>{count}</span>}
      <span>{children}</span>
    </span>
  );
};
