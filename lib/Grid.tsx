import React, { useEffect, useCallback, useRef } from 'react'
import type { GridOptions, ColumnDef } from './types'
import { useGridState } from './useGridState'
import { getCellValue } from './utils'

const DEFAULT_ROW_HEIGHT = 36
const RESIZE_HANDLE_WIDTH = 4

interface HeaderCellProps<TRow> {
  col: ColumnDef<TRow>
  width: number
  sorts: import('./types').SortState[]
  onSort: (id: string, multi: boolean) => void
  onResizeStart: (id: string, e: React.MouseEvent) => void
  sortIndex: number
  pinLeft?: number
  pinRight?: number
}

function HeaderCell<TRow>({
  col,
  width,
  sorts,
  onSort,
  onResizeStart,
  sortIndex,
  pinLeft,
  pinRight,
}: HeaderCellProps<TRow>) {
  const sort = sorts.find((s) => s.columnId === col.id)
  const isPinned = col.pinned === 'left' || col.pinned === 'right'

  return (
    <div
      role="columnheader"
      aria-sort={sort ? (sort.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
      style={{
        width,
        minWidth: width,
        position: isPinned ? 'sticky' : 'relative',
        left: col.pinned === 'left' ? pinLeft : undefined,
        right: col.pinned === 'right' ? pinRight : undefined,
        zIndex: isPinned ? 3 : 1,
      }}
      className={`
        gs-header-cell flex items-center px-3 text-xs font-semibold select-none
        border-b border-r border-[#2a2a38] bg-[#111118] text-[#8888a0] uppercase tracking-wide
        ${col.sortable !== false ? 'cursor-pointer hover:bg-[#181825] hover:text-zinc-300' : ''}
        ${isPinned ? 'shadow-[1px_0_0_#2a2a38]' : ''}
      `}
      onClick={(e) => col.sortable !== false && onSort(col.id, e.shiftKey)}
    >
      <span className="truncate flex-1">{col.header}</span>

      {sort && (
        <span className="ml-1 text-violet-400 flex items-center gap-0.5 shrink-0">
          {sort.direction === 'asc' ? '↑' : '↓'}
          {sorts.length > 1 && sortIndex >= 0 && (
            <span className="text-[9px] text-violet-600">{sortIndex + 1}</span>
          )}
        </span>
      )}

      {/* Resize handle */}
      <div
        role="separator"
        aria-orientation="vertical"
        style={{ width: RESIZE_HANDLE_WIDTH }}
        className="absolute right-0 top-0 h-full cursor-col-resize hover:bg-violet-500/60 z-10"
        onMouseDown={(e) => {
          e.stopPropagation()
          onResizeStart(col.id, e)
        }}
      />
    </div>
  )
}

interface DataCellProps<TRow> {
  col: ColumnDef<TRow>
  row: TRow
  rowIndex: number
  width: number
  isEditing: boolean
  editValue: unknown
  onEditStart: () => void
  onEditChange: (v: unknown) => void
  onEditCommit: () => void
  onEditCancel: () => void
  pinLeft?: number
  pinRight?: number
}

function DataCell<TRow>({
  col,
  row,
  rowIndex,
  width,
  isEditing,
  editValue,
  onEditStart,
  onEditChange,
  onEditCommit,
  onEditCancel,
  pinLeft,
  pinRight,
}: DataCellProps<TRow>) {
  const value = getCellValue(col, row)
  const isPinned = col.pinned === 'left' || col.pinned === 'right'

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') onEditCommit()
    if (e.key === 'Escape') onEditCancel()
  }

  return (
    <div
      role="gridcell"
      style={{
        width,
        minWidth: width,
        position: isPinned ? 'sticky' : 'relative',
        left: col.pinned === 'left' ? pinLeft : undefined,
        right: col.pinned === 'right' ? pinRight : undefined,
        zIndex: isPinned ? 2 : 0,
      }}
      className={`
        gs-cell flex items-center px-3 text-sm border-b border-r border-[#1f1f2e]
        overflow-hidden text-[#c4c4d4]
        ${isPinned ? 'bg-[#111118]' : 'bg-transparent'}
        ${col.editable ? 'cursor-text' : ''}
      `}
      onDoubleClick={() => col.editable && onEditStart()}
    >
      {isEditing ? (
        col.renderEditor ? (
          col.renderEditor(editValue, onEditChange, onEditCommit, onEditCancel)
        ) : (
          <input
            autoFocus
            value={editValue === null || editValue === undefined ? '' : String(editValue)}
            onChange={(e) => onEditChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={onEditCommit}
            className="w-full bg-transparent text-[#e4e4f0] outline-none border-b border-violet-500 text-sm font-mono"
          />
        )
      ) : col.cell ? (
        col.cell(value, row, rowIndex)
      ) : (
        <span className="truncate">{value === null || value === undefined ? '' : String(value)}</span>
      )}
    </div>
  )
}

export function Grid<TRow>(props: GridOptions<TRow>) {
  const { columns, rowHeight = DEFAULT_ROW_HEIGHT } = props

  const state = useGridState(props)
  const {
    sortedRows,
    sorts,
    colWidths,
    editingCell,
    editValue,
    visibleRows,
    offsetTop,
    totalHeight,
    startIndex,
    containerRef,
    toggleSort,
    resizeColumn,
    startEdit,
    commitEdit,
    cancelEdit,
    setEditValue,
    setScrollTop,
    setViewportHeight,
  } = state

  const resizingRef = useRef<{ colId: string; startX: number; startW: number } | null>(null)

  // Update viewport height on mount/resize
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(() => setViewportHeight(el.clientHeight))
    ro.observe(el)
    setViewportHeight(el.clientHeight)
    return () => ro.disconnect()
  }, [])

  // Column resize drag handlers
  const handleResizeStart = useCallback((colId: string, e: React.MouseEvent) => {
    e.preventDefault()
    resizingRef.current = { colId, startX: e.clientX, startW: colWidths[colId] ?? 150 }

    const onMove = (ev: MouseEvent) => {
      const r = resizingRef.current
      if (!r) return
      resizeColumn(r.colId, ev.clientX - r.startX)
      r.startX = ev.clientX
      r.startW = colWidths[r.colId]
    }
    const onUp = () => {
      resizingRef.current = null
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [colWidths, resizeColumn])

  // Compute pinned offsets
  const leftPins = columns.filter((c) => c.pinned === 'left')
  const rightPins = columns.filter((c) => c.pinned === 'right')

  function getPinLeft(colId: string): number | undefined {
    const idx = leftPins.findIndex((c) => c.id === colId)
    if (idx < 0) return undefined
    return leftPins.slice(0, idx).reduce((acc, c) => acc + (colWidths[c.id] ?? 150), 0)
  }

  function getPinRight(colId: string): number | undefined {
    const idx = rightPins.findIndex((c) => c.id === colId)
    if (idx < 0) return undefined
    return rightPins.slice(idx + 1).reduce((acc, c) => acc + (colWidths[c.id] ?? 150), 0)
  }

  const totalWidth = columns.reduce((acc, c) => acc + (colWidths[c.id] ?? 150), 0)

  return (
    <div
      role="grid"
      aria-rowcount={sortedRows.length + 1}
      aria-colcount={columns.length}
      className={`gs-grid flex flex-col overflow-hidden border border-[#2a2a38] rounded-lg text-sm ${props.className ?? ''}`}
      style={props.style}
    >
      {/* Header */}
      <div
        role="rowgroup"
        className="gs-header shrink-0 overflow-hidden"
        style={{ height: rowHeight }}
      >
        <div
          role="row"
          className="flex"
          style={{ width: totalWidth, height: rowHeight }}
        >
          {columns.map((col) => {
            const sortIdx = sorts.findIndex((s) => s.columnId === col.id)
            return (
              <HeaderCell
                key={col.id}
                col={col}
                width={colWidths[col.id] ?? 150}
                sorts={sorts}
                onSort={toggleSort}
                onResizeStart={handleResizeStart}
                sortIndex={sortIdx}
                pinLeft={getPinLeft(col.id)}
                pinRight={getPinRight(col.id)}
              />
            )
          })}
        </div>
      </div>

      {/* Body */}
      <div
        ref={containerRef}
        role="rowgroup"
        className="gs-body flex-1 overflow-auto"
        onScroll={(e) => setScrollTop((e.target as HTMLDivElement).scrollTop)}
        tabIndex={0}
      >
        <div style={{ height: totalHeight, width: totalWidth, position: 'relative' }}>
          <div style={{ transform: `translateY(${offsetTop}px)` }}>
            {visibleRows.map((row, vi) => {
              const rowIndex = startIndex + vi
              const isEven = rowIndex % 2 === 0
              return (
                <div
                  key={props.getRowId ? props.getRowId(row, rowIndex) : rowIndex}
                  role="row"
                  aria-rowindex={rowIndex + 2}
                  className={`gs-row flex ${isEven ? 'bg-[#0d0d11]' : 'bg-[#111118]/50'} hover:bg-[#181825] transition-colors`}
                  style={{ height: rowHeight }}
                >
                  {columns.map((col) => (
                    <DataCell
                      key={col.id}
                      col={col}
                      row={row}
                      rowIndex={rowIndex}
                      width={colWidths[col.id] ?? 150}
                      isEditing={
                        editingCell?.rowIndex === rowIndex && editingCell?.columnId === col.id
                      }
                      editValue={editValue}
                      onEditStart={() => startEdit(rowIndex, col.id)}
                      onEditChange={setEditValue}
                      onEditCommit={commitEdit}
                      onEditCancel={cancelEdit}
                      pinLeft={getPinLeft(col.id)}
                      pinRight={getPinRight(col.id)}
                    />
                  ))}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
