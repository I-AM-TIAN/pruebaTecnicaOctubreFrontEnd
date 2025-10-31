'use client';

import { Filter, X } from 'lucide-react';

export interface FilterConfig {
  key: string;
  label: string;
  type: 'select' | 'date' | 'text';
  options?: Array<{ value: string; label: string }>;
  placeholder?: string;
}

interface FiltersBarProps {
  filters: Record<string, any>;
  config: FilterConfig[];
  onFilterChange: (key: string, value: any) => void;
  onClear?: () => void;
  showClearButton?: boolean;
}

export function FiltersBar({
  filters,
  config,
  onFilterChange,
  onClear,
  showClearButton = true,
}: FiltersBarProps) {
  const hasActiveFilters = Object.values(filters).some(value => value !== '' && value !== null && value !== undefined);

  const handleClear = () => {
    config.forEach(field => {
      onFilterChange(field.key, '');
    });
    onClear?.();
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-5 h-5 text-gray-600" />
        <h3 className="text-sm font-semibold text-gray-900">Filtros</h3>
        {showClearButton && hasActiveFilters && (
          <button
            onClick={handleClear}
            className="ml-auto text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
          >
            <X className="w-4 h-4" />
            Limpiar filtros
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {config.map((field) => (
          <div key={field.key}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {field.label}
            </label>

            {field.type === 'select' && field.options && (
              <select
                value={filters[field.key] || ''}
                onChange={(e) => onFilterChange(field.key, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
              >
                <option value="">Todos</option>
                {field.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            )}

            {field.type === 'date' && (
              <input
                type="date"
                value={filters[field.key] || ''}
                onChange={(e) => onFilterChange(field.key, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
              />
            )}

            {field.type === 'text' && (
              <input
                type="text"
                value={filters[field.key] || ''}
                onChange={(e) => onFilterChange(field.key, e.target.value)}
                placeholder={field.placeholder}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
