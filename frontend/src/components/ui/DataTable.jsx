import React from 'react';

/**
 * Enterprise Data Table
 * - Strict dark background, thin 1px #252525 borders, compact rows
 * - JetBrains Mono for numbers, coordinates, timestamps
 * - Clear hover states and semantic status badges
 */
export function DataTable({
  columns = [], // [{ key, label, render?, align?: 'left'|'right'|'center', width? }]
  data = [],
  keyField = 'id',
  selectable = false,
  selectedKeys = [],
  onSelectKey,
  onSelectAll,
  emptyMessage = 'No records found',
  style = {},
  className = ''
}) {
  const allSelected = data.length > 0 && selectedKeys.length === data.length;
  const someSelected = selectedKeys.length > 0 && !allSelected;

  return (
    <div
      style={{
        width: '100%',
        overflowX: 'auto',
        border: '1px solid var(--border-primary)',
        borderRadius: 'var(--radius-card)',
        backgroundColor: 'var(--bg-surface)',
        ...style
      }}
      className={`ui-table-container ${className}`}
    >
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          textAlign: 'left',
          fontSize: 13,
          fontFamily: 'var(--font-primary)'
        }}
        className="ui-table"
      >
        <thead>
          <tr style={{ backgroundColor: 'var(--bg-surface-elevated)' }}>
            {selectable && (
              <th style={{ width: 40, padding: '10px 14px', textAlign: 'center' }}>
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => el && (el.indeterminate = someSelected)}
                  onChange={(e) => onSelectAll && onSelectAll(e.target.checked)}
                  style={{
                    accentColor: 'var(--brand-primary)',
                    cursor: 'pointer'
                  }}
                />
              </th>
            )}
            {columns.map((col) => (
              <th
                key={col.key}
                style={{
                  padding: '10px 14px',
                  color: 'var(--text-muted)',
                  fontSize: 11,
                  fontWeight: 500,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  borderBottom: '1px solid var(--border-primary)',
                  textAlign: col.align || 'left',
                  width: col.width || 'auto',
                  whiteSpace: 'nowrap'
                }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + (selectable ? 1 : 0)}
                style={{
                  padding: '36px 16px',
                  textAlign: 'center',
                  color: 'var(--text-muted)',
                  fontSize: 13
                }}
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, idx) => {
              const rowKey = row[keyField] || idx;
              const isSelected = selectedKeys.includes(rowKey);

              return (
                <tr
                  key={rowKey}
                  style={{
                    backgroundColor: isSelected ? 'var(--brand-tint)' : 'transparent',
                    transition: 'background-color var(--transition-fast)'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--bg-surface-secondary)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  {selectable && (
                    <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => onSelectKey && onSelectKey(rowKey, e.target.checked)}
                        style={{
                          accentColor: 'var(--brand-primary)',
                          cursor: 'pointer'
                        }}
                      />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      style={{
                        padding: '12px 14px',
                        borderBottom: idx === data.length - 1 ? 'none' : '1px solid var(--border-primary)',
                        color: 'var(--text-primary)',
                        textAlign: col.align || 'left',
                        verticalAlign: 'middle',
                        whiteSpace: col.nowrap ? 'nowrap' : 'normal'
                      }}
                    >
                      {col.render ? col.render(row[col.key], row) : (
                        col.isNumeric ? (
                          <span className="font-mono">{row[col.key]}</span>
                        ) : (
                          row[col.key]
                        )
                      )}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

export const TableRow = ({ children, style = {}, onClick }) => (
  <tr
    onClick={onClick}
    style={{
      borderBottom: '1px solid var(--border-primary)',
      cursor: onClick ? 'pointer' : 'default',
      ...style
    }}
  >
    {children}
  </tr>
);

export default DataTable;
