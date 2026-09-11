import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Download,
  FileJson,
  Check,
  Copy,
  X,
  SlidersHorizontal,
  RefreshCw,
  Filter,
} from 'lucide-react';

export interface FilterOption {
  label: string;
  value: string;
}

export interface DataTableFilter<T> {
  key: string;
  label: string;
  options: FilterOption[];
  filterFn: (item: T, selectedValue: string) => boolean;
}

export interface DataTableColumn<T> {
  key: string;
  header: React.ReactNode;
  accessor?: (item: T) => any;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  width?: string | number;
  render?: (item: T, index: number) => React.ReactNode;
  searchable?: boolean;
}

export interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  keyExtractor: (item: T, index: number) => string;
  title?: string;
  subtitle?: string;
  searchPlaceholder?: string;
  defaultSortKey?: string;
  defaultSortDirection?: 'asc' | 'desc';
  pageSizeOptions?: number[];
  initialPageSize?: number;
  enableSelection?: boolean;
  selectableItemKey?: (item: T) => string;
  onRowClick?: (item: T) => void;
  headerActions?: React.ReactNode;
  emptyMessage?: string;
  exportFileName?: string;
  isSyncing?: boolean;
  syncStatusText?: string;
  onRefreshSync?: () => void;
  externalSearchQuery?: string;
  filters?: DataTableFilter<T>[];
}

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  title,
  subtitle,
  searchPlaceholder = 'Search records...',
  defaultSortKey,
  defaultSortDirection = 'asc',
  pageSizeOptions = [5, 10, 25, 50],
  initialPageSize = 10,
  enableSelection = true,
  selectableItemKey,
  onRowClick,
  headerActions,
  emptyMessage = 'No matching records found.',
  exportFileName = 'table_export',
  isSyncing = false,
  syncStatusText = 'AJAX Synced',
  onRefreshSync,
  externalSearchQuery,
  filters = [],
}: DataTableProps<T>) {
  // State
  const [searchQuery, setSearchQuery] = useState<string>(externalSearchQuery || '');
  const [sortKey, setSortKey] = useState<string | undefined>(defaultSortKey);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(defaultSortDirection);
  const [pageSize, setPageSize] = useState<number>(initialPageSize);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isCompact, setIsCompact] = useState<boolean>(false);
  const [copiedBatch, setCopiedBatch] = useState<boolean>(false);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState<boolean>(false);
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({});

  // Synchronize external search query
  useEffect(() => {
    if (externalSearchQuery !== undefined) {
      setSearchQuery(externalSearchQuery);
      setCurrentPage(1);
    }
  }, [externalSearchQuery]);

  // Sorting Handler
  const handleSort = (key: string, sortable?: boolean) => {
    if (!sortable) return;
    if (sortKey === key) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else {
        setSortKey(undefined);
        setSortDirection('asc');
      }
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  // Filter change handler
  const handleFilterChange = (filterKey: string, val: string) => {
    setSelectedFilters((prev) => {
      const next = { ...prev };
      if (!val || val === 'all') {
        delete next[filterKey];
      } else {
        next[filterKey] = val;
      }
      return next;
    });
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setSelectedFilters({});
    setSearchQuery('');
    setCurrentPage(1);
  };

  const activeFilterCount = Object.keys(selectedFilters).length;

  // Filter and Search
  const filteredData = useMemo(() => {
    let result = data;

    // 1. Apply column/custom filters
    if (filters.length > 0 && Object.keys(selectedFilters).length > 0) {
      result = result.filter((item) => {
        return filters.every((f) => {
          const selectedVal = selectedFilters[f.key];
          if (!selectedVal || selectedVal === 'all') return true;
          return f.filterFn(item, selectedVal);
        });
      });
    }

    // 2. Apply search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((item) => {
        return columns.some((col) => {
          if (col.searchable === false) return false;
          let val: any;
          if (col.accessor) {
            val = col.accessor(item);
          } else {
            val = (item as any)[col.key];
          }
          if (val === null || val === undefined) return false;
          return String(val).toLowerCase().includes(q);
        });
      });
    }

    return result;
  }, [data, columns, searchQuery, filters, selectedFilters]);

  // Sorted Data
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;

    const column = columns.find((c) => c.key === sortKey);
    if (!column) return filteredData;

    return [...filteredData].sort((a, b) => {
      const valA = column.accessor ? column.accessor(a) : (a as any)[sortKey];
      const valB = column.accessor ? column.accessor(b) : (b as any)[sortKey];

      if (valA === valB) return 0;
      if (valA === undefined || valA === null) return 1;
      if (valB === undefined || valB === null) return -1;

      let comparison = 0;
      if (typeof valA === 'number' && typeof valB === 'number') {
        comparison = valA - valB;
      } else if (valA instanceof Date && valB instanceof Date) {
        comparison = valA.getTime() - valB.getTime();
      } else {
        comparison = String(valA).localeCompare(String(valB), undefined, { numeric: true });
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [filteredData, sortKey, sortDirection, columns]);

  // Pagination Calculation
  const totalItems = sortedData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const activePage = Math.min(currentPage, totalPages);

  const paginatedData = useMemo(() => {
    const startIdx = (activePage - 1) * pageSize;
    return sortedData.slice(startIdx, startIdx + pageSize);
  }, [sortedData, activePage, pageSize]);

  // Selection Logic
  const getItemId = (item: T, index: number) => {
    if (selectableItemKey) return selectableItemKey(item);
    return keyExtractor(item, index);
  };

  const isAllPageSelected = useMemo(() => {
    if (paginatedData.length === 0) return false;
    return paginatedData.every((item, i) => selectedIds.has(getItemId(item, i)));
  }, [paginatedData, selectedIds]);

  const handleToggleSelectAll = () => {
    const next = new Set(selectedIds);
    if (isAllPageSelected) {
      paginatedData.forEach((item, i) => next.delete(getItemId(item, i)));
    } else {
      paginatedData.forEach((item, i) => next.add(getItemId(item, i)));
    }
    setSelectedIds(next);
  };

  const handleToggleRow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  // CSV Export
  const exportToCsv = (selectedOnly: boolean = false) => {
    const itemsToExport = selectedOnly
      ? sortedData.filter((item, i) => selectedIds.has(getItemId(item, i)))
      : sortedData;

    if (itemsToExport.length === 0) {
      alert('No records available to export.');
      return;
    }

    const exportHeaders = columns.map((c) => (typeof c.header === 'string' ? c.header : c.key));
    const rows = itemsToExport.map((item) =>
      columns.map((col) => {
        const val = col.accessor ? col.accessor(item) : (item as any)[col.key];
        return `"${String(val ?? '').replace(/"/g, '""')}"`;
      })
    );

    const csvContent = 'data:text/csv;charset=utf-8,' + [exportHeaders.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${exportFileName}_${selectedOnly ? 'selected_' : ''}${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // JSON Export
  const exportToJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(sortedData, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute('download', `${exportFileName}_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Bulk Copy
  const handleBulkCopy = () => {
    const selectedItems = sortedData.filter((item, i) => selectedIds.has(getItemId(item, i)));
    const textList = selectedItems
      .map((item: any) => item.username || item.name || item.id || JSON.stringify(item))
      .join('\n');
    navigator.clipboard.writeText(textList);
    setCopiedBatch(true);
    setTimeout(() => setCopiedBatch(false), 2000);
  };

  return (
    <div className="datatable-container">
      {/* Top Header / Title bar */}
      {(title || headerActions || subtitle) && (
        <div className="datatable-header">
          <div>
            {title && <h3 className="datatable-title">{title}</h3>}
            {subtitle && <p className="datatable-subtitle">{subtitle}</p>}
          </div>
          {headerActions && <div className="datatable-header-actions">{headerActions}</div>}
        </div>
      )}

      {/* Action Toolbar */}
      <div className="datatable-toolbar">
        {/* Search input */}
        <div className="datatable-search-wrap">
          <Search size={16} className="datatable-search-icon" />
          <input
            type="text"
            className="datatable-search-input"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
          {searchQuery && (
            <button
              className="datatable-search-clear"
              onClick={() => setSearchQuery('')}
              title="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Right utility buttons */}
        <div className="datatable-tools-right">
          {/* AJAX Sync Indicator / Trigger */}
          <button
            className={`datatable-btn-sync ${isSyncing ? 'syncing' : ''}`}
            onClick={onRefreshSync}
            title={onRefreshSync ? 'Click to re-sync via AJAX' : 'Data synchronized'}
          >
            <RefreshCw size={13} className={isSyncing ? 'datatable-spin' : ''} />
            <span className="hide-mobile">{isSyncing ? 'Syncing...' : syncStatusText}</span>
          </button>

          <div className="datatable-badge-count">
            <span>{totalItems} records</span>
          </div>

          {filters.length > 0 && (
            <button
              className={`datatable-btn-tool ${isFilterPanelOpen || activeFilterCount > 0 ? 'active' : ''}`}
              onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
              title="Toggle filters"
            >
              <Filter size={14} />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="datatable-filter-count-badge">{activeFilterCount}</span>
              )}
            </button>
          )}

          <button
            className={`datatable-btn-tool ${isCompact ? 'active' : ''}`}
            onClick={() => setIsCompact(!isCompact)}
            title="Toggle compact row view"
          >
            <SlidersHorizontal size={14} />
            <span className="hide-mobile">Density</span>
          </button>

          <button
            className="datatable-btn-tool"
            onClick={() => exportToCsv(false)}
            title="Export all filtered rows to CSV"
          >
            <Download size={14} />
            <span className="hide-mobile">CSV</span>
          </button>

          <button
            className="datatable-btn-tool"
            onClick={exportToJson}
            title="Export to JSON"
          >
            <FileJson size={14} />
            <span className="hide-mobile">JSON</span>
          </button>
        </div>
      </div>

      {/* Expandable Filter Panel */}
      {filters.length > 0 && isFilterPanelOpen && (
        <div className="datatable-filter-panel">
          <div className="datatable-filter-panel-title">
            <Filter size={14} color="var(--accent-purple)" />
            <span>Table Filters</span>
          </div>
          <div className="datatable-filter-grid">
            {filters.map((f) => (
              <div key={f.key} className="datatable-filter-group">
                <label className="datatable-filter-label">{f.label}</label>
                <select
                  className="datatable-filter-select"
                  value={selectedFilters[f.key] || 'all'}
                  onChange={(e) => handleFilterChange(f.key, e.target.value)}
                >
                  {f.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
          {activeFilterCount > 0 && (
            <button className="datatable-btn-clear-filters" onClick={clearAllFilters}>
              Reset Filters
            </button>
          )}
        </div>
      )}

      {/* Active Filter Chips Bar */}
      {(activeFilterCount > 0 || searchQuery) && (
        <div className="datatable-active-chips-bar">
          <span className="datatable-active-chips-label">Active:</span>
          {searchQuery && (
            <span className="datatable-filter-chip">
              Search: "{searchQuery}"
              <button onClick={() => setSearchQuery('')}>×</button>
            </span>
          )}
          {Object.entries(selectedFilters).map(([fKey, val]) => {
            const filterDef = filters.find((f) => f.key === fKey);
            const optLabel = filterDef?.options.find((o) => o.value === val)?.label || val;
            return (
              <span key={fKey} className="datatable-filter-chip">
                {filterDef?.label}: {optLabel}
                <button onClick={() => handleFilterChange(fKey, 'all')}>×</button>
              </span>
            );
          })}
          <button className="datatable-chip-clear-all" onClick={clearAllFilters}>
            Clear all
          </button>
        </div>
      )}

      {/* AJAX Sync Progress Bar */}
      {isSyncing && <div className="datatable-sync-bar"><div className="datatable-sync-indicator" /></div>}

      {/* Bulk Selection Bar */}
      {enableSelection && selectedIds.size > 0 && (
        <div className="datatable-bulk-bar">
          <div className="datatable-bulk-info">
            <span className="datatable-bulk-count">
              {selectedIds.size} row{selectedIds.size > 1 ? 's' : ''} selected
            </span>
            <button className="datatable-bulk-clear" onClick={clearSelection}>
              Clear selection
            </button>
          </div>
          <div className="datatable-bulk-actions">
            <button className="datatable-bulk-action-btn" onClick={handleBulkCopy}>
              {copiedBatch ? <Check size={14} color="var(--accent-green)" /> : <Copy size={14} />}
              <span>{copiedBatch ? 'Copied!' : 'Copy Usernames'}</span>
            </button>
            <button
              className="datatable-bulk-action-btn primary"
              onClick={() => exportToCsv(true)}
            >
              <Download size={14} />
              <span>Export Selected CSV</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Table Responsive Wrap */}
      <div className="datatable-table-wrap">
        <table className={`datatable-table ${isCompact ? 'compact' : ''}`}>
          <thead>
            <tr>
              {enableSelection && (
                <th className="datatable-th-checkbox">
                  <input
                    type="checkbox"
                    className="datatable-checkbox"
                    checked={isAllPageSelected}
                    onChange={handleToggleSelectAll}
                    title="Select all on this page"
                  />
                </th>
              )}
              {columns.map((col) => {
                const isSorted = sortKey === col.key;
                const alignClass =
                  col.align === 'right'
                    ? 'datatable-align-right'
                    : col.align === 'center'
                    ? 'datatable-align-center'
                    : '';
                const justifyClass =
                  col.align === 'right'
                    ? 'datatable-justify-right'
                    : col.align === 'center'
                    ? 'datatable-justify-center'
                    : 'datatable-justify-left';

                return (
                  <th
                    key={col.key}
                    onClick={() => handleSort(col.key, col.sortable)}
                    className={`${col.sortable ? 'sortable' : ''} ${alignClass}`.trim()}
                  >
                    <div className={`datatable-th-inner ${justifyClass}`}>
                      <span>{col.header}</span>
                      {col.sortable && (
                        <span className="datatable-sort-icon">
                          {isSorted ? (
                            sortDirection === 'asc' ? (
                              <ArrowUp size={13} color="var(--accent-purple)" />
                            ) : (
                              <ArrowDown size={13} color="var(--accent-purple)" />
                            )
                          ) : (
                            <ArrowUpDown size={13} />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (enableSelection ? 1 : 0)}
                  className="datatable-empty-cell"
                >
                  <div className="datatable-empty-state">
                    <p className="datatable-empty-text">{emptyMessage}</p>
                    {searchQuery && (
                      <button
                        className="datatable-btn-reset-search"
                        onClick={() => setSearchQuery('')}
                      >
                        Reset Search
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              paginatedData.map((item, index) => {
                const id = getItemId(item, index);
                const isSelected = selectedIds.has(id);

                return (
                  <tr
                    key={keyExtractor(item, index)}
                    className={`datatable-row ${isSelected ? 'selected' : ''} ${
                      onRowClick ? 'clickable' : ''
                    }`}
                    onClick={() => onRowClick?.(item)}
                  >
                    {enableSelection && (
                      <td
                        className="datatable-td-center"
                        onClick={(e) => handleToggleRow(id, e)}
                      >
                        <input
                          type="checkbox"
                          className="datatable-checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                        />
                      </td>
                    )}
                    {columns.map((col) => {
                      const cellValue = col.accessor
                        ? col.accessor(item)
                        : (item as any)[col.key];
                      const alignClass =
                        col.align === 'right'
                          ? 'datatable-align-right'
                          : col.align === 'center'
                          ? 'datatable-align-center'
                          : '';

                      return (
                        <td
                          key={col.key}
                          className={alignClass}
                        >
                          {col.render ? col.render(item, index) : cellValue}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer & Pagination */}
      <div className="datatable-footer">
        {/* Left: Entries per page & range */}
        <div className="datatable-footer-left">
          <label className="datatable-page-size-label">
            Rows per page:
            <select
              className="datatable-select-pagesize"
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </label>

          <span className="datatable-pagination-range">
            {totalItems === 0
              ? '0 of 0'
              : `${(activePage - 1) * pageSize + 1}–${Math.min(
                  activePage * pageSize,
                  totalItems
                )} of ${totalItems}`}
          </span>
        </div>

        {/* Right: Page buttons */}
        <div className="datatable-pagination-controls">
          <button
            className="datatable-page-btn"
            disabled={activePage <= 1}
            onClick={() => setCurrentPage(1)}
            title="First page"
          >
            <ChevronsLeft size={16} />
          </button>
          <button
            className="datatable-page-btn"
            disabled={activePage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            title="Previous page"
          >
            <ChevronLeft size={16} />
          </button>

          {/* Page numbers */}
          <div className="datatable-page-pills">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => {
                if (totalPages <= 5) return true;
                if (p === 1 || p === totalPages) return true;
                return Math.abs(p - activePage) <= 1;
              })
              .map((p, idx, arr) => {
                const prev = arr[idx - 1];
                const showEllipsis = prev && p - prev > 1;

                return (
                  <React.Fragment key={p}>
                    {showEllipsis && <span className="datatable-page-ellipsis">…</span>}
                    <button
                      className={`datatable-page-num ${p === activePage ? 'active' : ''}`}
                      onClick={() => setCurrentPage(p)}
                    >
                      {p}
                    </button>
                  </React.Fragment>
                );
              })}
          </div>

          <button
            className="datatable-page-btn"
            disabled={activePage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            title="Next page"
          >
            <ChevronRight size={16} />
          </button>
          <button
            className="datatable-page-btn"
            disabled={activePage >= totalPages}
            onClick={() => setCurrentPage(totalPages)}
            title="Last page"
          >
            <ChevronsRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
