import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, X, Search } from 'lucide-react';

export const Dropdown = ({
  options = [],
  value,
  onChange,
  placeholder = 'Select option',
  label,
  isMulti = false,
  isSearchable = false,
  size = 'md',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
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
      setSearchTerm('');
    }
  };

  const removeMultiTag = (tag, e) => {
    e.stopPropagation();
    if (Array.isArray(value)) {
      onChange(value.filter((v) => v !== tag));
    }
  };

  const filteredOptions = isSearchable && searchTerm.trim()
    ? options.filter((opt) => opt.label.toLowerCase().includes(searchTerm.toLowerCase()))
    : options;

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
          backgroundColor: '#FFFFFF',
          border: isOpen ? '1px solid #FF5A43' : '1px solid #CBD5E1',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          boxShadow: isOpen ? '0 0 0 2px rgba(255, 90, 67, 0.15)' : 'none',
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
                  backgroundColor: '#FFEBE8',
                  border: '1px solid #FF5A43',
                  borderRadius: '6px',
                  padding: '2px 6px',
                  fontSize: '12px',
                  color: '#FF5A43'
                }}
              >
                #{v}
                <X size={12} style={{ cursor: 'pointer' }} onClick={(e) => removeMultiTag(v, e)} />
              </span>
            ))
          ) : !isMulti && value ? (
            <span style={{ fontSize: '13px', color: '#0F172A', fontWeight: '700' }}>
              {options.find((o) => o.value === value)?.label || value}
            </span>
          ) : (
            <span style={{ fontSize: '13px', color: '#94A3B8' }}>{placeholder}</span>
          )}
        </div>

        <ChevronDown size={16} color="#64748B" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </div>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            zIndex: 9999,
            backgroundColor: '#FFFFFF',
            border: '1px solid #CBD5E1',
            borderRadius: '10px',
            boxShadow: '0 12px 28px rgba(15, 23, 42, 0.22)',
            maxHeight: '260px',
            overflowY: 'auto',
            padding: '6px'
          }}
        >
          {isSearchable && (
            <div style={{ position: 'relative', marginBottom: '6px', padding: '2px' }}>
              <input
                type="text"
                placeholder="Search options..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                style={{
                  width: '100%',
                  padding: '6px 10px 6px 28px',
                  fontSize: '12px',
                  borderRadius: '6px',
                  border: '1px solid #CBD5E1',
                  outline: 'none',
                  backgroundColor: '#F8FAFC'
                }}
              />
              <Search size={13} color="#64748B" style={{ position: 'absolute', left: '8px', top: '8px' }} />
            </div>
          )}

          {filteredOptions.length === 0 ? (
            <div style={{ padding: '10px 12px', fontSize: '12px', color: '#94A3B8', textAlign: 'center' }}>
              No matching options found
            </div>
          ) : (
            filteredOptions.map((opt) => {
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
                    fontWeight: isSelected ? '700' : '500',
                    color: isSelected ? '#FF5A43' : '#0F172A',
                    backgroundColor: isSelected ? '#FFEBE8' : 'transparent',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'background 0.12s'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = '#F8FAFC';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <span>{opt.label}</span>
                  {isSelected && <Check size={14} color="#FF5A43" />}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
