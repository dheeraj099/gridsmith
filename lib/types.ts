export type SortDirection = 'asc' | 'desc'

export interface SortState {
  columnId: string
  direction: SortDirection
}

export interface ColumnDef<TRow = unknown> {
  id: string
  header: string
  accessorKey?: keyof TRow
  accessorFn?: (row: TRow) => unknown
  width?: number
  minWidth?: number
  maxWidth?: number
  pinned?: 'left' | 'right' | false
  sortable?: boolean
  editable?: boolean
  cell?: (value: unknown, row: TRow, rowIndex: number) => React.ReactNode
  renderEditor?: (
    value: unknown,
    onChange: (v: unknown) => void,
    onCommit: () => void,
    onCancel: () => void
  ) => React.ReactNode
}

export interface GridOptions<TRow = unknown> {
  data: TRow[]
  columns: ColumnDef<TRow>[]
  rowHeight?: number
  overscan?: number
  onRowChange?: (rowIndex: number, updatedRow: TRow) => void
  getRowId?: (row: TRow, index: number) => string | number
  className?: string
  style?: React.CSSProperties
}

export interface GridState {
  sort: SortState[]
  columnWidths: Record<string, number>
}

export interface CellAddress {
  rowIndex: number
  columnId: string
}
