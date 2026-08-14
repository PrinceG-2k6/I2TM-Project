import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, X } from 'lucide-react';

export const Dropdown = ({
  options = [],
  value,
  onChange,
  placeholder = 'Select option',
  label,
  isMulti = false,
  size = 'md',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionValue) => {
    if (isMulti) {
      const currentValues = Array.isArray(value) ? value : [];
      if (currentValues.includes(optionValue)) {
        onChange(currentValues.filter((v) => v !== optionValue));
      } else {
        onChange([...currentValues, optionValue]);
      }
    } else {
      onChange(optionValue);
      setIsOpen(false);
    }
  };

  const removeMultiTag = (tag, e) => {
    e.stopPropagation();
    if (Array.isArray(value)) {
      onChange(value.filter((v) => v !== tag));
    }
  };

  return (
    <div ref={dropdownRef} className={`custom-dropdown-container ${className}`} style={{ position: 'relative', width: '100%' }}>
      {label && (
        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-body)', marginBottom: '6px' }}>
          {label}
        </label>
      )}

      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          minHeight: size === 'sm' ? '36px' : '42px',
          padding: '6px 12px',
          backgroundColor: 'var(--bg-surface)',
          border: isOpen ? '1px solid var(--primary-orange)' : '1px solid var(--border-warm)',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          boxShadow: isOpen ? '0 0 0 2px var(--primary-orange-soft)' : 'none',
          transition: 'all 0.15s ease'
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
          {isMulti && Array.isArray(value) && value.length > 0 ? (
            value.map((v) => (
              <span
                key={v}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  backgroundColor: 'var(--bg-surface-warm)',
                  border: '1px solid var(--border-warm)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '2px 6px',
                  fontSize: '12px',
                  color: 'var(--text-main)'
                }}
              >
                #{v}
                <X size={12} style={{ cursor: 'pointer' }} onClick={(e) => removeMultiTag(v, e)} />
              </span>
            ))
          ) : !isMulti && value ? (
            <span style={{ fontSize: '14px', color: 'var(--text-main)', fontWeight: '500' }}>
              {options.find((o) => o.value === value)?.label || value}
            </span>
          ) : (
            <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{placeholder}</span>
          )}
        </div>

        <ChevronDown size={16} color="var(--text-muted)" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </div>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            zIndex: 50,
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-warm)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-card)',
            maxHeight: '220px',
            overflowY: 'auto',
            padding: '4px'
          }}
        >
          {options.map((opt) => {
            const isSelected = isMulti
              ? Array.isArray(value) && value.includes(opt.value)
              : value === opt.value;

            return (
              <div
                key={opt.value}
                onClick={() => handleSelect(opt.value)}
                style={{
                  padding: '8px 12px',
                  fontSize: '13px',
                  fontWeight: isSelected ? '600' : '400',
                  color: isSelected ? 'var(--primary-orange-dark)' : 'var(--text-main)',
                  backgroundColor: isSelected ? 'var(--primary-orange-soft)' : 'transparent',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'background 0.12s'
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--bg-surface-warm)';
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <span>{opt.label}</span>
                {isSelected && <Check size={14} color="var(--primary-orange)" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
