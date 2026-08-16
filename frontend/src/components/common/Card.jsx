import React from 'react';

export const Card = ({
  children,
  title,
  subtitle,
  icon: Icon,
  badge,
  action,
  className = '',
  style = {},
  headerStyle = {},
  bodyStyle = {},
  highlight = false
}) => {
  return (
    <div
      className={`custom-card ${highlight ? 'card-highlight' : ''} ${className}`}
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: highlight ? '1px solid var(--primary-orange)' : '1px solid var(--border-warm)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-card)',
        overflow: 'hidden',
        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        ...style
      }}
    >
      {(title || Icon || action || badge) && (
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-warm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            backgroundColor: 'var(--bg-surface)',
            ...headerStyle
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {Icon && (
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--primary-orange-soft)',
                  color: 'var(--primary-orange-dark)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Icon size={18} />
              </div>
            )}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {title && (
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-main)' }}>
                    {title}
                  </h3>
                )}
                {badge}
              </div>
              {subtitle && (
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {action && <div>{action}</div>}
        </div>
      )}

      <div style={{ padding: '20px', ...bodyStyle }}>
        {children}
      </div>
    </div>
  );
};
