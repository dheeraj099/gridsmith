import { useState, useCallback } from 'react'
import { Grid } from '../lib'
import type { ColumnDef } from '../lib'
import { generateRows } from './demo/data'
import { LayoutGrid } from 'lucide-react'

type Employee = {
  id: number
  name: string
  department: string
  role: string
  salary: number
  country: string
  status: 'Active' | 'On Leave' | 'Remote'
  startDate: string
  projects: number
}

const STATUS_COLOR: Record<string, string> = {
  Active: 'text-emerald-400 bg-emerald-400/10',
  Remote: 'text-blue-400 bg-blue-400/10',
  'On Leave': 'text-amber-400 bg-amber-400/10',
}

const COLUMNS: ColumnDef<Employee>[] = [
  {
    id: 'id',
    header: '#',
    accessorKey: 'id',
    width: 60,
    pinned: 'left',
    sortable: true,
    cell: (v) => <span className="text-zinc-600 font-mono text-xs">{String(v)}</span>,
  },
  {
    id: 'name',
    header: 'Name',
    accessorKey: 'name',
    width: 180,
    pinned: 'left',
    sortable: true,
    editable: true,
    cell: (v) => <span className="font-medium text-[#e4e4f0]">{String(v)}</span>,
  },
  {
    id: 'department',
    header: 'Department',
    accessorKey: 'department',
    width: 150,
    sortable: true,
    editable: true,
  },
  {
    id: 'role',
    header: 'Role',
    accessorKey: 'role',
    width: 180,
    sortable: true,
    editable: true,
  },
  {
    id: 'status',
    header: 'Status',
    accessorKey: 'status',
    width: 110,
    sortable: true,
    cell: (v) => (
      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${STATUS_COLOR[String(v)] ?? 'text-zinc-400 bg-zinc-400/10'}`}>
        {String(v)}
      </span>
    ),
  },
  {
    id: 'salary',
    header: 'Salary',
    accessorKey: 'salary',
    width: 120,
    sortable: true,
    editable: true,
    cell: (v) => (
      <span className="font-mono text-zinc-300">
        ${Number(v).toLocaleString()}
      </span>
    ),
  },
  {
    id: 'country',
    header: 'Country',
    accessorKey: 'country',
    width: 130,
    sortable: true,
  },
  {
    id: 'projects',
    header: 'Projects',
    accessorKey: 'projects',
    width: 100,
    sortable: true,
    cell: (v) => (
      <div className="flex items-center gap-2">
        <div className="flex-1 bg-[#2a2a38] rounded-full h-1.5 overflow-hidden">
          <div
            className="h-full bg-violet-500 rounded-full"
            style={{ width: `${Math.min(100, (Number(v) / 15) * 100)}%` }}
          />
        </div>
        <span className="text-xs text-zinc-500 w-4 text-right">{String(v)}</span>
      </div>
    ),
  },
  {
    id: 'startDate',
    header: 'Start Date',
    accessorKey: 'startDate',
    width: 120,
    sortable: true,
    cell: (v) => <span className="font-mono text-xs text-zinc-400">{String(v)}</span>,
  },
]

const INITIAL_DATA = generateRows(2000)

export default function App() {
  const [data, setData] = useState<Employee[]>(INITIAL_DATA)
  const [rowCount, setRowCount] = useState(2000)

  const handleRowChange = useCallback((rowIndex: number, updated: Employee) => {
    setData((prev) => {
      const next = [...prev]
      next[rowIndex] = updated
      return next
    })
  }, [])

  return (
    <div className="min-h-screen bg-[#0c0c10] text-[#e4e4f0] flex flex-col">
      {/* Header */}
      <header className="flex items-center gap-3 px-6 h-14 border-b border-[#1f1f2e] bg-[#111118] shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-violet-600/20 border border-violet-500/30 flex items-center justify-center">
            <LayoutGrid size={14} className="text-violet-400" />
          </div>
          <span className="text-lg font-bold tracking-tight text-[#e4e4f0]">gridsmith</span>
          <span className="text-xs text-zinc-600 border border-[#2a2a38] px-1.5 py-0.5 rounded ml-1">
            v1.0.0
          </span>
        </div>

        <span className="text-xs text-zinc-600 ml-4">
          Headless React data grid — virtualization · multi-sort · column pinning · inline editing · resize
        </span>

        <div className="flex-1" />

        <a
          href="https://github.com/dheeraj099/gridsmith"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          GitHub
        </a>
      </header>

      {/* Demo controls */}
      <div className="flex items-center gap-4 px-6 py-3 border-b border-[#1f1f2e] bg-[#0f0f15] shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500">Rows:</span>
          {[100, 500, 2000, 10000].map((n) => (
            <button
              key={n}
              onClick={() => {
                setRowCount(n)
                setData(generateRows(n))
              }}
              className={`text-xs px-2.5 py-1 rounded border transition-colors ${
                rowCount === n
                  ? 'text-violet-300 bg-violet-500/10 border-violet-500/30'
                  : 'text-zinc-500 border-[#2a2a38] hover:text-zinc-300 hover:border-zinc-600'
              }`}
            >
              {n.toLocaleString()}
            </button>
          ))}
        </div>

        <div className="h-4 w-px bg-[#2a2a38]" />

        <span className="text-xs text-zinc-600">
          Shift+click headers to multi-sort · Double-click Name/Dept/Role/Salary cells to edit
        </span>
      </div>

      {/* Feature pills */}
      <div className="flex items-center gap-2 px-6 py-2.5 border-b border-[#1f1f2e] bg-[#0c0c10] shrink-0 flex-wrap">
        {[
          'Virtual scrolling',
          'Multi-sort (Shift+click)',
          'Column pinning',
          'Inline editing',
          'Column resize',
          'Striped rows',
          'Custom cell renderers',
          'ARIA grid roles',
        ].map((f) => (
          <span
            key={f}
            className="text-[11px] text-zinc-500 bg-[#1c1c26] border border-[#2a2a38] px-2 py-0.5 rounded"
          >
            {f}
          </span>
        ))}
      </div>

      {/* Grid */}
      <div className="flex-1 p-4 min-h-0">
        <Grid
          data={data}
          columns={COLUMNS}
          rowHeight={36}
          overscan={8}
          onRowChange={handleRowChange}
          getRowId={(row) => row.id}
          style={{ height: '100%' }}
        />
      </div>

      <footer className="px-6 py-2 border-t border-[#1f1f2e] text-[11px] text-zinc-700 bg-[#111118]">
        {data.length.toLocaleString()} rows · {COLUMNS.length} columns · only visible rows rendered
      </footer>
    </div>
  )
}
