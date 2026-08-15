const VARIANT_STYLES = {
  healthy: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  overloaded: 'bg-purple-50 text-purple-700 border-purple-200',
  degraded: 'bg-amber-50 text-amber-700 border-amber-200',
  critical: 'bg-red-50 text-red-700 border-red-200',
  disabled: 'bg-slate-50 text-slate-600 border-slate-200',
  orange: 'bg-orange-50 text-orange-700 border-orange-200',
  info: 'bg-blue-50 text-blue-700 border-blue-200',
  dark: 'bg-slate-900 text-white border-slate-700',
  default: 'bg-(--color-5) text-(--color-2) border-(--color-3)'
};

export const Badge = ({
  children,
  count,
  variant = 'healthy', // 'healthy' | 'overloaded' | 'degraded' | 'critical' | 'disabled' | 'orange' | 'info' | 'dark'
  size = 'md', // 'sm' | 'md'
  icon: Icon,
  pulsing = false,
  className = ''
}) => {
  const variantClass = VARIANT_STYLES[variant] || VARIANT_STYLES.default;
  const sizeClass = size === 'sm' ? 'px-1.5 py-0.5 text-xs gap-1' : 'px-2 py-0.5 text-xs gap-1.5';

  return (
    <span
      className={`rounded-full border whitespace-nowrap ${variantClass} ${sizeClass}`}
    >
      {Icon && <Icon size={size === 'sm' ? 12 : 14} />}
      {count !== undefined && <span>{count}</span>}
      <span>{children}</span>
    </span>
  );
};

export default Badge;
