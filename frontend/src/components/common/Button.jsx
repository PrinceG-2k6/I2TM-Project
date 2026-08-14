import React from 'react';
import { Filter, ChevronDown, Check } from 'lucide-react';

export const Button = ({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'plain' | 'filter' | 'check' | 'ghost' | 'dark'
  size = 'md', // 'sm' | 'md' | 'lg'
  icon: Icon,
  iconRight: IconRight,
  hasChevron = false,
  checked = false,
  disabled = false,
  onClick,
  className = '',
  style = {}
}) => {
  const getBaseStyles = () => {
    let bg = 'transparent';
    let color = 'var(--text-main)';
    let border = '1px solid transparent';
    let padding = '8px 16px';
    let fontSize = '14px';
    let fontWeight = '600';
    let borderRadius = 'var(--radius-md)';

    if (size === 'sm') {
      padding = '6px 12px';
      fontSize = '12px';
      borderRadius = 'var(--radius-sm)';
    } else if (size === 'lg') {
      padding = '12px 24px';
      fontSize = '16px';
      borderRadius = '14px';
    }

    switch (variant) {
      case 'primary':
        bg = 'var(--primary-orange)';
        color = '#FFFFFF';
        border = '1px solid var(--primary-orange-dark)';
        break;
      case 'secondary':
        bg = 'var(--bg-surface)';
        color = 'var(--text-main)';
        border = '1px solid var(--border-warm)';
        break;
      case 'plain':
        bg = 'transparent';
        color = 'var(--text-body)';
        padding = '6px 10px';
        break;
      case 'filter':
        bg = 'var(--bg-surface)';
        color = 'var(--text-main)';
        border = '1px solid var(--border-warm)';
        borderRadius = 'var(--radius-md)';
        break;
      case 'dark':
        bg = 'var(--bg-sidebar)';
        color = '#FFFFFF';
        border = '1px solid #2A3047';
        break;
      case 'ghost':
        bg = 'transparent';
        color = 'var(--primary-orange)';
        break;
      case 'check':
        bg = checked ? 'var(--status-healthy-bg)' : 'var(--bg-surface)';
        color = checked ? 'var(--status-healthy)' : 'var(--text-muted)';
        border = checked ? '1px solid var(--status-healthy-border)' : '1px solid var(--border-warm)';
        borderRadius = 'var(--radius-full)';
        break;
      default:
        break;
    }

    return {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      background: bg,
      color: color,
      border: border,
      padding: padding,
      fontSize: fontSize,
      fontWeight: fontWeight,
      borderRadius: borderRadius,
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.6 : 1,
      transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
      textDecoration: 'none',
      whiteSpace: 'nowrap',
      ...style
    };
  };

  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      style={getBaseStyles()}
      className={`btn-custom ${className}`}
      onMouseEnter={(e) => {
        if (!disabled) {
          if (variant === 'primary') e.currentTarget.style.background = 'var(--primary-orange-dark)';
          if (variant === 'secondary' || variant === 'filter') e.currentTarget.style.background = 'var(--primary-orange-soft)';
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          if (variant === 'primary') e.currentTarget.style.background = 'var(--primary-orange)';
          if (variant === 'secondary' || variant === 'filter') e.currentTarget.style.background = 'var(--bg-surface)';
        }
      }}
    >
      {variant === 'check' && checked && <Check size={14} strokeWidth={2.5} />}
      {variant === 'filter' && <Filter size={14} />}
      {Icon && <Icon size={size === 'sm' ? 14 : 16} />}
      <span>{children}</span>
      {IconRight && <IconRight size={size === 'sm' ? 14 : 16} />}
      {hasChevron && <ChevronDown size={14} style={{ marginLeft: 2 }} />}
    </button>
  );
};
