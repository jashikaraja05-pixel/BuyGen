import React, { useState, useMemo } from 'react';
import { 
  Search, 
  ChevronUp, 
  ChevronDown, 
  ChevronsUpDown, 
  ChevronLeft, 
  ChevronRight, 
  X,
  Filter,
  SlidersHorizontal,
  LayoutList,
  LayoutGrid
} from 'lucide-react';

export interface ColumnDef<T> {
  id: string;
  header: React.ReactNode;
  accessor?: (item: T) => any;
  cell?: (item: T) => React.ReactNode;
  sortable?: boolean;
  sortKey?: (item: T) => string | number | Date | boolean;
  className?: string;
  headerClassName?: string;
  /** Hide column on tablet view (width < 1024px) */
  hideOnTablet?: boolean;
  /** Hide column on mobile view (width < 640px) */
  hideOnMobile?: boolean;
}

export interface FilterConfig {
  id: string;
  label: string;
  value: string;
  options: { label: string; value: string }[];
  onChange: (value: string) => void;
}

export interface DataTableProps<T> {
  title?: string;
  subtitle?: string;
  data: T[];
  columns: ColumnDef<T>[];
  keyExtractor: (item: T) => string;
  searchPlaceholder?: string;
  searchFilter?: (item: T, query: string) => boolean;
  filters?: FilterConfig[];
  defaultSort?: { columnId: string; direction: 'asc' | 'desc' };
  actions?: React.ReactNode;
  pageSize?: number;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
  onRowClick?: (item: T) => void;
  renderCard?: (item: T) => React.ReactNode;
}

export function DataTable<T>({
  title,
  subtitle,
  data,
  columns,
  keyExtractor,
  searchPlaceholder = 'Search records...',
  searchFilter,
  filters = [],
  defaultSort,
  actions,
  pageSize = 10,
  emptyMessage = 'No records found matching your filters.',
  emptyIcon,
  onRowClick,
  renderCard
}: DataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [sortColumn, setSortColumn] = useState<string | null>(defaultSort?.columnId || null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(defaultSort?.direction || 'asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Handle column sort toggle
  const handleSort = (columnId: string, isSortable?: boolean) => {
    if (!isSortable) return;
    if (sortColumn === columnId) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else {
        setSortColumn(null);
        setSortDirection('asc');
      }
    } else {
      setSortColumn(columnId);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  // Filtered data
  const filteredData = useMemo(() => {
    let result = [...data];

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      if (searchFilter) {
        result = result.filter(item => searchFilter(item, q));
      } else {
        // Default text search on all string/number fields
        result = result.filter(item => {
          return Object.values(item as any).some(val => {
            if (val === null || val === undefined) return false;
            if (typeof val === 'string' || typeof val === 'number') {
              return String(val).toLowerCase().includes(q);
            }
            return false;
          });
        });
      }
    }

    // Column sorting
    if (sortColumn) {
      const col = columns.find(c => c.id === sortColumn);
      if (col) {
        result.sort((a, b) => {
          let valA: any = col.sortKey ? col.sortKey(a) : col.accessor ? col.accessor(a) : (a as any)[sortColumn];
          let valB: any = col.sortKey ? col.sortKey(b) : col.accessor ? col.accessor(b) : (b as any)[sortColumn];

          if (valA === undefined || valA === null) valA = '';
          if (valB === undefined || valB === null) valB = '';

          if (typeof valA === 'string' && typeof valB === 'string') {
            return sortDirection === 'asc' 
              ? valA.localeCompare(valB) 
              : valB.localeCompare(valA);
          }

          if (valA instanceof Date && valB instanceof Date) {
            return sortDirection === 'asc' ? valA.getTime() - valB.getTime() : valB.getTime() - valA.getTime();
          }

          return sortDirection === 'asc' 
            ? (valA > valB ? 1 : valA < valB ? -1 : 0)
            : (valA < valB ? 1 : valA > valB ? -1 : 0);
        });
      }
    }

    return result;
  }, [data, search, searchFilter, sortColumn, sortDirection, columns]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  return (
    <div className="space-y-6">
      
      {/* 1. Header with Title & Action Button */}
      {(title || actions) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            {title && (
              <h1 className="font-heading font-black text-2xl sm:text-3xl text-slate-900 tracking-tight">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                {subtitle}
              </p>
            )}
          </div>
          {actions && (
            <div className="flex items-center gap-3">
              {actions}
            </div>
          )}
        </div>
      )}

      {/* 2. Controls Toolbar: Search & Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Search input with live clear */}
        <div className="relative flex-1 min-w-[220px]">
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:border-indigo-400 transition"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Dynamic Filters & View Toggle */}
        <div className="flex flex-wrap items-center gap-3">
          {filters.map((filter) => (
            <div key={filter.id} className="relative min-w-[140px] sm:min-w-[160px]">
              <select
                value={filter.value}
                onChange={(e) => {
                  filter.onChange(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full py-2 pl-3 pr-8 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white focus:outline-hidden focus:border-indigo-400 cursor-pointer transition appearance-none"
              >
                {filter.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-3 pointer-events-none" />
            </div>
          ))}

          {/* Cards / Table toggle on tablet & mobile */}
          {renderCard && (
            <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  viewMode === 'table' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Table View"
              >
                <LayoutList className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  viewMode === 'cards' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Card Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

      </div>

      {/* 3. Main Data Container (Table or Card Grid) */}
      {filteredData.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center space-y-3 shadow-xs">
          {emptyIcon && (
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              {emptyIcon}
            </div>
          )}
          <h3 className="font-heading font-bold text-base text-slate-800">
            No Records Found
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {emptyMessage}
          </p>
          {search && (
            <button
              onClick={() => setSearch('')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer pt-2"
            >
              Clear Search Query
            </button>
          )}
        </div>
      ) : viewMode === 'cards' && renderCard ? (
        /* Responsive Card Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedData.map((item) => (
            <div key={keyExtractor(item)} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-indigo-300 transition">
              {renderCard(item)}
            </div>
          ))}
        </div>
      ) : (
        /* Responsive Desktop & Tablet Table */
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider select-none">
                <tr>
                  {columns.map((col) => {
                    const isSorted = sortColumn === col.id;
                    const canSort = col.sortable !== false && Boolean(col.accessor || col.sortKey);

                    return (
                      <th
                        key={col.id}
                        onClick={() => handleSort(col.id, canSort)}
                        className={`py-3.5 px-4 font-bold ${col.headerClassName || ''} ${
                          canSort ? 'cursor-pointer hover:bg-slate-100/80 transition' : ''
                        } ${col.hideOnTablet ? 'hidden lg:table-cell' : ''} ${
                          col.hideOnMobile ? 'hidden sm:table-cell' : ''
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span>{col.header}</span>
                          {canSort && (
                            <span className="text-slate-400">
                              {isSorted ? (
                                sortDirection === 'asc' ? (
                                  <ChevronUp className="w-3.5 h-3.5 text-indigo-600 font-bold" />
                                ) : (
                                  <ChevronDown className="w-3.5 h-3.5 text-indigo-600 font-bold" />
                                )
                              ) : (
                                <ChevronsUpDown className="w-3 h-3 opacity-40 hover:opacity-100" />
                              )}
                            </span>
                          )}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {paginatedData.map((item) => (
                  <tr
                    key={keyExtractor(item)}
                    onClick={() => onRowClick && onRowClick(item)}
                    className={`transition ${
                      onRowClick ? 'cursor-pointer hover:bg-slate-50/80' : 'hover:bg-slate-50/50'
                    }`}
                  >
                    {columns.map((col) => (
                      <td
                        key={col.id}
                        className={`py-3.5 px-4 ${col.className || ''} ${
                          col.hideOnTablet ? 'hidden lg:table-cell' : ''
                        } ${col.hideOnMobile ? 'hidden sm:table-cell' : ''}`}
                      >
                        {col.cell 
                          ? col.cell(item) 
                          : col.accessor 
                          ? String(col.accessor(item) ?? '') 
                          : String((item as any)[col.id] ?? '')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. Footer Pagination & Status Information */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 pt-1">
        <div>
          <span>
            Showing <strong className="text-slate-900">{filteredData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}</strong> to{' '}
            <strong className="text-slate-900">{Math.min(currentPage * pageSize, filteredData.length)}</strong> of{' '}
            <strong className="text-slate-900">{filteredData.length}</strong> items
          </span>
          {sortColumn && (
            <span className="ml-2 text-indigo-600 font-semibold">
              (Sorted by {columns.find(c => c.id === sortColumn)?.header} {sortDirection.toUpperCase()})
            </span>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition shadow-2xs"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4 text-slate-700" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 rounded-xl font-bold text-xs transition cursor-pointer ${
                  currentPage === page
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition shadow-2xs"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4 text-slate-700" />
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
