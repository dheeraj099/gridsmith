import type { ColumnDef, SortState } from './types'

export function getCellValue<TRow>(col: ColumnDef<TRow>, row: TRow): unknown {
  if (col.accessorFn) return col.accessorFn(row)
  if (col.accessorKey) return (row as Record<string | symbol, unknown>)[col.accessorKey as string]
  return undefined
}

export function sortRows<TRow>(
  rows: TRow[],
  sorts: SortState[],
  columns: ColumnDef<TRow>[]
): TRow[] {
  if (!sorts.length) return rows

  const colMap = new Map(columns.map((c) => [c.id, c]))

  return [...rows].sort((a, b) => {
    for (const sort of sorts) {
      const col = colMap.get(sort.columnId)
      if (!col) continue
      const aVal = getCellValue(col, a)
      const bVal = getCellValue(col, b)
      const cmp = compareValues(aVal, bVal)
      if (cmp !== 0) return sort.direction === 'asc' ? cmp : -cmp
    }
    return 0
  })
}

function compareValues(a: unknown, b: unknown): number {
  if (a === null || a === undefined) return b === null || b === undefined ? 0 : -1
  if (b === null || b === undefined) return 1
  if (typeof a === 'number' && typeof b === 'number') return a - b
  if (typeof a === 'boolean' && typeof b === 'boolean') return Number(a) - Number(b)
  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' })
}

export function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val))
}
