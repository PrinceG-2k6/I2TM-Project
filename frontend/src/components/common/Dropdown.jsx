import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, X } from 'lucide-react';

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
  const inputRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && isSearchable && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isSearchable]);

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

  // Selected label for single-select
  const selectedLabel = !isMulti && value
    ? options.find((o) => o.value === value)?.label || value
    : '';

  // Filter options by search term (only when searchable and open)
  const filteredOptions = isSearchable && searchTerm.trim()
    ? options.filter((opt) => opt.label.toLowerCase().includes(searchTerm.toLowerCase()))
    : options;

  const handleTriggerClick = () => {
    if (!isOpen) {
      setIsOpen(true);
      setSearchTerm('');
    } else {
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  return (
    <div ref={dropdownRef} className={`custom-dropdown-container relative w-full ${className}`}>
      {label && (
        <label className="block text-xs mb-1.5">
          {label}
        </label>
      )}

      {/* Trigger */}
      <div
        className={`flex items-center justify-between px-3 py-1.5 bg-(--color-5) rounded-sm duration-300 border ${
          size === 'sm' ? 'min-h-9' : 'min-h-10'
        } ${isOpen ? 'border-(--color-6)' : 'border-(--color-3)'}`}
      >
        <div className="flex flex-wrap gap-1.5 items-center flex-1 min-w-0">
          {/* Multi-select tags */}
          {isMulti && Array.isArray(value) && value.length > 0 ? (
            value.map((v) => (
              <span
                key={v}
                className="inline-flex items-center gap-1 bg-(--color-4) border border-(--color-3) rounded-sm px-1.5 py-0.5 text-xs"
              >
                {v}
                <X size={11} className="cursor-pointer" onClick={(e) => removeMultiTag(v, e)} />
              </span>
            ))
          ) : isSearchable && isOpen ? (
            // Inline search input — replaces the value display when open
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={selectedLabel || placeholder}
              className="flex-1 min-w-0 bg-transparent outline-none text-sm"
            />
          ) : value && !isMulti ? (
            <span className="text-sm truncate">{selectedLabel}</span>
          ) : (
            <span className="text-sm text-(--color-2)">{placeholder}</span>
          )}
        </div>

        <ChevronDown
          size={18}
          color="#64748B"
          className={`shrink-0 ml-2 transform transition-transform duration-200 cursor-pointer ${isOpen ? 'rotate-180' : ''}`}
          onClick={handleTriggerClick}
        />
        {/* Invisible overlay on the rest of the trigger */}
        <div className="absolute inset-0" onClick={!isSearchable || !isOpen ? handleTriggerClick : undefined} />
      </div>

      {/* Options List */}
      {isOpen && (
        <div className="absolute -bottom-1 translate-y-full left-0 right-0 z-[9999] bg-(--color-5) border border-(--color-3) rounded-sm max-h-64 overflow-y-auto p-1.5 space-y-1">
          {filteredOptions.length === 0 ? (
            <div className="py-2.5 px-3 text-xs text-(--color-2) text-center">
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
                  className={`px-3 py-2 text-sm rounded-sm flex items-center justify-between duration-150 border cursor-pointer bg-(--color-4) hover:border-(--color-3) ${
                    isSelected ? 'border-(--color-3) text-(--color-6)' : 'border-transparent'
                  }`}
                >
                  <span>{opt.label}</span>
                  {isSelected && <Check size={14} color="#1629d2" />}
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
