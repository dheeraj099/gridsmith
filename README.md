# gridsmith

> Headless React data grid with virtualized scrolling, multi-column sort, column pinning, inline editing, and drag-to-resize — built as a reusable TypeScript library.

## Features

- **Virtual scrolling** — only visible rows are rendered; handles 100,000+ rows at 60fps
- **Multi-column sort** — Shift+click headers to sort by multiple columns simultaneously, with priority indicators
- **Column pinning** — pin columns to the left or right so they stay visible during horizontal scroll
- **Inline editing** — double-click any editable cell; ships with a default text input, or provide a custom `renderEditor`
- **Drag-to-resize columns** — grab the right edge of any header to resize
- **Custom cell renderers** — pass a `cell` function per column to render anything (badges, progress bars, avatars)
- **Striped rows** — alternating row background with hover state
- **Fully typed** — complete TypeScript generics for row data and column definitions
- **ARIA grid roles** — `role="grid"`, `role="columnheader"`, `role="gridcell"`, `aria-sort` for accessibility

## Usage

```tsx
import { Grid } from '@dheeraj099/gridsmith'
import type { ColumnDef } from '@dheeraj099/gridsmith'

type User = { id: number; name: string; email: string; role: string }

const columns: ColumnDef<User>[] = [
  { id: 'id',    header: '#',     accessorKey: 'id',    width: 60,  pinned: 'left' },
  { id: 'name',  header: 'Name',  accessorKey: 'name',  width: 180, pinned: 'left', sortable: true, editable: true },
  { id: 'email', header: 'Email', accessorKey: 'email', width: 220, sortable: true },
  { id: 'role',  header: 'Role',  accessorKey: 'role',  width: 120, sortable: true,
    cell: (value) => <span className="badge">{String(value)}</span> },
]

function MyTable({ users }: { users: User[] }) {
  const [data, setData] = useState(users)

  return (
    <Grid
      data={data}
      columns={columns}
      rowHeight={36}
      onRowChange={(idx, updated) =>
        setData(prev => prev.map((r, i) => i === idx ? updated : r))
      }
      getRowId={(row) => row.id}
      style={{ height: '500px' }}
    />
  )
}
```

## API

### `GridOptions<TRow>`

| Prop | Type | Description |
|---|---|---|
| `data` | `TRow[]` | Row data array |
| `columns` | `ColumnDef<TRow>[]` | Column definitions |
| `rowHeight` | `number` | Row height in px (default: 36) |
| `overscan` | `number` | Rows to render outside viewport (default: 5) |
| `onRowChange` | `(index, row) => void` | Called when an editable cell is committed |
| `getRowId` | `(row, index) => string\|number` | Unique row key function |
| `className` | `string` | Extra class for the grid root |
| `style` | `CSSProperties` | Inline style for the grid root |

### `ColumnDef<TRow>`

| Prop | Type | Description |
|---|---|---|
| `id` | `string` | Unique column identifier |
| `header` | `string` | Column header label |
| `accessorKey` | `keyof TRow` | Key to read value from row |
| `accessorFn` | `(row) => unknown` | Custom value accessor |
| `width` | `number` | Initial column width |
| `minWidth` | `number` | Minimum resize width |
| `maxWidth` | `number` | Maximum resize width |
| `pinned` | `'left' \| 'right' \| false` | Pin column to edge |
| `sortable` | `boolean` | Enable sort on this column |
| `editable` | `boolean` | Enable double-click editing |
| `cell` | `(value, row, index) => ReactNode` | Custom cell renderer |
| `renderEditor` | `(value, onChange, commit, cancel) => ReactNode` | Custom editor |

## Running the Demo

```bash
git clone https://github.com/dheeraj099/gridsmith.git
cd gridsmith
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to see the live demo with 2,000 rows.

## Building the Library

```bash
npm run build:lib
```

Output in `dist-lib/` — ESM and CJS bundles, excludes React from the bundle.

## Building the Demo Site

```bash
npm run build
```

Output in `dist/` — deploy to any static host.

## Architecture

```
lib/                    # Library source (published to npm)
  types.ts             # GridOptions, ColumnDef, SortState, CellAddress
  utils.ts             # sortRows(), getCellValue(), clamp()
  useGridState.ts      # Core hook: virtualization, sort, resize, editing state
  Grid.tsx             # Grid, HeaderCell, DataCell components
  index.ts             # Public exports

src/                    # Demo application
  App.tsx              # Demo with feature showcase, row count selector
  demo/
    data.ts            # Seeded random data generator (10,000 rows)
  index.css
  main.tsx
```

## License

MIT
