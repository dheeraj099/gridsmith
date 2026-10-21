import { useState, useCallback, useMemo, useRef } from 'react'
import type { SortState, GridOptions, CellAddress } from './types'
import { sortRows, getCellValue, clamp } from './utils'

const DEFAULT_COL_WIDTH = 150
const DEFAULT_ROW_HEIGHT = 36
const MIN_COL_WIDTH = 40

export function useGridState<TRow>(options: GridOptions<TRow>) {
  const { data, columns, rowHeight = DEFAULT_ROW_HEIGHT, overscan = 5, onRowChange } = options

  // Sort state (multi-sort)
  const [sorts, setSorts] = useState<SortState[]>([])

  // Column widths (overrides ColumnDef.width)
  const [colWidths, setColWidths] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {}
    for (const col of columns) init[col.id] = col.width ?? DEFAULT_COL_WIDTH
    return init
  })

  // Editing cell
  const [editingCell, setEditingCell] = useState<CellAddress | null>(null)
  const [editValue, setEditValue] = useState<unknown>(null)

  // Viewport state for virtualization
  const [scrollTop, setScrollTop] = useState(0)
  const [viewportHeight, setViewportHeight] = useState(400)
  const containerRef = useRef<HTMLDivElement | null>(null)

  // Sorted rows
  const sortedRows = useMemo(() => sortRows(data, sorts, columns), [data, sorts, columns])

  // Virtualized range
  const totalHeight = sortedRows.length * rowHeight
  const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan)
  const endIndex = Math.min(
    sortedRows.length,
    Math.ceil((scrollTop + viewportHeight) / rowHeight) + overscan
  )
  const visibleRows = sortedRows.slice(startIndex, endIndex)
  const offsetTop = startIndex * rowHeight

  // Sort toggle
  const toggleSort = useCallback((columnId: string, multi: boolean) => {
    setSorts((prev) => {
      const existing = prev.find((s) => s.columnId === columnId)
      if (multi) {
        if (!existing) return [...prev, { columnId, direction: 'asc' }]
        if (existing.direction === 'asc')
          return prev.map((s) => (s.columnId === columnId ? { ...s, direction: 'desc' } : s))
        return prev.filter((s) => s.columnId !== columnId)
      }
      if (!existing) return [{ columnId, direction: 'asc' }]
      if (existing.direction === 'asc') return [{ columnId, direction: 'desc' }]
      return []
    })
  }, [])

  // Column resize
  const resizeColumn = useCallback((columnId: string, delta: number) => {
    setColWidths((prev) => {
      const col = columns.find((c) => c.id === columnId)
      const min = col?.minWidth ?? MIN_COL_WIDTH
      const max = col?.maxWidth ?? 600
      return { ...prev, [columnId]: clamp((prev[columnId] ?? DEFAULT_COL_WIDTH) + delta, min, max) }
    })
  }, [columns])

  // Editing
  const startEdit = useCallback(
    (rowIndex: number, columnId: string) => {
      const col = columns.find((c) => c.id === columnId)
      if (!col?.editable) return
      const row = sortedRows[rowIndex]
      setEditingCell({ rowIndex, columnId })
      setEditValue(getCellValue(col, row))
    },
    [columns, sortedRows]
  )

  const commitEdit = useCallback(() => {
    if (!editingCell) return
    const { rowIndex, columnId } = editingCell
    const col = columns.find((c) => c.id === columnId)
    if (!col || !onRowChange) {
      setEditingCell(null)
      return
    }
    const row = sortedRows[rowIndex]
    const updated = { ...row }
    if (col.accessorKey) {
      ;(updated as Record<string, unknown>)[col.accessorKey as string] = editValue
    }
    onRowChange(rowIndex, updated)
    setEditingCell(null)
    setEditValue(null)
  }, [editingCell, columns, sortedRows, editValue, onRowChange])

  const cancelEdit = useCallback(() => {
    setEditingCell(null)
    setEditValue(null)
  }, [])

  return {
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
  }
}
